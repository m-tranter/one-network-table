const listTemplate = `
<div v-if="error">
  <p>Nothing to display at present. Try again in a few minutes.</p>
</div>
<div
  id="table"
  class="mt-3 tab-pane fade show active"
  role="tabpanel"
  aria-labelledby="table-tab"
>
  <div v-if="table">
    <div v-if="!error">
      <p>This information was last updated on {{date}} at {{time}}.</p>
      <div class="row">
        <div class="input-group mb-3 content-type-search">
          <label for="contentTypeSearchInput" class="d-none"
            >Filter results</label
          >
          <input
            @input="search"
            autocomplete="off"
            type="text"
            class="form-control"
            placeholder="Type here to filter results"
            v-model="searchTerm"
            aria-label="Search term"
            id="contentTypeSearchInput"
          />
          <label for="contentTypeSearchInput" class="d-none">Search term</label>
          <div class="input-group-append">
            <button
              v-if="searchTerm.length > 0"
              class="ms-2 btn btn-outline-secondary"
              type="button"
              v-on:click="resetSearch"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>
      <div class="row g-flex date align-items-end">
        <h2 class="fs-5">Filter by date</h2>
        <div class="col-md-auto m-0">
          <div class="col-md-auto w-auto pe-2 d-inline-block">
            <h3 class="fs-6">Start</h3>
            <label for="start-date" class="d-none">Start date</label>
            <input id="start-date" v-model="dateStart" type="date" />
          </div>
          <div class="col-md-auto mt-2 pe-2 w-auto d-inline-block">
            <h3 class="fs-6">End</h3>
            <label for="end-date" class="d-none">End date</label>
            <input id="end-date" v-model="dateEnd" type="date" />
          </div>
        </div>
        <div class="col-md-6 mx-0 mt-3">
          <ul class="pagination mb-0">
            <li class="page-item pe-2">
              <button
                @click="filter"
                class="page-link rounded me-0 mb-0"
                type="button"
              >
                Filter
              </button>
            </li>
            <li class="page-item">
              <button
                @click="reset"
                class="page-link rounded me-0 mb-0"
                type="button"
              >
                Reset
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="api-results-info mt-3">
        <p class="mb-1">Total results: <strong>{{totalCount }}</strong></p>
        <p class="mb-1" v-if="pageCount > 1">
          Page {{pageIndex + 1}} of {{pageCount}}
        </p>
      </div>
      <nav
        v-if="pageCount > 1"
        role="navigation"
        aria-label="Results data navigation"
      >
        <ul class="pagination mb-2 ms-0">
          <li class="page-item pe-2" v-bind:class="{disabled: pageIndex===0}">
            <button
              class="page-link rounded me-0 mb-0"
              type="button"
              v-on:click="goToPage(pageIndex - 1)"
            >
              Previous
            </button>
          </li>
          <li
            class="page-item"
            v-bind:class="{disabled: pageIndex + 1 >=pageCount}"
          >
            <button
              class="page-link rounded me-0 mb-0"
              type="button"
              v-on:click="goToPage(pageIndex + 1)"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
      <p>Clicking on a location will display a map.</p>
        <table >
          <caption class="d-none">
            Roadworks
          </caption>
          <thead>
            <tr>
              <th
                v-for="obj in fields"
                tabindex="0"
                scope="col"
                @click="sortByField(obj)"
                class="tableHead p-0 align-middle"
                :id="obj.id"
              >
                <div class="row g-0">
                  <div class="arrows col-1 py-0 px-1">
                    <span class="entryUpIcon" :id="'up' + obj.id">&#9650;</span>
                    <span class="entryDownIcon" :id="'down'+obj.id"
                      >&#9660;</span
                    >
                  </div>
                  <div class="col-11 pt-1 ps-2">{{obj.display}}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.index">
              <td>
                <span @click="showMap(item)">
                  <ul class="my-0">
                    <template v-for="l in item.locations.split('^#')">
                      <li v-if="l !== 'None'">
                        <span class="fakeLink">{{l}}</span>
                      </li>
                    </template>
                  </ul>
                </span>
                <p
                  class="mt-2 mb-0 ps-1"
                  :class="{'text-danger':  item.severity === 'High'}"
                >
                  Impact: {{item.severity}}
                </p>
              </td>
              <td>
                <ul>
                  <li v-for="(d, i) in makeDesc(item.description)" :key="i">
                    <p class="mb-0" v-if="d.length">{{d}}</p>
                    <p class="mb-0" v-else>View map for more details</p>
                  </li>
                  <li v-if="item.extra">{{item.extra}}</li>
                </ul>
              </td>
              <td>{{item.startDateString}}</td>
              <td>{{item.endDateString}}</td>
              <td>{{item.responsible}}</td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
  <div v-if="!table" class="loc-map">
    <button class="btn btn-primary" type="button" @click="showTable">
      Back to table
    </button>
    <div
      title="One Networkd"
      class="ElginRoadworksWidget mt-2"
      :id="mapId"
      style="width: 100%; height: 800px"
    >
      <iframe
        style="width: 100%; height: 800px; border: medium"
        :src="mapUrl"
      ></iframe>
    </div>
  </div>
</div>
  `;

export default listTemplate;
