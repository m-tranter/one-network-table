'use strict';

import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { processArr, makePages } from './helpers.js';
import { appInner, appOuter } from './ejsTemplates.js';
import { doFetch } from './doFetch.js';
import listTemplate from './listTemplate.js';
import ejs from 'ejs';
import sendEmail from './sendEmail.js';

const pageSize = 15;

async function getEntries(
  req,
  res,
  password,
  user,
  url,
  transporter,
  EMAIL,
  TO,
) {
  const queries = req.url.split(/\?|&/);
  let entryId = queries.find((k) => k.startsWith("entryId"));
  let api = queries.find((k) => k.startsWith("api"));

  // Abort if no entryID.
  if (!entryId && !api) {
    res.sendFile(path.join(dir, "index.html"));
    return;
  } else if (entryId) {
    entryId = entryId.slice(8);
  }
  let items = [];
  let date = "";
  // get the XML
  let payload = await doFetch(user, password, url);
  if (payload.err && !payload.items) {
    console.log("Nothing to send");
    sendEmail(
      transporter,
      new Date().toLocaleString("en-GB"),
      payload.err.statusText,
      EMAIL,
      TO,
    );
  } else {
    items = processArr(payload.items);
    items.sort((a, b) => a.startDate - b.startDate);
    date = payload.date;
    if (api) {
      res.send(JSON.stringify({ date, items }));
      return;
    }
  }

  // Get the entry from the query string.
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/entries/${entryId}/?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: "get" },
  );

  // Abort if no data from the CMS.
  if (resp.status !== 200) {
    res.sendFile(path.join(dir, "index.html"));
    return;
  }

  let item = await resp.json();
  const title = item.entryTitle || "";
  const description = item.entryDescription || "";
  const h1 = item.h1 || "";
  let item_path = item.sys.uri;
  let published = prettyDate(new Date(item.sys.version.published));
  let myFeedback = ejs.render(feedback, { published, item_path, title });
  let hrefs = item_path.split("/").map((e) => (e = `/${e}`));
  let links = item_path.replace(/[-_]/g, " ").split("/");
  links[0] = "home";
  let classic = hrefs.map((e) => e.replace(/-/g, "_"));
  links = links.map(
    (e) => (e = e ? `${e[0].toUpperCase()}${e.slice(1).toLowerCase()}` : e),
  );
  let bc_inner = links.reduce((acc, l, i) => {
    acc =
      i === links.length - 1
        ? `${acc}<li class="breadcrumb-item">${l}</li>`
        : `${acc}<li class="breadcrumb-item"><a href="${classic
            .slice(0, i + 1)
            .join("")
            .replace("//", "/")}">${l}</a></li>`;
    return acc;
  }, "");
  let bc = ejs.render(breadcrumb, { bc_inner });

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
    "date, items, pages,  pageSize, createSSRApp",
    appBody,
  );
  // Make an instance of that function, with the data we need.
  const app = createListApp(date, items, pages, pageSize, createSSRApp);

  // Render and send to client.
  renderToString(app).then((html) => {
    res.render("index", {
      breadcrumb: bc,
      cookies,
      description,
      feedback: myFeedback,
      footer,
      h1,
      head_end,
      header,
      html,
      includes,
      reachdeck,
      site_search,
      title,
    });
  });
}

export default getEntries;
