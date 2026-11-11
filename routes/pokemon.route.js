// Luwei Fang

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const pokemonRoute = new Hono();

let pokemons = [
  {
    id: 1,
    name: 'Pika',
    species: 'Pikachu',
    health: 100,
    level: 30,
    owner: 'Ash'
  }
];

function generateRandomId() {
  let id;
  do {
    id = Math.floor(100 + Math.random() * 900);
  } while (pokemons.some((p) => p.id === id));
  return id;
}

async function readBody(c) {
  const body = await c.req.json();
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HTTPException(400, { message: 'Request body must be a JSON object' });
  }
  return body;
}

pokemonRoute.get('/', function (c) {
  return c.json(pokemons, 200);
});

pokemonRoute.get('/:id', function (c) {
  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id)) {
    throw new HTTPException(400, { message: 'Pokemon ID must be an integer' });
  }

  const pokemon = pokemons.find((p) => p.id === id);
  if (!pokemon) {
    throw new HTTPException(404, { message: `Pokemon with ID ${id} not found` });
  }

  return c.json(pokemon, 200);
});


pokemonRoute.post('/', async function (c) {
  const body = await readBody(c);

  if (body.id !== undefined) {
    throw new HTTPException(400, {
      message: 'ID must not be included when creating a Pokemon'
    });
  }

  if (!body.species || typeof body.species !== 'string' || body.species.trim() === '') {
    throw new HTTPException(400, {
      message: 'Field "species" is required and cannot be empty'
    });
  }

  if (!body.owner || typeof body.owner !== 'string' || body.owner.trim() === '') {
    throw new HTTPException(400, {
      message: 'Field "owner" is required and cannot be empty'
    });
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
    throw new HTTPException(400, { message: 'Field "name" must be a non-empty string' });
  }
  const name = body.name !== undefined ? body.name.trim() : body.species.trim();

  const newPokemon = {
    id: generateRandomId(),
    name: name,
    species: body.species.trim(),
    health: Math.floor(Math.random() * 100) + 1,
    level: Math.floor(Math.random() * 100) + 1,
    owner: body.owner.trim()
  };

  pokemons.push(newPokemon);

  c.header('Location', `/api/pokemon/${newPokemon.id}`);
  return c.json(newPokemon, 201);
});


pokemonRoute.patch('/:id', async function (c) {
  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id)) {
    throw new HTTPException(400, { message: 'Pokemon ID must be an integer' });
  }

  const pokemon = pokemons.find((p) => p.id === id);
  if (!pokemon) {
    throw new HTTPException(404, { message: `Pokemon with ID ${id} not found` });
  }

  const body = await readBody(c);

  if (body.id !== undefined && body.id !== id) {
    throw new HTTPException(400, { message: 'Cannot modify Pokemon ID' });
  }

  if (body.species !== undefined) {
    if (typeof body.species !== 'string' || body.species.trim() === '') {
      throw new HTTPException(400, { message: 'Species cannot be empty' });
    }
  }

  if (body.owner !== undefined) {
    if (typeof body.owner !== 'string' || body.owner.trim() === '') {
      throw new HTTPException(400, { message: 'Owner cannot be empty' });
    }
  }

  if (body.health !== undefined) {
    if (typeof body.health !== 'number' || Number.isNaN(body.health) || body.health < 0) {
      throw new HTTPException(400, { message: 'Health must be a positive number' });
    }
  }

  if (body.level !== undefined) {
    if (typeof body.level !== 'number' || Number.isNaN(body.level) || body.level < 1) {
      throw new HTTPException(400, { message: 'Level must be a number greater than or equal to 1' });
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      throw new HTTPException(400, { message: 'Name cannot be empty' });
    }
  }

  if (body.name !== undefined) pokemon.name = body.name.trim();
  if (body.species !== undefined) pokemon.species = body.species.trim();
  if (body.health !== undefined) pokemon.health = body.health;
  if (body.level !== undefined) pokemon.level = body.level;
  if (body.owner !== undefined) pokemon.owner = body.owner.trim();

  return c.json(pokemon, 200);
});


pokemonRoute.delete('/:id', function (c) {
  const id = Number(c.req.param('id'));

  if (!Number.isInteger(id)) {
    throw new HTTPException(400, { message: 'Pokemon ID must be an integer' });
  }

  const index = pokemons.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new HTTPException(404, { message: `Pokemon with ID ${id} not found` });
  }

  pokemons.splice(index, 1);

  return c.body(null, 204);
});