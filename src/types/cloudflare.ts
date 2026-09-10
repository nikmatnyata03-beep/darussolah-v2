/**
 * Cloudflare Workers Environment Types
 * 
 * Defines the types for bindings, variables, and secrets
 * available in the Cloudflare Workers runtime.
 */

export interface Env {
  // Bindings
  AI: Ai;
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  
  // Variables (from wrangler.jsonc vars)
  ENVIRONMENT: 'development' | 'staging' | 'production';
  
  // Secrets (must be set via wrangler secret put)
  OPENAI_API_KEY?: string;
  FIREBASE_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  
  // Optional: Custom bindings
  MY_SERVICE?: Fetcher;
}

/**
 * AI Binding type from Cloudflare
 */
interface Ai {
  run(model: string, inputs: Record<string, any>): Promise<AiResponse>;
}

interface AiResponse {
  result: any;
  success: boolean;
  errors?: string[];
  messages?: string[];
}

/**
 * D1 Database binding
 */
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T>(query: string): Promise<D1Result<T>>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  success: boolean;
  meta?: {
    duration?: number;
    last_row_id?: number;
    changes?: number;
    served_by?: string;
  };
  results?: T[];
  error?: string;
}

/**
 * KV Namespace binding
 */
interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
  put(key: string, value: any, options?: { expiration?: number; expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: Array<{ name: string; expiration?: number }>; cursor?: string; complete?: boolean }>;
}

/**
 * R2 Bucket binding
 */
interface R2Bucket {
  get(key: string, options?: { onlyIf?: R2Conditional; range?: R2Range }): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: { httpMetadata?: R2HTTPMetadata; customMetadata?: Record<string, string> }): Promise<R2Object>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<R2Object | null>;
  list(options?: { prefix?: string; limit?: number; cursor?: string; delimiter?: string }): Promise<R2Objects>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  checksums: R2Checksums;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  range?: R2Range;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream<Uint8Array>;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

interface R2Objects {
  objects: R2Object[];
  delimitedPrefixes: string[];
  truncated: boolean;
  cursor?: string;
}

interface R2Conditional {
  etagIs?: string;
  etagMatches?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2Checksums {
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha384?: string;
  sha512?: string;
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

/**
 * Service binding type
 */
interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}
