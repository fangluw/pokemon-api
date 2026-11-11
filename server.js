// Luwei Fang

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { pokemonRoute } from './routes/pokemon.route.js';

const app = new Hono();

app.route('/api/pokemon', pokemonRoute);

app.onError(function (err, c) {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof SyntaxError) {
    return c.json({ error: 'Malformed JSON payload' }, 400);
  }
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = Number(process.env.PORT) || 3000;
serve(
  {
    fetch: app.fetch,
    port: port
  },
  function () {
    console.log(`Pokemon API server running at http://localhost:${port}`);
  }
);