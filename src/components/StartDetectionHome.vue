<template>
  <v-container>
    <v-card>
      <v-card flat class="header">
        <v-card-title primary-title>
          <h1>Start Run</h1>
        </v-card-title>
      </v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs3>
            <v-select
                v-model="selectedMethod"
                :items="runMethods"
                item-text="displayName"
                item-value="name"
                label="Method"
                @change="updateForm"
            >
            </v-select>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs3 id="service-status">
            <b>Status: <span :style="{'color': serviceColor}" >{{ serviceStatus }}</span></b>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs3>
            <v-select
                v-model="selectedDataset"
                :items="datasets"
                label="Dataset"
            >
            </v-select>
          </v-flex>
        </v-layout>
      </v-container>
      <v-divider/>
      <component v-bind:is="component" v-bind:dataset="selectedDataset"/>
    </v-card>
    <v-card>
      <v-card flat class="header">
        <v-card-title>
          <h1>{{ cardTableTitle }}</h1>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
              clearable
          ></v-text-field>
        </v-card-title>
      </v-card>
      <v-data-table
          :headers="tableHeaders"
          :items="filteredResults"
          :pagination.sync="pagination"
          :loading="loading"
          :search="search"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td style="text-align:center">{{ props.item.started_at.replace("Z", "").replace("T", " ").substring(0, 19) }}</td>
            <td>{{ getDisplayName(props.item.method) }}</td>
            <td>{{ props.item.dataset_name }}</td>
            <td>{{ displayParameter(props.item.params) }}</td>
            <td>{{ displayRunName(props.item.name) }}</td>
            <td>{{ displayScore(props.item.metrics) }}</td>
            <td> actions </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import {GREEN_FILL, RED_FILL, GRAY} from "@/colors";
import {GET_SERVICE_STATUS_ENDPOINT} from "@/RESTconf";
import { mapGetters } from 'vuex'
import {METHODS} from "@/methods";

export default {
  name: "StartDetectionHome",
  components: {
    "empty-parameter": () => import("./form/EmptyParameter"),
    "lda-parameter": () => import("./form/LdaParameter"),
    "seanmf-parameter": () => import("./form/SeanmfParameter"),
    "frequency-rbai-parameter": () => import("./form/FrequencyRBAIParameter")
  },
  computed: {
    ...mapGetters({
      datasets: 'datasets',
      results: 'results',
      loading: "loadingResults",
    }),
    filteredResults () {
      let r = [];
      console.log(this.selectedMethod);
      if (this.selectedMethod === "") {
        return this.results;
      }
      for (const index in this.results) {
        if (this.results[index].method === this.selectedMethod) {
          r.push(this.results[index]);
        }
      }
      return r;
    },
  },
  data() {
    return {
      key: this.$route.path,
      selectedMethod: "",
      selectedDataset: "",
      serviceStatus: "NA",
      serviceColor: GRAY,
      runMethods: METHODS,
      component: "empty-parameter",
      search: "",
      pagination: {
        sortBy: "started_at",
        descending: true
      },
      tableHeaders: [
        {
          text: "Date",
          align: "center",
          sortable: true,
          value: "started_at",
          width: "10%",
          filterable: true
        },
        {
          text: "Method",
          align: "left",
          sortable: false,
          value: "method",
          width: "9%",
          filterable: true
        },
        {
          text: "Dataset",
          align: "left",
          sortable: false,
          value: "dataset",
          width: "9%",
          filterable: true
        },
        {
          text: "Parameters",
          align: "left",
          sortable: false,
          value: "parameters",
          width: "37%",
          filterable: true
        },
        {
          text: "Name",
          align: "left",
          sortable: false,
          value: "name",
          width: "12%",
          filterable: true
        },
        {
          text: "Avg. Coherence",
          align: "left",
          sortable: true,
          value: "score",
          width: "12%",
        },
        {
          text: "Actions",
          align: "center",
          sortable: false,
          width: "9%"
        },
      ],
      errors: [],
      cardTableTitle: "Last Runs",
      rawData: [],
    };
  },
  methods: {
    updateForm() {
      if (this.selectedMethod === "LDA") {
        this.component = "lda-parameter";
        this.checkServiceStatus("lda");
      } else if (this.selectedMethod === "SeaNMF") {
        this.component = "seanmf-parameter";
        this.checkServiceStatus("seanmf");
      } else if (this.selectedMethod === "Frequency (RBAI)"){
        this.component = "frequency-rbai-parameter";
        this.checkServiceStatus("frequency-rbai")
      } else {
          this.component = "empty-parameter";
      }
    },
    async checkServiceStatus(service) {
      this.updateStatus("checking");
      axios
          .get(GET_SERVICE_STATUS_ENDPOINT(service))
          .then(response => {
            if (response.data !== null) {
              status = response.data.status;
              this.updateStatus(status);
            } else {
              status = "offline";
              this.updateStatus(status);
            }
          })
          .catch(e => {
            status = "offline"
            this.updateStatus(status);
            this.errors.push(e);
          });
    },
    updateStatus(status) {
      if (status === "operational") {
        this.serviceStatus = "Running";
        this.serviceColor = GREEN_FILL;
      } else if (status === "checking") {
        this.serviceStatus = "Checking";
        this.serviceColor = GRAY;
      } else {
        this.serviceStatus = "Offline";
        this.serviceColor = RED_FILL;
      }
    },
    displayParameter(params) {
      return(JSON.stringify(params).replace("{","").replace("}","")
      .replaceAll('"',"").replaceAll(",", ", "));
    },
    displayScore(metrics) {
      let metric;
      try {
        metric = metrics.total_coherence.toString().substring(0, 6);
      } catch(e) {
        metric = "-";
      }
      return metric;
    },
    displayRunName(name) {
      if (name === "") {
        return "-";
      } else {
        return name;
      }
    },
    getDisplayName(method) {
      for (const index in METHODS) {
        if (METHODS[index].name === method) {
          return METHODS[index].displayName;
        }
      }
    },
  },
  mounted() {
  }
};
</script>

<style scoped>
.header {
  margin-top: 20px;
}

.card-title-text {
  font-size: 2em;
  text-align: center;
}

table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}

.row-item {
  margin: 15px 10px 15px 10px;
}

.row-header {
  margin: 15px 10px 35px 10px;
  position: fixed;
}

.action-left {
  margin-right: 5px;
}

.action-right {
  margin-left: 5px;
}

h1 {
  text-align: center;
}

.list-enter,
.list-leave-to {
  transition: all 0.5s;
  opacity: 0;
}

.backgroundcolor-red {
  background-color: rgba(255, 0, 0, 0.04);
}

.backgroundcolor-yellow {
  background-color: rgba(255, 249, 196, 0.5);
}

.backgroundcolor-grey {
  background-color: rgba(238, 238, 238, 0.04);
}

.spacing {
  padding-top: 0px;
}

.pointer {
  cursor: pointer;
}

.toggle-effect {
  background-color: #bdbdbd !important;
}

.anti-margin {
  margin-bottom: 0px !important;
}

#service-status {
  padding-left: 0px;
  padding-top: 25px;
}
</style>