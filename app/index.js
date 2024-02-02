import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import bodyParser from 'body-parser';
import convert from 'xml-js';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const dir = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;

const url =
  'https://datacloud.one.network/?app_key=94db72b2-058e-2caf-94de16536c81';
const user = 'cheshireeast';
const password = 'Tkfdg58F]pjA';

app.listen(port, (error) => {
  if (!error) console.log(`Server running on port ${port}`);
  else console.log(error);
});
app.use(express.static(dir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dedup = (arr) => {
  return arr.reduce((acc, e) => {
    e.forEach((l) => {
      l = l.replace(', Cheshire East', '');
      if (l.split(' ').length === 1 && acc.some((e) => e.includes(l))) {
        return acc;
      }
      if (l.length && !acc.includes(l) && !l.includes('Ward')) {
        acc.push(l);
      }
    });
    return acc;
  }, []);
};

const Item = function (obj) {
  let rec = obj.situation.situationRecord;
  if (Array.isArray(rec)) {
    this.locations = rec.map((e) => loc(e));
    this.locations = dedup(this.locations).join('^#');
    Object.assign(this, new Details(rec[0]));
  } else {
    this.locations = loc(rec).join('^#');
    Object.assign(this, new Details(rec));
  }
};

const cap = (str) => {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};

const Details = function (obj) {
  let sev = obj.severity;
  this.id = obj.situationRecordCreationReference
    ? obj.situationRecordCreationReference._text
    : '';
  this.severity = sev ? cap(sev._text) : '';
  this.startDate =
    obj.validity.validityTimeSpecification.overallStartTime._text;
  this.endDate = obj.validity.validityTimeSpecification.overallEndTime._text;
  let comment = obj.generalPublicComment.comment.values.value;
  if (Array.isArray(comment)) {
    this.description = comment.map((e) => cap(e._text)).join('^#');
  } else {
    this.description = cap(comment._text);
    console.log(this.description);
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

const loc = function (obj) {
  try {
    return obj.groupOfLocations.tpegPointLocation.point.name.reduce(
      (acc, e) => {
        let temp = e.descriptor.values.value._text.trim();
        if (temp === 'Cheshire East') {
          return acc;
        }
        if (acc[0] && temp.startsWith(acc[0])) {
          return [temp];
        }
        return [...acc, temp];
      },
      []
    );
  } catch (err) {
    let temp = obj.groupOfLocations.locationContainedInItinerary;
    try {
      return [
        temp[0].location.tpegPointLocation.point.name[0].descriptor.values.value
          ._text,
      ];
    } catch (err) {
      return ['None'];
    }
  }
};

app.get('/*', (req, res) => {
  fetch(url, {
    headers: {
      Authorization: 'Basic ' + btoa(`${user}:${password}`),
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      let date = text
        .split(/\n\s*\n/)[0]
        .split('<publicationTime>')[1]
        .split('</publicationTime>')[0];
      let works = text.split(/\n\s*\n/).slice(1);
      let last = works.pop().split(/\n/).slice(0, -3);
      works.push(last);
      let temp = works.reduce((acc, sit) => {
        let v = JSON.parse(convert.xml2json(sit, { compact: true, spaces: 4 }));
        let item = new Item(v);
        let el = acc.find((e) => e.id === item.id);
        if (!el && item.locations !== 'None') {
          acc.push(item);
        }
        return acc;
      }, []);
      res.send(JSON.stringify({ date: date, items: temp }));
    });
});
