import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/server/config';
import { initDatabase } from './src/server/db';
import { apiRouter } from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic Security & Body Parsers
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use((req: Request, _res: Response, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Initialize PostgreSQL / DB schemas
  console.log('🔄 Initializing Database & PostgreSQL schemas...');
  const dbStatus = await initDatabase();
  console.log(`ℹ️ [Database Status]: ${dbStatus.message}`);

  // Development vs Production Frontend Handling
  if (config.nodeEnv !== 'production') {
    // Dynamic import vite for dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: config.port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite development middleware attached to Express');
  } else {
    // Production static file serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`📦 Serving production build from ${distPath}`);
  }

  // Start HTTP listener
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 [Fandoq Full-Stack Server] running on http://0.0.0.0:${config.port}`);
    console.log(`🛡️  Environment: ${config.nodeEnv}`);
    console.log(`📊 Health Endpoint: http://localhost:${config.port}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
