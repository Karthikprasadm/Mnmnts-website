const fs = require('fs');
const path = require('path');
const { setCORSHeaders, handleOptions } = require('./utils/cors');
const { generalRateLimiter } = require('./utils/rateLimit');

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  generalRateLimiter(req, res, () => {});
  if (res.statusCode === 429) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed.' });
    return;
  }

  const filePath = path.join(process.cwd(), 'assets', 'videos', 'videos-data.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.status(200).json(data);
  } catch (error) {
    console.error('Failed to read videos data:', error);
    res.status(500).json({ success: false, error: 'Failed to load videos data.' });
  }
};

