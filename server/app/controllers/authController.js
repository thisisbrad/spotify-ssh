const axios = require("axios");
const User = require("../models/User");
const { logSession } = require("../utils/logger");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const login = async (req, res) => {
  console.log(">>>", req.session);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT,
    redirect_uri: process.env.GOOGLE_CALLBACK_URI,
    response_type: "code",
    scope: "profile email",
    access_type: "offline",
    prompt: "consent",
  });
  const authURL = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  res.redirect(authURL);
};

const callback = async (req, res) => {
  console.log("=== OAUTH CALLBACK STARTED ===");
  const { code, error } = req.query;
  console.log("Query params:", { code, error });
  // Once I have React
  // if (error || !code) {
  //   return res.redirect(`${process.env.CLIENT_URL}?error=${error || 'no_code'}`);
  // }
  if (!code) {
    await logSession("failed_login", req, { reason: error || "no_code" });
    res
      .status(404)
      .json({ message: "The callback has no code", success: false });
  }

  try {
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_CLIENT,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URI,
      grant_type: "authorization_code",
    });

    const { access_token, expires_in, refresh_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    // console.log("User data", userInfoResponse.data);
    const { id, email, name, picture } = userInfoResponse.data;

    let user = await User.findOne({ googleId: id });
    const isNewUser = !user;

    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      user.picture = picture;
      user.access_token = access_token;
      user.expires_in = expires_in;
      user.refresh_token = refresh_token;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: id,
        email,
        name,
        picture,
        access_token,
        expires_in,
        refresh_token,
      });
    }

    // Save user ID in session
    req.session.userId = user._id;

    // Log successful login
    await logSession("login", req, {
      userId: user._id,
      isNewUser,
      email: user.email,
    });

    // Log session creation
    await logSession("session_created", req, {
      userId: user._id,
    });
    console.log("Setting session userId to:", user._id);
    console.log("Session ID:", req.sessionID);
    console.log("Full session object:", req.session);

    // Force session save
    // req.session.save((err) => {
    //   if (err) {
    //     console.error("Session save error:", err);
    //   } else {
    //     console.log("Session saved successfully");
    //   }
    res.redirect(process.env.CLIENT_URL);
    // });

    // res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error.message);
    // Log failed login
    await logSession("failed_login", req, {
      error: error.message,
      reason: "oauth_error",
    });
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
    // res
    //   .status(404)
    //   .json({ message: "The callback has an error", success: false });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  console.log("=== GET CURRENT USER ===");
  // console.log("Session data:", req.session);

  if (!req.session.userId) {
    console.log("No user ID in session - returning 401");
    return res.status(401).json({ user: null });
  }
  try {
    const user = await User.findById(req.session.userId).select(
      "email name picture -_id",
    );
    if (!user) {
      return res.status(401).json({ user: null });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const logout = async (req, res) => {
  console.log("LOGOUT");
  const userId = req.session?.userId;
  const sessionId = req.sessionID;

  req.session.destroy(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    // Log logout
    if (userId) {
      await logSession("logout", req, {
        userId,
        sessionId,
      });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};

module.exports = {
  login,
  logout,
  callback,
  getCurrentUser,
};
