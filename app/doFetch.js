//import {} from 'dotenv/config';
import convert from 'xml-js';

let cache;
const council = process.env.council;

// Flatten & remove some unnecessary duplication.
const dedup = (arr) => {
  arr = arr.flat().map((e) => e.replace(`, ${council}`, ''));
  return arr.reduce((acc, l) => {
    if (arr.some((el) => el.startsWith(l) && el.length > l.length)) {
      return [...acc];
    }
    if (!arr.some((el) => el.startsWith(l))) {
      return [...acc, l];
    }
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
  return str.length
    ? `${str[0].toUpperCase()}${str.slice(1).replace('\r\n', ' ')}`
    : '';
};

// Function to fetch data from One Network.
async function doFetch(password, user, url) {
  let soap;
  const data = await fetch(url, {
    headers: {
      Authorization: 'Basic ' + btoa(`${user}:${password}`),
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
    .then((data) => {
      return data.text();
    })
    .then((text) => {
      try {
        soap = JSON.parse(convert.xml2json(text, { compact: true, spaces: 4 }))[
          'SOAP-ENV:Envelope'
        ]['SOAP-ENV:Body'].d2LogicalModel.payloadPublication;
      } catch (err) {
        throw err;
      }
      let date = soap.publicationTime._text;
      if (cache && cache.date === date) {
        console.log('Using cache.');
      } else {
        console.log(`Data updated: ${new Date(date).toLocaleString('en-GB')}`);
        let items = soap.situation.reduce((acc, sit) => {
          let item = new Item(sit);
          let el = acc.find((e) => e.id === item.id);
          if (!el) {
            acc.push(item);
          }
          return acc;
        }, []);
        // Update cache.
        cache = { error: false, date, items };
      }
    })
    .catch((err) => {
      if (!cache || !cache.items) {
        cache = { error: true };
      }
    });
  return cache;
}

const getLoc = (name) => {
  let other = name.find(
    (e) => e.tpegOtherPointDescriptorType._text === 'other'
  );
  let area = name.find(
    (e) => e.tpegOtherPointDescriptorType._text === 'areaName'
  );
  let linkName = name.find(
    (e) => e.tpegOtherPointDescriptorType._text === 'linkName'
  );
  if (other) {
    return [other.descriptor.values.value._text];
  }
  if (linkName) {
    let loc = [linkName.descriptor.values.value._text];
    if (area) {
      loc[0] = `${loc[0]}, ${area.descriptor.values.value._text.replace('Ward', '').trim()}`;
    }
    return loc;
  }
  return ['None'];
};

// Helper function to get location information.
const loc = function (obj) {
  let group = obj.groupOfLocations;
  let tpeg = group?.tpegPointLocation?.point.name;
  let itinerary = group?.locationContainedInItinerary;
  let linear = group?.tpegLinearLocation;
  if (tpeg) {
    return getLoc(tpeg);
  } else if (itinerary && itinerary[0].location.tpegPointLocation.point.name) {
    return getLoc(itinerary[0].location.tpegPointLocation.point.name);
  } else if (linear && linear.from.name) {
    return getLoc(linear.from.name);
  } else {
    return ['None'];
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
      '^#'
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

export { doFetch };
