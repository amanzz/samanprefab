import 'dotenv/config';
import app from './app';
import { config } from './config/index';

const server = app.listen(config.port, config.host, () => {
  console.warn(`[API] Server running on http://${config.host}:${config.port}`);
  console.warn(`[API] Environment: ${config.nodeEnv}`);
  console.warn(`[API] Health check: http://${config.host}:${config.port}/health`);
});

process.on('SIGTERM', () => {
  console.warn('[API] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.warn('[API] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.warn('[API] SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
