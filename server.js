import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import { handler } from './build/handler.js'; // SvelteKit handler

const app = express();

// Removed body-parser middleware. SvelteKit handles body parsing automatically.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "https://cqthaatacrjtizijviwf.supabase.co", "data:"]
      }
    },
    referrerPolicy: {
      policy: ["same-origin"],
    },
  })
);

// Use the SvelteKit handler to process requests
app.use(handler);

const server = http.createServer(app);

// Gracefully shut down the server using terminus
createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT'],
  onSignal: async () => {
    // Optional cleanup (if any)
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Listening on port 3000');
});
