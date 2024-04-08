'use strict';


const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const ignoreRegEx = /Diversion route scheduled|Dates to be confimed/gi;
const idRegEx = /^[A-Z]{2}\d{2}.*$/;
const remRegEx = /Roadworks \/ License - |\(Cheshire East Council\)/g;

const stripDesc = (d) => {
  let temp = d
    .replace(remRegEx, '')
    .replace(idRegEx, '')
    .split('^#')
    .filter((e) => !e.includes('scheduled'));
  return temp.join('^#');
};

const makePages = (arr, pageSize) => {
  let count = arr.length;
  let pageCount = Math.ceil(count / pageSize);
  let pages = [...Array(pageCount)].map(() => arr.splice(0, pageSize));
  return pages;
};

const formatDate = (d) => {
  return d.toLocaleDateString('en-GB');
};

const prettyDate = (d) => {
  return d.toLocaleDateString('en-GB', dateOptions);
};

// Add dates, index and also do some formatting.
const processArr = (arr) => {
  arr = arr.filter((e) => !e.description.match(ignoreRegEx));
  arr.forEach((e, i) => {
    e.description = stripDesc(e.description);
    e.index = i;
    e.startDate = new Date(e.startDate);
    e.endDate = new Date(e.endDate);
    e.startDateString = formatDate(e.startDate);
    e.endDateString = formatDate(e.endDate);
    return e;
  });
  return arr;
};

export { processArr, makePages, prettyDate };
