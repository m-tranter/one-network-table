'use strict';

import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { processArr, makePages } from './helpers.js';
import { appInner, appOuter } from './ejsTemplates.js';
import { doFetch } from './doFetch.js';
import listTemplate from './listTemplate.js';
import ejs from 'ejs';

const pageSize = 15;

async function getEntries(req, res, password, user, url) {
  let items = [];
  let date = '';
  // get the XML
  let payload = await doFetch(password, user, url);
  if (payload.error && !payload.items) {
    console.log(payload.error);
  } else {
    items = processArr(payload.items);
    items.sort((a, b) => a.startDate - b.startDate);
    date = payload.date;
  }

  const pages = makePages([...items], pageSize);

  // Create the app body by injecting the template.
  const appBody = ejs.render(appInner, { template: listTemplate });

  // Use this to create script tags to be added in the head element.
  let head_end = ejs.render(appOuter, {
    appBody,
    items,
    date,
    pageSize,
    pages,
  });

  // Create a function with the app body.
  const createListApp = new Function(
    'date, items, pages,  pageSize, createSSRApp',
    appBody
  );

  // Make an instance of that function, with the data we need.
  const app = createListApp(date, items, pages, pageSize, createSSRApp);

  // Render and send to client.
  renderToString(app).then((html) => {
    res.render('index', {
      head_end,
      html,
    });
  });
}

export default getEntries;
