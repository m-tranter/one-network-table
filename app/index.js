'use strict';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import bodyParser from 'body-parser';
import convert from 'xml-js';
import { fileURLToPath } from 'url';
//import {} from 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;


//Change these to reflect the details of your account.
const url = process.env.url;
const user = process.env.user;
const password = process.env.password;
const council = 'Cheshire East';
const app = express();
let cache;

// Optionally log all the environment variables.
//let env = Object.keys(process.env).map((k) => `${k}: ${process.env[k]}`);
//env.sort();
//env.forEach((e) => console.log(e));

// Functions
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

// Flatten & remove some unnecessary duplication.
const dedup = (arr) => {
  return arr.flat().reduce((acc, l) => {
    l = l.replace(`, ${council}`, '');
    return acc.includes(l) ? acc : [...acc, l];
  }, []);
};

// Ignore description items that are a single word.
const dedupDesc = (arr) => {
  return arr.reduce((acc, e) => {
    return e.split(' ').length === 1 ? acc : [...acc, initialCap(e)];
  }, []);
};

const initialCap = (str) => {
  return str.length ? `${str[0].toUpperCase()}${str.slice(1)}` : '';
};

// Function to fetch data from One Network.
const doFetch = (res) => {
  fetch(url, {
    headers: {
      Authorization: 'Basic ' + btoa(`${user}:${password}`),
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (cache) {
          res.send(JSON.stringify(cache));
        } else {
          res.status(404).send();
        }
      }
      return response.text();
    })
    .then((text) => {
      let data;
     
        data = JSON.parse(convert.xml2json(text, { compact: true, spaces: 4 }))[
          'SOAP-ENV:Envelope'
        ]['SOAP-ENV:Body'].d2LogicalModel.payloadPublication;

      let date = data.publicationTime._text;
      if (cache && cache.date === date) {
        console.log('Using cache.');
      } else {
        console.log(`Data updated: ${new Date(date).toLocaleString('en-GB')}`);
        let items = data.situation.reduce((acc, sit) => {
          let item = new Item(sit);
          let el = acc.find((e) => e.id === item.id);
          if (!el && item.locations !== 'None') {
            acc.push(item);
          }
          return acc;
        }, []);
        // Update cache.
        cache = { date, items };
      }
      res.send(JSON.stringify(cache));
    });
};

// Helper function to get location information.
const loc = function (obj) {
  let tpeg = obj.groupOfLocations?.tpegPointLocation?.point.name;
  if (tpeg) {
    return tpeg.reduce((acc, e) => {
      let text = e.descriptor.values.value._text.trim();
      if (text === council) {
        return acc;
      }
      if (text.includes('Ward') && acc.length) {
        if (!acc[acc.length - 1].includes(',')) {
          acc[acc.length - 1] += `, ${text.replace('Ward', '').trim()}`;
        }
        return acc;
      }
      if (acc[0] && text.startsWith(acc[0])) {
        return [text];
      }
      return [...acc, text];
    }, []);
  } else {
    let itinerary = obj.groupOfLocations?.locationContainedInItinerary;
    if (itinerary) {
      let point = itinerary[0].location.tpegPointLocation.point.name;
      return point
        ? [
            `${
              point[0].descriptor.values.value._text
            }, ${point[2].descriptor.values.value._text
              .replace('Ward', '')
              .trim()}`,
          ]
        : ['None'];
    } else {
      return ['None'];
    }
  }
};

// Constructor for main 'situation' object.
const Item = function (obj) {
  let rec = obj.situationRecord;
  if (Array.isArray(rec)) {
    this.locations = dedup(rec.map((e) => loc(e))).join('^#');
    Object.assign(this, new Details(rec[0]));
  } else {
    this.locations = loc(rec).join('^#');
    Object.assign(this, new Details(rec));
  }
};

// Separate constructor for the details part of the object.
const Details = function (obj) {
  this.severity = initialCap(obj.severity?._text) || '';
  this.id = obj.situationRecordCreationReference?._text || '';
  this.startDate =
    obj.validity.validityTimeSpecification.overallStartTime._text;
  this.endDate = obj.validity.validityTimeSpecification.overallEndTime._text;
  let comment = obj.generalPublicComment.comment.values.value;
  if (Array.isArray(comment)) {
    this.description = dedupDesc(comment.map((e) => initialCap(e._text))).join(
      '^#',
    );
  } else {
    this.description = initialCap(comment._text);
  }
  this.impact = obj.impact.delays.delaysType._text;
  this.url = obj.urlLink.urlLinkAddress._text;
  this.responsible =
    obj.situationRecordExtension.situationRecordExtended.responsibleOrganisation.responsibleOrganisationName._text;
  this.management = obj.generalNetworkManagementType?._text || '';
  this.extra = obj.nonGeneralPublicComment?.comment.values.value._text || '';
  this.worksCat =
    obj.situationRecordExtension.situationRecordExtended.worksCategory
      ?.description._text || '';
  this.worksState =
    obj.situationRecordExtension.situationRecordExtended.worksState?.description
      ._text || '';
};

app.use(cors());
app.use(express.static(dir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on port ${port}`);
    sendEmail(new Date().toLocaleString('en-GB'));
  } else {
    console.log(error);
  }
});

// Route
app.get('/*', (_, res) => {
  try {
    doFetch(res);
      } 
  catch (err) {
    sendEmail(err, res);
    }
});
