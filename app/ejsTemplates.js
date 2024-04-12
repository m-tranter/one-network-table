const appInner = `
return createSSRApp({
  data: () => ({
            copyItems: items,
            currentPageIndex: 0,
            date: date,
            dateEnd: undefined,
            dateStart: undefined,
            end: undefined,
            error: false,
            filteredItems: [],
            items: pages[0],
            mapId: '',
            mapUrl: '',
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
            this.mapId = item.locations.split('^#')[0];
            this.mapUrl = 'https://portal-gb.one.network/prd-portal-one-network/embed/?' + item.url.split('?')[1] + '&src=rw.org&options={"googleAPIKey"%3A"AIzaSyDG00gQi_7ApZ54lG6mOu6ov-fNLl7lpOg"%2C"organisationID"%3A1451%2C"embedded"%3Atrue}';
            this.table = false;
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
        "vue": "https://unpkg.com/vue@3.4.21/dist/vue.esm-browser.prod.js"
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
