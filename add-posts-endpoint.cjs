const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importDescRegex = /import \{ eq, and \} from 'drizzle-orm';/;
if (code.match(importDescRegex)) {
  code = code.replace(importDescRegex, `import { eq, and, desc } from 'drizzle-orm';`);
}

const target = `app.get('/v1/public/:tenant_slug/institutions/:institution_slug/posts', async (req, res) => {`;
const newEndpoint = `app.get('/v1/public/:tenant_slug/posts', async (req, res) => {
  try {
    const items = await db.select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      postType: posts.postType,
      publishedAt: posts.publishedAt,
      institutionSlug: institutions.slug,
      institutionName: institutions.name
    })
    .from(posts)
    .leftJoin(institutions, eq(posts.institutionId, institutions.id))
    .orderBy(desc(posts.publishedAt))
    .limit(10);
    
    res.json({
      items: items.map(p => ({
        id: p.id,
        post_type: p.postType,
        title: p.title,
        excerpt: p.excerpt,
        published_at: p.publishedAt,
        institution_slug: p.institutionSlug,
        institution_name: p.institutionName || 'Yayasan Darussolah'
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

`;

if (!code.includes("'/v1/public/:tenant_slug/posts'")) {
  code = code.replace(target, newEndpoint + target);
}

fs.writeFileSync('server.ts', code);
console.log('Added /v1/public/:tenant_slug/posts endpoint');
