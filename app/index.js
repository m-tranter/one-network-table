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
const app = express();
const dir = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;
app.use(cors());

function sendEmail(error) {
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
    return resp.ok;
  });
}

//Change these to reflect the details of your account.
const url = process.env.url;
const user = process.env.user;
const password = process.env.password;
const council = 'Cheshire East';

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server running on port ${port}`);
    sendEmail(new Date().toLocaleString('en-GB'));
  } else {
    console.log(error);
  }
});

app.use(express.static(dir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Declare the cache.
let cache;

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
  return  str.length ? `${str[0].toUpperCase()}${str.slice(1)}` : ''
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
  let sev = obj.severity;
  this.severity = initialCap(obj.severity?._text || '');
  this.id = obj.situationRecordCreationReference
    ? obj.situationRecordCreationReference._text
    : '';
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
  let man = obj.generalNetworkManagementType;
  this.management = man ? man._text : '';
  let ext = obj.nonGeneralPublicComment;
  this.extra = ext ? ext.comment.values.value._text : '';
  let cat = obj.situationRecordExtension.situationRecordExtended.worksCategory;
  this.worksCat = cat ? cat.description._text : '';
  let state = obj.situationRecordExtension.situationRecordExtended.worksState;
  this.worksState = state ? state.description._text : '';
};

// Helper function to get location information.
const loc = function (obj) {
  let tpeg = obj.groupOfLocations;
  if (tpeg && tpeg.groupOfLocations && tpeg.groupOfLocations.point.name) {
    return tpeg.groupOfLocations.point.name.reduce((acc, e) => {
      let temp = e.descriptor.values.value._text.trim();
      if (temp === council) {
        return acc;
      }
      if (temp.includes('Ward')) {
        if (!acc[acc.length - 1].includes(',')) {
          acc[acc.length - 1] += `, ${temp.replace('Ward', '').trim()}`;
        }
        return acc;
      }
      if (acc[0] && temp.startsWith(acc[0])) {
        return [temp];
      }
      return [...acc, temp];
    }, []);
  }
  let itinerary = obj.groupOfLocations;
  if (itinerary && itinerary.locationContainedInItinerary) {
    let point =
      itinerary.locationContainedInItinerary[0].location.tpegPointLocation.point
        .name;
    return point
      ? [
          `${
            point[0].descriptor.values.value._text
          }, ${point[2].descriptor.values.value._text
            .replace('Ward', '')
            .trim()}`,
        ]
      : ['None'];
  }
  return ['None'];
};

// Route
app.get('/*', async (req, res) => {
  doFetch()
    .then((data) => {
      res.send(JSON.stringify(data));
    })
    .catch((err) => {
      sendEmail(err);
      if (cache) {
        res.send(JSON.stringify(cache));
      }
      res.status(400).send();
    });
});

const doFetch = async () => {
  let res = await fetch(url, {
    headers: {
      Authorization: 'Basic ' + btoa(`${user}:${password}`),
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      let data = JSON.parse(
        convert.xml2json(text, { compact: true, spaces: 4 }),
      )['SOAP-ENV:Envelope']['SOAP-ENV:Body'].d2LogicalModel.payloadPublication;
      let date = data.publicationTime._text; 
      if (cache) console.log(`Cache: ${cache.date}`);
      console.log(`Data updated: ${date}`);
      if (cache && cache.date === date) {
        console.log('Using cache.');
        return cache;
      }
      // Get the situations from the XML.
      let situations = data.situation;
      let temp = situations.reduce((acc, sit) => {
        let item = new Item(sit);
        // Ignore duplicates or situations with no location info.
        let el = acc.find((e) => e.id === item.id);
        if (!el && item.locations !== 'None') {
          acc.push(item);
        }
        return acc;
      }, []);
      return { date, items: temp };
    });
  return res;
};

cache = await doFetch();
console.log(`Cached data at ${new Date(cache.date).toLocaleString('en-GB')}`);
