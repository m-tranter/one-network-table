const appInner = `
return createSSRApp({
  data: () => ({
          opts:  {
            googleAPIKey: 'AIzaSyDG00gQi_7ApZ54lG6mOu6ov-fNLl7lpOg',
            organisationID: 1451,
            embedded: true,
            data: {
              layersActive: [
                'INCIDENTS_LIVE_INCIDENT',
                'INCIDENTS_LIVE_ACCIDENT',
                'INCIDENTS_LIVE_WEATHER',
                'INCIDENTS_LIVE_LANDSLIP',
                'INCIDENTS_LIVE_FLOOD',
                'INCIDENTS_LIVE_ROADCLOSURE',
                'INCIDENTS_LIVE_LANECLOSURE',
                'INCIDENTS_LIVE_HGVCLOSURE',
                'TM_LAYER_ROADCLOSURE_LIVE',
                'TM_LAYER_DIVERSIONROUTE_LIVE',
                'TM_LAYER_HGVDIVERSIONROUTE_LIVE',
                'TM_LAYER_TEMPORARYONEWAY_LIVE',
                'TM_LAYER_BRIDGECLOSURE_LIVE',
                'TM_LAYER_LANECLOSURE_LIVE',
                'TM_LAYER_FOOTWAYCLOSURE_LIVE',
                'TM_LAYER_TEMPORARYSPEEDLIMIT_LIVE',
                'TM_LAYER_WEIGHTRESTRICTION_LIVE',
                'TM_LAYER_SUSPENSIONWEIGHTRESTRICTION_LIVE',
                'TM_LAYER_CLEARWAY_LIVE',
                'TM_LAYER_TOWAWAYZONE_LIVE',
                'TM_LAYER_TEMPPARKINGRESTRICTION_LIVE',
                'TM_LAYER_SUSPENSIONPARKINGRESTRICTION_LIVE',
                'TM_LAYER_SUSPENSION_BUSWAY_LIVE',
                'TM_LAYER_SUSPENSION_BUSWAY_TRIAL',
                'TM_LAYER_GRITTING_LIVE',
                'TM_LAYER_PREFERRED_ACCESS_V7_LIVE',
                'TM_LAYER_CLOSURE_CROSSING_LIVE',
                'TM_LAYER_ROADAHEADCLOSED_LIVE',
                'TM_LAYER_NOVEHICLEACCESS_LIVE',
                'TM_LAYER_NORIGHTTURN_LIVE',
                'TM_LAYER_NOLEFTTURN_LIVE',
                'TM_LAYER_NOUTURN_LIVE',
                'TM_LAYER_SUSPENSIONONEWAY_LIVE',
                'TM_LAYER_REVERSALONEWAY_LIVE',
                'TM_LAYER_TWOWAYSIGNALS_LIVE',
                'TM_LAYER_MULTIWAYSIGNALS_LIVE',
                'TM_LAYER_STOPANDGO_LIVE',
                'TM_LAYER_GIVEANDTAKE_LIVE',
                'TM_LAYER_PRIORITYSIGNS_LIVE',
                'TM_LAYER_CONVOYWORKING_LIVE',
                'TM_LAYER_WORKSSTOP_LIVE',
                'ROADWORKS_CURRENT',
                'TM_LAYER_ENTITY_CYCLING_LIVE',
                'TM_LAYER_ENTITY_FOOTBALL_LIVE',
                'TM_LAYER_ENTITY_HORSE_RACING_LIVE',
                'TM_LAYER_ENTITY_MOTOR_SPORT_EVENT_LIVE',
                'TM_LAYER_ENTITY_RUGBY_LIVE',
                'TM_LAYER_ENTITY_RUNNING_LIVE',
                'TM_LAYER_ENTITY_SPORT_EVENT_LIVE',
                'TM_LAYER_ENTITY_CARNIVAL_PARADE_STREET_LIVE',
                'TM_LAYER_ENTITY_POLLING_STATION_LIVE',
                'TM_LAYER_ENTITY_AGRICULTURAL_SHOW_LIVE',
                'TM_LAYER_ENTITY_AIR_SHOW_LIVE',
                'TM_LAYER_ENTITY_REMEMBRANCE_PARADE_LIVE',
                'TM_LAYER_ENTITY_CHRISTMAS_EVENT_LIVE',
                'TM_LAYER_ENTITY_ENTERTAINMENT_EVENT_LIVE',
                'TM_LAYER_ENTITY_FESTIVAL_LIVE',
                'TM_LAYER_ENTITY_MARKET_LIVE',
                'TM_LAYER_ENTITY_FUNERAL_LIVE',
                'TM_LAYER_ENTITY_OTHER_PUBLIC_EVENTS_LIVE',
              ],
            },
            embedID: 'NGIZHOPRC0',
            ui: {
              breakingNewsWidget: 660,
            },
            system: {
              delayedLoad: true,
            },
            layer: {
              hideLayers: ['TM_LAYER_ENTITY_CRUISE_SHIP_LIVE'],
            },
            map: {
              swLat: 52.83978188528856,
              swLng: -3.142559340451953,
              neLat: 53.493445532391156,
              neLng: -1.5852473287332032,
            },
            dateRange: 'today',
            },
            copyItems: items,
            currentPageIndex: 0,
            date: date,
            dateEnd: undefined,
            dateStart: undefined,
            end: undefined,
            error: false,
            filteredItems: [],
            items: pages[0],
            pageCount: pages.length ,
            pageIndex: 0,
            pageSize: pageSize,
            pages: pages,
            searchFields: ['description', 'responsible', 'locations'],
            searchTerm: '',
            searchedItems: [],
            start: undefined,
            table: true,
            time: '',
            totalCount: items.length,
            timeOptions: {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            },
            fields: [
              {
                id: 'locations',
                display: 'Location',
                sort: 'sortStr',
              },
              {
                id: 'description',
                display: 'Description',
                sort: 'sortStr',
              },
              { id: 'startDate', display: 'Start date', sort: 'sortNum' },
              { id: 'endDate', display: 'End date', sort: 'sortNum' },
              {
                id: 'responsible',
                display: 'Responsibility',
                sort: 'sortStr',
              },
            ],
        }),
        methods: {
          makeDesc: function(d) {
            return d.split('^#');
          },
          formatTime: function (t) {
            let time = t.toLocaleTimeString('en-GB', this.timeOptions);
            if (time === '12:00 pm') {
              return ' 12 noon';
            } else if (time.startsWith('0')) {
              time = '12' + time.slice(1);
            }
            return ' ' + time.replace(' ', '').toLowerCase();
          },
          showTable: function () {
            this.table = true;
            this.mapUrl = '';
          },
          showMap: function (item) {
            this.table = false;
            const __ElginLoaderRetroFit = function(item, opts) {
              const container = document.getElementById('erw-container');
              if (container) {
                let iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.src = "https://portal-gb.one.network/prd-portal-one-network/embed/?" + item.url.split('?')[1] + "&src=rw.org&options=e" + encodeURIComponent(JSON.stringify(opts));
                container.innerHTML = '';
                container.appendChild(iframe);
              }
            };
            let Elgin = { loader: { load: __ElginLoaderRetroFit } };
            Elgin.loader.load(item, this.opts);
          },
          setUpHeaders: function (e) {
            e.elem.addEventListener('keydown', (ev) => {
              if (ev.code === 'Enter') {
                this.sortByField(e);
              }
            });
          },
          sortNum: function (f) {
            return (a, b) => {
              return a[f] - b[f];
            };
          },
          sortStr: function (field) {
            return (a, b) => {
              let x = a[field].toLowerCase();
              let y = b[field].toLowerCase();
              if (x < y) {
                return -1;
              }
              if (x > y) {
                return 1;
              }
              return 0;
            };
          },
          sortByField: function (e) {
            this.resetIcons();
            let temp = [...this.items];
            temp.sort(this[e.sort](e.id));
            if (temp.some((e, i) => e.index !== this.items[i].index)) {
              this.items = [...temp];
              document.getElementById('up' + e.id).style.color = 'Black';
            } else {
              this.items = [...temp].reverse();
              document.getElementById('down' + e.id).style.color = 'Black';
            }
          },
          resetSearch: function () {
            this.searchTerm = '';
            this.search();
          },
          addIndex: function (arr) {
            arr.forEach((e, i) => (e.index = i));
          },
          calculatePages: function () {
            this.totalCount = this.searchedItems.length;
            this.pageCount = Math.ceil(this.totalCount / this.pageSize);
            this.pageIndex = 0;
            this.pageBtns = Array.from(
              { length: this.pageCount },
              (_, i) => i + 1,
            );
            this.createPages();
            this.items = this.pages[0];
          },
          reset: function () {
            this.setPickers();
            this.filteredItems = this.copyItems.slice();
            this.search();
          },
          createPages: function () {
            this.pages = [
              ...Array(Math.ceil(this.searchedItems.length / this.pageSize)),
            ].map(() => [...this.searchedItems].splice(0, this.pageSize));
          },
          goToPage: function (i) {
            document.getElementById('app').scrollIntoView();
            this.pageIndex = i;
            this.items = this.pages[i];
          },
          search: function () {
            this.searchedItems =
              this.searchTerm === ''
                ? this.filteredItems.slice()
                : this.filteredItems.filter((item) =>
                    this.searchFields.some((term) =>
                      item[term]
                        .toLowerCase()
                        .includes(this.searchTerm.toLowerCase()),
                    ),
                  );
            this.calculatePages();
          },
          resetIcons: function () {
            this.fields.forEach((obj) => {
              document.getElementById('up' +  obj.id).style.color = 'gray';
              document.getElementById('down' + obj.id).style.color = 'gray';
            });
          },
          addDates: function (arr) {
            return arr.map((e) => {
              e.startDate = new Date(e.startDate);
              e.endDate = new Date(e.endDate);
              return e;
            });
          },
          getUTCDate(date) {
            return Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
              date.getUTCHours(),
              date.getUTCMinutes(),
              date.getUTCSeconds(),
            );
          },
          filter: function () {
            let st = this.getUTCDate(new Date(this.dateStart + 'T00:00'));
            let end = this.getUTCDate(new Date(this.dateEnd + 'T23:59:59'));
            this.filteredItems = this.copyItems.filter(
              (e) =>
                this.getUTCDate(e.startDate) >= st &&
                this.getUTCDate(e.endDate) <= end,
            );
            this.search();
          },
          setPickers: function () {
            this.dateStart = this.start.toLocaleDateString('en-CA');
            this.dateEnd = this.end.toLocaleDateString('en-CA');
          },
          getData: function () {
            if (!this.copyItems.length) {
              this.error = true;
              return;
            }
            let temp = new Date(this.date);
            this.date = temp.toLocaleDateString('en-GB');
            this.time = this.formatTime(temp);
            this.copyItems = this.addDates(this.copyItems);
            this.searchedItems = [...this.copyItems];
            this.filteredItems = [...this.copyItems];
            this.start = this.copyItems[0].startDate;
            this.end = this.copyItems.reduce((acc, item) => {
              return item.endDate > acc ? item.endDate : acc;
            }, 0);
            this.start.setHours(0, 0, 0, 0);
            this.end.setHours(23, 59, 59, 999);
            this.setPickers();
          },
        },
        mounted() {
          this.getData();
          this.fields.forEach((e) => {
            e.elem = document.getElementById(e.id);
            this.setUpHeaders(e);
          });
          },
          template: \`<%- template %>\`,
          })
            `;

const appOuter = `
  <script type="importmap">
    {
      "imports": {
        "vue": "https://unpkg.com/vue@3.4.21/dist/vue.esm-browser.js"
      }
    }
  </script>

  <script type="module">
      import { createSSRApp } from 'vue';
      function createApp(date,items, pages, pageSize) {
        <%- appBody %>
      }
      createApp(<%- JSON.stringify(date) %>, <%- JSON.stringify(items) %>,  <%- JSON.stringify(pages) %>, <%= pageSize %>).mount('#app');
</script>
`;

export { appOuter, appInner };
