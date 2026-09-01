import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Public endpoints
app.get('/v1/public/:tenant_slug/foundation', (req, res) => {
  res.json({
    id: "f-123",
    name: "Yayasan Darussolah Wal Jinan",
    description: "Ekosistem pendidikan Islam",
    logo_url: "darussolah-assets/logo-yayasan-darussolah-wal-jinan.jpeg"
  });
});

app.get('/v1/public/:tenant_slug/institutions', (req, res) => {
  res.json({
    items: [
      { id: "i-1", slug: "tpq", name: "TPQ Darul Jinan", logo_url: "darussolah-assets/logo-tpq-darul-jinan.jpeg", description: "Taman Pendidikan Al-Quran" },
      { id: "i-2", slug: "mdt", name: "MDT Darussolah", logo_url: "darussolah-assets/logo-yayasan-darussolah-wal-jinan.jpeg", description: "Madrasah Diniyah Takmiliyah" },
      { id: "i-3", slug: "ra", name: "RA Darussolah", logo_url: "darussolah-assets/logo-ra-darussolah.jpeg", description: "Raudhatul Athfal" },
      { id: "i-4", slug: "rtq", name: "RTQ Darussolah", logo_url: "darussolah-assets/logo-rtq-darussolah.jpeg", description: "Rumah Tahfidz Al-Quran" }
    ]
  });
});

app.get('/v1/public/:tenant_slug/institutions/:institution_slug', (req, res) => {
  const { institution_slug } = req.params;
  res.json({
    id: `i-${institution_slug}`,
    name: `${institution_slug.toUpperCase()} Darussolah`,
    slug: institution_slug,
    description: "Mock institution description"
  });
});

app.get('/v1/public/:tenant_slug/institutions/:institution_slug/posts', (req, res) => {
  res.json({
    items: [
      {
        post_type: "Kegiatan",
        title: "Kegiatan Pembelajaran Semester Baru",
        excerpt: "Informasi mengenai kegiatan awal semester.",
        published_at: new Date().toISOString()
      },
      {
        post_type: "Pengumuman",
        title: "Pertemuan Wali Santri",
        excerpt: "Rapat koordinasi wali santri akan diadakan akhir bulan ini.",
        published_at: new Date().toISOString()
      }
    ]
  });
});

app.post('/v1/public/:tenant_slug/registrations', (req, res) => {
  res.status(201).json({
    id: "reg-123",
    application_no: "REG-" + Math.floor(Math.random() * 10000),
    status: "pending"
  });
});

// Private endpoints (Mock authenticated)
app.get('/v1/private/:tenant_slug/me', (req, res) => {
  res.json({
    tenant: { id: "t-123", name: "Darussolah" },
    user: { user_id: "u-123", role: "admin", display_name: "Admin Demo" }
  });
});

app.put('/v1/private/:tenant_slug/attendance', (req, res) => {
  res.json({ success: true });
});

// Serve static frontend files
app.use(express.static(__dirname));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
