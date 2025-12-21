// Utility to load JSON data files
const fs = require('fs');
const path = require('path');

// In Vercel serverless functions, we need to use process.cwd() or __dirname
function getDataPath(filename) {
  // For Vercel, files are relative to the function directory
  // Try multiple paths to handle different deployment scenarios
  const possiblePaths = [
    // Vercel production path
    path.join(process.cwd(), 'assets', 'images', filename),
    path.join(process.cwd(), 'assets', 'videos', filename),
    // Local development paths
    path.join(__dirname, '..', '..', 'assets', 'images', filename),
    path.join(__dirname, '..', '..', 'assets', 'videos', filename),
    // Alternative paths
    path.join(process.cwd(), '..', 'assets', 'images', filename),
    path.join(process.cwd(), '..', 'assets', 'videos', filename),
  ];
  
  for (const dataPath of possiblePaths) {
    try {
      if (fs.existsSync(dataPath)) {
        return dataPath;
      }
    } catch (e) {
      // Continue to next path
      continue;
    }
  }
  
  return null;
}

function loadJSON(filename) {
  try {
    const filePath = getDataPath(filename);
    if (!filePath) {
      // Fallback: try to construct a relative path
      const fallbackPath = path.join(process.cwd(), 'assets', filename.includes('video') ? 'videos' : 'images', filename);
      if (fs.existsSync(fallbackPath)) {
        const fileContent = fs.readFileSync(fallbackPath, 'utf8');
        return JSON.parse(fileContent);
      }
      throw new Error(`File not found: ${filename}. Tried paths: ${filePath || 'none'}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

// Note: saveJSON function removed as API is read-only
// If write functionality is needed in the future, implement with proper authentication

module.exports = {
  loadJSON,
  getDataPath,
};

