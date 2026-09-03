import { db } from '../db/index.ts';
import { institutions } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export const resolveTenant = async (req: any, res: any, next: any) => {
  const slug = req.params.tenant_slug;
  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug is required' });
  }

  try {
    const data = await db.select().from(institutions).where(eq(institutions.slug, slug));
    const institution = data[0];
    
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    req.tenantId = institution.id;
    req.tenantSlug = institution.slug;
    req.institution = institution;
    next();
  } catch (err) {
    console.error('Error resolving tenant:', err);
    res.status(500).json({ error: 'Failed to resolve institution context' });
  }
};
