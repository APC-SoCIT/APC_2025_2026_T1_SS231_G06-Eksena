const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const packageInfo = require('./package.json');
require('dotenv').config();

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[startup] Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const serviceVersion = (process.env.APP_VERSION ?? packageInfo.version ?? '0.0.0').trim();
const releaseId = (process.env.RELEASE_ID ?? process.env.RENDER_GIT_COMMIT ?? '').trim();
const apiKeys = new Set(
  (process.env.API_KEYS ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
);
const corsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOriginPatterns = corsOrigins.map(
  (originPattern) =>
    new RegExp(
      `^${originPattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')}$`
    )
);

function isAllowedOrigin(origin) {
  return corsOriginPatterns.some((pattern) => pattern.test(origin));
}

function readPositiveIntegerEnv(name, fallbackValue) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    console.warn(`[startup] Invalid ${name} value "${rawValue}". Falling back to ${fallbackValue}.`);
    return fallbackValue;
  }

  return parsedValue;
}

const ipRateLimitWindowMs = readPositiveIntegerEnv('IP_RATE_LIMIT_WINDOW_MS', 60_000);
const ipRateLimitMax = readPositiveIntegerEnv('IP_RATE_LIMIT_MAX', 120);
const apiKeyRateLimitWindowMs = readPositiveIntegerEnv('API_KEY_RATE_LIMIT_WINDOW_MS', 60_000);
const apiKeyRateLimitMax = readPositiveIntegerEnv('API_KEY_RATE_LIMIT_MAX', 60);

if (isProduction && corsOrigins.length === 0) {
  console.error('[startup] CORS_ORIGINS must be set in production.');
  process.exit(1);
}

if (isProduction && apiKeys.size === 0) {
  console.error('[startup] API_KEYS must be set in production.');
  process.exit(1);
}

if (!Number.isFinite(port) || port <= 0) {
  console.error(`[startup] Invalid PORT value: ${process.env.PORT ?? '(empty)'}`);
  process.exit(1);
}

if (!isProduction && apiKeys.size === 0) {
  console.warn('[startup] API_KEYS is not set. Using a development fallback key for /api routes.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin denied'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  })
);

const logRequestBodies = process.env.LOG_REQUEST_BODIES === 'true' && !isProduction;
app.use((req, res, next) => {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();
  res.setHeader('X-Request-Id', requestId);

  if (logRequestBodies && req.body && Object.keys(req.body).length > 0) {
    console.log(`[${new Date().toISOString()}] ${requestId} body=${JSON.stringify(req.body)}`);
  }

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });

  next();
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function findMissingFields(body, requiredFields) {
  return requiredFields.filter((field) => {
    const value = body[field];
    if (value === undefined || value === null) return true;
    return typeof value === 'string' && value.trim() === '';
  });
}

function extractApiKey(req) {
  const xApiKey = req.get('x-api-key');
  if (typeof xApiKey === 'string' && xApiKey.trim() !== '') {
    return xApiKey.trim();
  }

  const authorization = req.get('authorization');
  if (typeof authorization === 'string' && authorization.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authorization.slice(7).trim();
    return bearerToken === '' ? null : bearerToken;
  }

  return null;
}

function requireApiKey(req, res, next) {
  if (!isProduction && apiKeys.size === 0) {
    req.apiKey = 'development-fallback';
    return next();
  }

  const apiKey = extractApiKey(req);
  if (!apiKey || !apiKeys.has(apiKey)) {
    return res.status(401).json({ success: false, error: 'Missing or invalid API key' });
  }

  req.apiKey = apiKey;
  return next();
}

const ipRateLimiter = rateLimit({
  windowMs: ipRateLimitWindowMs,
  max: ipRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      error: 'Too many requests from this IP. Please retry later.',
    });
  },
});

const apiKeyRateLimiter = rateLimit({
  windowMs: apiKeyRateLimitWindowMs,
  max: apiKeyRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.apiKey,
  handler: (_req, res) => {
    return res.status(429).json({
      success: false,
      error: 'API key rate limit exceeded. Please retry later.',
    });
  },
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/version', (_req, res) => {
  const data = {
    service: 'e-ksena-backend',
    version: serviceVersion,
  };

  if (releaseId) {
    data.release = releaseId.slice(0, 12);
  }

  return res.status(200).json({ success: true, data });
});

app.get('/readyz', async (_req, res) => {
  try {
    const { error } = await supabase.from('reports').select('id').limit(1);
    if (error) {
      return res.status(503).json({
        success: false,
        status: 'degraded',
        error: 'Supabase readiness check failed',
      });
    }

    return res.status(200).json({ success: true, status: 'ready' });
  } catch {
    return res.status(503).json({
      success: false,
      status: 'degraded',
      error: 'Supabase readiness check failed',
    });
  }
});

app.use('/api', ipRateLimiter, requireApiKey, apiKeyRateLimiter);

app.post('/api/reports', async (req, res) => {
  const { title, content, user_id } = req.body ?? {};
  const missingFields = findMissingFields(req.body ?? {}, ['title', 'content']);
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const payload = {
      title: typeof title === 'string' ? title.trim() : title,
      content: typeof content === 'string' ? content.trim() : content,
    };
    if (user_id !== undefined && user_id !== null && user_id !== '') {
      payload.user_id = user_id;
    }

    const { data, error } = await supabase.from('reports').insert([payload]).select();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, message: 'Ticket created', data });
  } catch {
    return res.status(500).json({ success: false, error: 'Unable to create ticket' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { recipient_phone, body } = req.body ?? {};
  const missingFields = findMissingFields(req.body ?? {}, ['recipient_phone', 'body']);
  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const { error: dbError } = await supabase.from('messages').insert([
      {
        recipient_phone: String(recipient_phone).trim(),
        body: String(body).trim(),
        status: 'sent',
      },
    ]);
    if (dbError) throw dbError;

    return res.status(200).json({ success: true, message: 'SMS logged and dispatched.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to dispatch message',
    });
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.message === 'CORS origin denied') {
    return res.status(403).json({ success: false, error: 'Origin is not allowed by CORS' });
  }
  console.error('[error] Unhandled request error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`[startup] E-ksena Backend running on port ${port}`);
});

function shutdown(signal) {
  console.log(`[shutdown] Received ${signal}. Closing server...`);
  server.close(() => {
    console.log('[shutdown] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[shutdown] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));