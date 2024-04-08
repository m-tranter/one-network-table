'use strict';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import getEntries from './getEntries.js';
import {} from 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;
const url = process.env.url;
const user = process.env.user;
const password = process.env.password;
const app = express();

function sendEmail(error, res = undefined) {
  const body = {
    auth: process.env.alias,
    subject: 'One Network - render.com.',
    text: error,
  };
  fetch('https://my-emailer.onrender.com/send', {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }).then((resp) => {
    if (res) {
      res.status(400).send();
    }
  });
}

const myLogger = function (req, _, next) {
  console.log(`Incoming: ${req.url}`);
  next();
};

app.use(express.json());
app.use(express.static(dir));
app.use(myLogger);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on port ${port}`);
    sendEmail(new Date().toLocaleString('en-GB'));
  } else {
    console.log(error);
  }
});

app.get('/', (req, res) => {
  try {
    getEntries(req, res, password, user, url);
  } catch (err) {
    res.status(400).send();
  }
});
