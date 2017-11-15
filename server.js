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
const CLIENT_URL = process.env.CLIENT_URL;

// database setup //
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// middleware
app.use(cors());
app.use(bodyParser);
app.use(require('body-parser').json());

// proxy route
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

app.put('/v1/users/:username', (request, response) => {
  console.log(request.body);
  client.query(`
    UPDATE users
    SET pantry=$1, recipes=$2
    WHERE sterile_username=$3
    `,
    [request.body.pantry, request.body.recipes, request.params.username.toLowerCase()]
  )
    .then( () => response.sendStatus(201), err => response.send(err))
    .catch(console.error)
})

app.get('/v1/users/:username', bodyParser, (request, response) => {
  console.log(request.body);
    client.query(`
    SELECT * FROM users
    WHERE sterile_username = $1 AND password=$2
    `,
    [request.params.username, request.body.password]
  )
    .then((result) => response.send(results.rows), err => response.send(err))
    .catch(console.error)
})

app.post('/v1/users', bodyParser, (request, response) => {
  console.log(request.body);
  client.query(`
    INSERT INTO users(sterile_username, username, password)
    Values($1, $2, $3)`,
    [request.body.username.toLowerCase(), request.body.username, request.body.password]
  )
    .then( () => response.sendStatus(201), err => response.send(err))
    .catch(console.error)
})
// api endpoints
app.get('/test', (request, response) => response.send('Hello World'));
// app.get('/*', (request, response) => response.redirect(CLIENT_URL));


function createDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      sterile_username VARCHAR(255) UNIQUE,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      pantry VARCHAR(255),
      recipes VARCHAR(255)
    );`
    // CREATE TABLE IF NOT EXISTS pantry (
    //   ingredient_id SERIAL PRIMARY KEY,
    //   ingredient_name VARCHAR(255) NOT NULL
    // );
    //
    // CREATE TABLE IF NOT EXISTS recipes (
    //   recipe_id SERIAL PRIMARY KEY,
    //   recipe_name VARCHAR(255) NOT NULL,
    //   recipe_api_id VARCHAR(255) NOT NULL
    // );
  )
    .then(console.log('user tables exist now'))
    .catch(console.error)
//
}
createDB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
