import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import { handler } from './build/handler.js';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "https://cqthaatacrjtizijviwf.supabase.co"]
      }
    },
    referrerPolicy: {
      policy: ["same-origin"],
    },
  })
);

app.use(handler);

const server = http.createServer(app);

createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT'],
  onSignal: async () => {
    // Optional cleanup
  }
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});
