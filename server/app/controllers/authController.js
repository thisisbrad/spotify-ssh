const axios = require("axios");
const User = require("../models/User");

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
  const { code, error } = req.query;
  // Once I have React
  // if (error || !code) {
  //   return res.redirect(`${process.env.CLIENT_URL}?error=${error || 'no_code'}`);
  // }
  if (!code) {
    res
      .status(404)
      .json({ message: "The callback has no code", success: false });
  }

  console.log(">>>", req.session);

  try {
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_CLIENT,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URI,
      grant_type: "authorization_code",
    });

    const { access_token, expires_in, refresh_token } = tokenResponse.data;
    // console.log("access token:", tokenResponse.data);

    const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    // console.log("User data", userInfoResponse.data);
    const { id, email, name, picture } = userInfoResponse.data;

    const user = await User.create({
      googleId: id,
      email,
      name,
      picture,
      access_token,
      expires_in,
      refresh_token,
    });

    // Save user ID in session
    req.session.userId = user._id;
    res.redirect(process.env.CLIENT_URL);

    // res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
    // res
    //   .status(404)
    //   .json({ message: "The callback has an error", success: false });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  if (!req.session.userId) {
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
  req.session.destroy(() => {
    res.status(200).json({ success: true, message: "Logged out of system." });
  });
};

module.exports = {
  login,
  logout,
  callback,
  getCurrentUser,
};
