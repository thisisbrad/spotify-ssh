const login = async (req, res) => {
  res.status(200).json({ success: true });
};

const callback = async (req, res) => {
  res.status(200).json({ success: true });
};

const logout = async (req, res) => {
  res.status(200).json({ success: true });
};

module.exports = { login, logout, callback };
