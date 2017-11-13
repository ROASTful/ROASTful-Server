'use strict';

console.log('iteration 3 loaded');
// app dependencies
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const fs = require('fs');
// const bodyParser = require('body-parser');
const bodyParser = require('body-parser').urlencoded({extended: true});
// app setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// middleware
app.use(cors());


// api endpoints

app.get('/*', (req, res) => res.redirect(CLIENT_URL));

// listen 
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
