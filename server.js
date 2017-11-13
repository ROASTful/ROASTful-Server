'use strict';

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
// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', err => console.error(err));

// middleware
app.use(cors());

// proxy route
// http://food2fork.com/api/get?key={API_KEY}&rId=54384
app.get('/recipes/ingredient/:id', (req, res) => {
  console.log(`Ingredient request for ${req.params.id}`)
  const url = `http://food2fork.com/api/get?key=${process.env.RECIPE_TOKEN}&rId=${req.params.id}`
  superagent(url)
    .then(ingredients => res.send(ingredients.text), err => res.send(err));
});

// http://food2fork.com/api/search?key={API_KEY}&q=shredded%20chicken
app.get('/recipes/*', (req, res) => {
  console.log(`Recipes route for ${req.params[0]}`)
  const url = `http://food2fork.com/api/search?key=${process.env.RECIPE_TOKEN}&q=${req.params[0]}`
  superagent(url)
  .then(recipes => res.send(recipes.text), err => res.send(err));
});

// api endpoints
app.get('/test', (req, res) => res.send('Hello World'));

app.get('/*', (req, res) => res.redirect(CLIENT_URL));

// listen
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
