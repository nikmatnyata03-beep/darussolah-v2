/**
 * Cloudflare Workers Entry Point
 * 
 * This is the main entry point for the Cloudflare Workers runtime.
 * It uses Hono framework for routing and integrates with AI SDK for agent capabilities.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from '../types/cloudflare';
import { publicRoutes } from './routes/public';
import { privateRoutes } from './routes/private';
import { agentRoutes } from './routes/agents';

// Create Hono app with Cloudflare Workers types
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://edu-platform.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  exposeHeaders: ['X-Request-ID'],
  maxAge: 86400,
  credentials: true,
}));
app.use('*', secureHeaders());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    worker: 'edu-platform-workers'
  });
});

// Mount route modules
app.route('/v1/public', publicRoutes);
app.route('/v1/private', privateRoutes);
app.route('/api/agents', agentRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.path} not found`,
    path: c.req.path
  }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  
  const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  const message = c.env.ENVIRONMENT === 'production' 
    ? 'Internal server error' 
    : err instanceof Error ? err.message : 'Unknown error';
  
  return c.json({
    error: 'Internal Error',
    message,
    path: c.req.path
  }, status as any);
});

export default {
  fetch: app.fetch,
};
