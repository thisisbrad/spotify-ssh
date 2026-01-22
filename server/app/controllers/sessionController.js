const checkSessionStatus = (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({
      authenticated: false,
      session: null,
    });
  }

  const now = Date.now();
  const expires = req.session.cookie._expires;
  const maxAge = req.session.cookie.maxAge;
  const timeRemaining = expires ? expires - now : maxAge;

  res.json({
    authenticated: true,
    session: {
      id: req.sessionID,
      expiresAt: expires,
      timeRemainingMs: timeRemaining,
      timeRemainingMinutes: Math.floor(timeRemaining / 1000 / 60),
      maxAgeMs: maxAge,
    },
  });
};

const refreshSession = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        error: "User not found",
        message: "Please log in again",
      });
    }

    const originalMaxAge = 1000 * 60 * 60 * 24 * 7; // 7 days (same as in server.js)

    req.session.cookie.maxAge = originalMaxAge;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          error: "Failed to refresh session",
          message: err.message,
        });
      }

      res.json({
        message: "Session refreshed successfully",
        expiresAt: req.session.cookie._expires,
        maxAgeMs: req.session.cookie.maxAge,
      });
    });
  } catch (error) {
    res.status(500).json({
      error: "Refresh failed",
      message: error.message,
    });
  }
};

module.exports = { checkSessionStatus, refreshSession };
