# Portfolio WebSocket Server

Real-time WebSocket server for portfolio website features.

## Features

- **Real-time visitor count** - Track and broadcast active visitors
- **Live updates** - Broadcast gallery/content updates in real-time
- **Notifications** - Send real-time notifications to all connected clients
- **Activity tracking** - Monitor user interactions
- **Health monitoring** - Server status and statistics endpoints

## Installation

```bash
cd websocket-server
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
PORT=3001
HOST=0.0.0.0
```

## Running Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3001`

## Deployment Options

### Railway
1. Connect your GitHub repository
2. Set root directory to `websocket-server`
3. Add environment variables
4. Deploy!

### Render
1. Create new Web Service
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Heroku
```bash
heroku create your-app-name
heroku config:set PORT=3001
git subtree push --prefix websocket-server heroku main
```

### DigitalOcean App Platform
1. Create new App
2. Select `websocket-server` directory
3. Set build/run commands
4. Deploy

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and connection count.

### Statistics
```
GET /stats
```

Returns detailed statistics about visitors and connections.

## WebSocket Events

### Client → Server

- `request-gallery-updates` - Request latest gallery updates
- `gallery-item-added` - Notify about new gallery item (authorized)
- `send-notification` - Broadcast notification (authorized)
- `client-activity` - Report user activity
- `ping` - Health check

### Server → Client

- `initial-data` - Initial data on connection
- `visitor-count-update` - Updated visitor count
- `gallery-update` - New gallery update
- `gallery-updates` - List of recent updates
- `notification` - Real-time notification
- `user-activity` - Other users' activity
- `pong` - Response to ping

## Security Notes

- Add authentication for write operations (`gallery-item-added`, `send-notification`)
- Rate limit connections to prevent abuse
- Validate all incoming data
- Use HTTPS/WSS in production
- Consider adding IP whitelisting for admin operations

## Environment Variables

- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `AUTH_TOKEN` - Optional authentication token
- `DATABASE_URL` - Optional database connection string

## Monitoring

The server logs:
- Client connections/disconnections
- Activity events
- Errors

Monitor these logs for insights into usage patterns.

