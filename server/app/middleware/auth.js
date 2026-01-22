const User = require("../models/User");

// Basic authentication check
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }
  next();
};

// Authentication with automatic session refresh
const requireAuthWithRefresh = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }

  try {
    // Verify user still exists
    const user = await User.findById(req.session.userId).select(
      "email name picture -_id",
    );

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        error: "User not found",
        message: "Please log in again",
      });
    }

    // Check if session is close to expiring and refresh it
    const cookieMaxAge = req.session.cookie.maxAge;
    const timeUntilExpiry = req.session.cookie._expires - Date.now();
    const refreshThreshold = cookieMaxAge * 0.5; // Refresh when 50% time has passed

    if (timeUntilExpiry < refreshThreshold) {
      // Reset the session cookie expiration
      req.session.cookie.maxAge = cookieMaxAge;

      console.log(`Session refreshed for user ${user.email}`);
    }

    // Attach user to request object for convenience
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "An error occurred while verifying your session",
    });
  }
};

// Optional: Check if cookie is expired or about to expire
const checkCookieExpiration = (req, res, next) => {
  if (!req.session || !req.session.cookie) {
    return next();
  }

  const now = Date.now();
  const expires = req.session.cookie._expires;

  if (expires && now >= expires) {
    // Cookie has expired
    req.session.destroy();
    return res.status(401).json({
      error: "Session expired",
      message: "Your session has expired. Please log in again.",
    });
  }

  // Check if cookie is about to expire (within 1 hour)
  const oneHour = 60 * 60 * 1000;
  if (expires && expires - now < oneHour) {
    req.sessionExpiringSoon = true;
  }

  next();
};

module.exports = {
  requireAuth,
  requireAuthWithRefresh,
  checkCookieExpiration,
};
