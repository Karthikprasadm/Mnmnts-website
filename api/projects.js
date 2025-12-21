// Projects/Archive API Endpoint
const { setCORSHeaders, handleOptions } = require('../utils/cors');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/response');

// Projects data - this can be expanded to load from a JSON file or database
// For now, using sample data structure matching archive.js
const projectsData = [
  {
    id: 1,
    name: 'Interactive Web App',
    thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    tech: ['HTML', 'CSS', 'JavaScript'],
    description: 'A modern web app with real-time features and responsive design.',
    live: '#',
    github: '#',
    readme: 'This is a sample README snippet for Interactive Web App.',
    video: 'https://example.com/interactive-web-app.mp4',
    category: 'project',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mobile App Design',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    tech: ['React Native', 'Figma'],
    description: 'Beautiful mobile UI/UX for productivity on the go.',
    live: '#',
    github: '#',
    readme: 'This is a sample README snippet for Mobile App Design.',
    video: 'https://example.com/mobile-app-design.mp4',
    category: 'project',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

module.exports = async (req, res) => {
  setCORSHeaders(req, res);

  if (req.method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  try {
    // READ-ONLY: Only allow GET requests
    if (req.method !== 'GET') {
      res.status(405).json({ 
        success: false,
        error: 'Method not allowed. This API is read-only.',
        allowedMethods: ['GET']
      });
      return;
    }
    
    const { id, category } = req.query;
    
    let projects = [...projectsData];
    
    // Filter by category if provided
    if (category) {
      projects = projects.filter(p => p.category === category);
    }
    
    // Return specific project by ID
    if (id) {
      const project = projects.find(p => p.id === parseInt(id));
      if (!project) {
        notFoundResponse(res, 'Project');
        return;
      }
      successResponse(res, project);
    } else {
      // Return all projects
      successResponse(res, {
        projects,
        total: projects.length,
        categories: [...new Set(projects.map(p => p.category))]
      });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    errorResponse(res, 'Failed to fetch projects', 500, error.message);
  }
};

