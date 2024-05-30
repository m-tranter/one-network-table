'use strict';

//import {} from 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import getEntries from './getEntries.js';
import sendEmail from './sendEmail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;
const url = process.env.url;
const user = process.env.user;
const password = process.env.password;
const app = express();

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
  } else {
    console.log(error);
  }
});

app.get('/', (req, res) => {
  sendEmail(`Request from: ${req.ip}`);
  getEntries(req, res, password, user, url);
});
