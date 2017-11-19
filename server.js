'use strict';

// require('dotenv').config();
console.log('iteration 3 loaded');
// app dependencies
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const fs = require('fs');
// const bodyParser = require('body-parser');
const bodyParser = require('body-parser').urlencoded({extended: true});
// app setup
const app = express();
const PORT = process.env.PORT;
// const CLIENT_URL = process.env.CLIENT_URL;

// database setup //
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// middleware
app.use(cors());
app.use(bodyParser);
app.use(require('body-parser').json());

// ===============================================================
// ====================== PROXY ROUTES ===========================
// ===============================================================
// http://food2fork.com/api/get?key={API_KEY}&rId=54384
app.get('/recipes/ingredient/:id', (request, response) => {
  console.log(`Ingredient request for ${request.params.id}`)
  const url = `http://food2fork.com/api/get?key=${process.env.RECIPE_TOKEN}&rId=${request.params.id}`
  superagent(url)
    .then(ingredients => response.send(ingredients.text), err => response.send(err));
});

// http://food2fork.com/api/search?key={API_KEY}&q=shredded%20chicken
app.get('/recipes/search/*', (request, response) => {
  console.log(`Recipes route for ${request.params[0]}`)
  const url = `http://food2fork.com/api/search?key=${process.env.RECIPE_TOKEN}&q=${request.params[0]}`
  superagent(url)
  .then(recipes => response.send(recipes.text), err => response.send(err));
});

// ===============================================================
// ========================= GET ROUTES ==========================
// ===============================================================
app.get('/v1/users/:username/:password', (request, response) => {
  console.log(request.params);
  client.query(`
    SELECT * FROM users
    WHERE sterile_username = $1 AND password=$2
    `,
    [request.params.username, request.params.password]
  )
    .then((results) => response.send(results.rows[0]), err => response.send(err))
    .catch(console.error)
})

// ============ RETURNING USER ============ //
app.get('/returning/:user_id', (request, response) => {
  console.log(request.params);
  client.query(`
    SELECT * FROM users
    WHERE user_id=${request.params.user_id};
    `)
    .then((results) => response.send(results.rows[0]), err => response.send(err));
  })

app.get('/db/recipes/:recipe_id', (request, response) => {
  console.log(request.params);
  client.query(`
    SELECT * FROM recipes
    WHERE recipe_id='${request.params.recipe_id}';
    `)
    .then((results) => response.send(results.rows), err => response.send(err));
})

app.get('/savedrecipes', (request, response) => {
  client.query(`
    SELECT * FROM recipes;
    `)
    .then(results => response.send(results.rows), err => response.send(err));
})

// api endpoints
app.get('/test', (request, response) => response.send('Hello World'));
// app.get('/*', (request, response) => response.redirect(CLIENT_URL));

// ===============================================================
// ====================== POST ROUTES ============================
// ===============================================================
app.post('/v1/users', (request, response) => {
  console.log(request.body);
  client.query(`
    INSERT INTO users(sterile_username, username, password)
    Values($1, $2, $3)`,
    [request.body.username.toLowerCase(), request.body.username, request.body.password]
  )
  .then( () => response.sendStatus(201), err => response.send(err))
  .catch(console.error)
})

// ===============================================================
// ===================== PUT ROUTES =============================
// ===============================================================
app.put('/v1/users/:id', (request, response) => {
  console.log(request.body);
  client.query(`
    UPDATE users
    SET pantry=$1, recipes=$2
    WHERE user_id=$3
    `,
    [request.body.pantry, request.body.recipes, request.params.id]
  )
  .then( () => response.sendStatus(201), err => response.send(err))
  .catch(console.error)
})

app.post('/db/recipes/:recipeid', (request, response) => {
  console.log(request.body);
  client.query(`
    INSERT INTO recipes(recipe_id, image_url, ingredients, source_url, title)
    VALUES($1, $2, $3, $4, $5)
    `,
    [request.params.recipeid, request.body.image_url, JSON.stringify(request.body.ingredients), request.body.source_url, request.body.title]
  )
  .then( () => response.sendStatus(201), err => response.send(err))
  .catch(console.error)
})

createDB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));


// ===============================================================
// ========================= FUNCTIONS ===========================
// ===============================================================

function createDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      sterile_username VARCHAR(255) UNIQUE,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      pantry TEXT,
      recipes TEXT
    );
    CREATE TABLE IF NOT EXISTS recipes (
      recipe_id VARCHAR(10) UNIQUE,
      image_url VARCHAR(255),
      ingredients TEXT,
      source_url VARCHAR(255),
      title VARCHAR(255)
    );`
  )
    .then(console.log('user tables exist now'))
    .catch(console.error)
}

// CREATE TABLE IF NOT EXISTS pantry (
  //   ingredient_id SERIAL PRIMARY KEY,
  //   ingredient_name VARCHAR(255) NOT NULL
  // );
  //
