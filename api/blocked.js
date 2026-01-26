const { setCORSHeaders } = require('./utils/cors');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);
  res.status(403).json({ success: false, error: 'Forbidden' });
};

