# Cloudflare Workers Migration & Agent Tracing Setup

## ✅ Migrasi Selesai

Proyek ini telah dikonfigurasi untuk berjalan di **Cloudflare Workers** dengan dukungan **AI Agent Tracing**.

---

## 📋 Struktur Baru

```
/workspace
├── wrangler.jsonc              # Konfigurasi Workers (observability enabled)
├── src/
│   ├── workers/
│   │   ├── index.ts            # Entry point Workers
│   │   └── routes/
│   │       ├── public.ts       # Public API routes
│   │       ├── private.ts      # Private API routes
│   │       └── agents.ts       # AI Agent endpoints
│   ├── types/
│   │   └── cloudflare.ts       # TypeScript types untuk Workers
│   └── agents/                 # AI Agent definitions (optional)
├── package.json                # Dependencies updated
└── .dev.vars                   # Local development variables
```

---

## 🔧 Konfigurasi Observability & Tracing

### 1. **Wrangler Configuration** (`wrangler.jsonc`)

```json
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  },
  "ai": {
    "binding": "AI"
  }
}
```

**Fitur yang Diaktifkan:**
- ✅ **Tracing otomatis** untuk semua request
- ✅ **Logging terstruktur** ke Cloudflare Dashboard
- ✅ **AI binding** untuk Workers AI models
- ✅ **Sampling rate 100%** untuk development

### 2. **AI Agent Endpoints** (`src/workers/routes/agents.ts`)

Tiga endpoint AI telah dibuat:

#### **POST /api/agents/chat**
```bash
curl -X POST https://your-worker.workers.dev/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "@cf/meta/llama-3.1-8b-instruct"
  }'
```

#### **POST /api/agents/stream**
```bash
curl -X POST https://your-worker.workers.dev/api/agents/stream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "systemPrompt": "You are a helpful assistant"
  }'
```

#### **POST /api/agents/analyze**
```bash
curl -X POST https://your-worker.workers.dev/api/agents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"students": 100, "teachers": 10},
    "task": "calculate student-teacher ratio"
  }'
```

---

## 🚀 Cara Menggunakan

### **1. Setup Awal**

```bash
# Install dependencies (sudah dilakukan)
npm install

# Login ke Cloudflare
npx wrangler login

# Set secrets (ganti dengan credential Anda)
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put FIREBASE_API_KEY
npx wrangler secret put JWT_SECRET
```

### **2. Development Mode**

```bash
# Jalankan Workers lokal dengan tracing
npm run dev
```

Server akan berjalan di `http://localhost:8787`

**Test endpoints:**
```bash
# Health check
curl http://localhost:8787/health

# AI Chat
curl -X POST http://localhost:8787/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hi"}]}'

# List models
curl http://localhost:8787/api/agents/models
```

### **3. Deploy ke Production**

```bash
# Deploy
npm run deploy

# Lihat logs real-time dengan tracing
npm run tail
```

---

## 📊 Cloudflare Dashboard - Tracing

Setelah deploy, akses tracing di:

1. **Dashboard Cloudflare** → **Workers & Pages**
2. Pilih worker **`edu-platform-workers`**
3. Tab **Observability** → **Traces**
4. Filter by:
   - Request ID
   - Endpoint path
   - Status code
   - Time range

**Data yang tersedia:**
- ✅ Request/response headers
- ✅ Execution duration
- ✅ CPU time
- ✅ Memory usage
- ✅ Error stack traces
- ✅ AI model inference logs
- ✅ D1 query performance
- ✅ KV/R2 operations

---

## 🔍 Custom Tracing (Advanced)

Untuk custom instrumentation, tambahkan di `src/workers/index.ts`:

```typescript
// Manual tracing span
const span = c.executionCtx.tracer.startSpan('custom-operation');
try {
  // Your operation
  span.setAttribute('custom.tag', 'value');
} catch (error) {
  span.recordException(error);
  throw error;
} finally {
  span.end();
}
```

---

## ⚙️ Bindings yang Tersedia

| Binding | Type | Deskripsi |
|---------|------|-----------|
| `AI` | Ai | Cloudflare Workers AI |
| `DB` | D1Database | SQLite database |
| `KV` | KVNamespace | Key-value storage |
| `R2` | R2Bucket | Object storage |

---

## 🛠️ Troubleshooting

### **Error: "AI binding not found"**
```bash
# Pastikan AI binding ada di wrangler.jsonc
# Dan Workers AI feature enabled di akun Cloudflare
```

### **Traces tidak muncul**
```bash
# Cek observability.enabled = true di wrangler.jsonc
# Pastikan head_sampling_rate > 0
# Tunggu 1-2 menit setelah request
```

### **Local development tidak jalan**
```bash
# Update wrangler
npm install -g wrangler@latest

# Clear cache
npx wrangler clean
```

---

## 📚 Referensi

- [Cloudflare Workers Tracing](https://developers.cloudflare.com/agent-setup/tracing.md)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Hono Framework](https://hono.dev/)
- [AI SDK](https://sdk.vercel.ai/)

---

## ✅ Checklist Migrasi

- [x] Install dependencies (ai, @ai-sdk/openai, wrangler, hono, zod)
- [x] Buat wrangler.jsonc dengan observability enabled
- [x] Setup entry point Workers (src/workers/index.ts)
- [x] Buat type definitions (src/types/cloudflare.ts)
- [x] Implementasi routes (public, private, agents)
- [x] Konfigurasi AI binding
- [x] Setup environment variables template
- [ ] Set secrets via `wrangler secret put`
- [ ] Setup D1 database (optional)
- [ ] Deploy dan test tracing

---

**Status**: ✅ Siap untuk development dan deployment!
