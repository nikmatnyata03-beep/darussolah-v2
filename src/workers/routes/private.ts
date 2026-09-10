import { Hono } from 'hono';
import type { Env } from '../../types/cloudflare';

export const privateRoutes = new Hono<{ Bindings: Env }>();

// Middleware untuk autentikasi (placeholder)
privateRoutes.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // TODO: Implement JWT validation
  await next();
});

// Contoh endpoint private
privateRoutes.get('/:tenant_slug/admin/stats', async (c) => {
  const tenantSlug = c.req.param('tenant_slug');
  
  return c.json({
    tenant: tenantSlug,
    stats: {
      students: 0,
      teachers: 0,
      classes: 0
    }
  });
});

// Endpoint attendance
privateRoutes.put('/:tenant_slug/attendance', async (c) => {
  const tenantSlug = c.req.param('tenant_slug');
  const body = await c.req.json();
  
  return c.json({
    message: 'Attendance updated',
    tenant: tenantSlug,
    data: body
  });
});

// Endpoint learning submissions
privateRoutes.post('/:tenant_slug/learning/submissions', async (c) => {
  const tenantSlug = c.req.param('tenant_slug');
  const body = await c.req.json();
  
  return c.json({
    message: 'Submission created',
    tenant: tenantSlug,
    data: body
  }, 201);
});
