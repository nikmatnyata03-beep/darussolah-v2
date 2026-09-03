const { db } = require('./src/db/index.ts');
const { posts, institutions } = require('./src/db/schema.ts');
const { eq, desc } = require('drizzle-orm');

async function run() {
  const allPosts = await db.select({
    id: posts.id,
    title: posts.title,
    excerpt: posts.excerpt,
    postType: posts.postType,
    publishedAt: posts.publishedAt,
    institutionSlug: institutions.slug,
    institutionName: institutions.name
  }).from(posts).leftJoin(institutions, eq(posts.institutionId, institutions.id)).orderBy(desc(posts.publishedAt)).limit(4);
  console.log(allPosts);
}
run();
