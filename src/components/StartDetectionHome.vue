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
        </v-card-title>
      </v-card>
      <v-data-table
          :headers="tableHeaders"
          :items="data"
          :custom-sort="customTableSort"
          :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td style="text-align:center">{{ getFormattedDate(props.item.created_at) }}</td>
            <td>{{ props.item.method }}</td>
            <td>{{ props.item.dataset }}</td>
            <td>{{ props.item.parameters }}</td>
            <td>{{ props.item.score }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import "moment/locale/de";
import {FILTER_FOR_METHOD, FILTER_FOR_DATASET} from "@/dataFilter";
import {GREEN_FILL, RED_FILL, GRAY} from "@/colors";
import {GET_ALL_DATASETS_ENDPOINT, GET_SERVICE_STATUS_ENDPOINT} from "@/RESTconf";

export default {
  name: "StartDetectionHome",
  components: {
    "empty-parameter": () => import("./form/EmptyParameter"),
    "lda-parameter": () => import("./form/LdaParameter"),
    "seanmf-parameter": () => import("./form/SeanmfParameter"),
    "frequency-rbai-parameter": () => import("./form/FrequencyRBAIParameter")
  },
  data() {
    return {
      key: this.$route.path,
      selectedMethod: "",
      selectedDataset: "",
      serviceStatus: "NA",
      serviceColor: GRAY,
      runMethods: ["LDA", "SeaNMF", "Frequency (RBAI)"],
      datasets: [],
      component: "empty-parameter",
      pagination: {
        sortBy: "created_at",
        descending: true
      },
      tableHeaders: [
        {
          text: "Date",
          align: "center",
          sortable: true,
          value: "created_at",
          width: "10%"
        },
        {
          text: "Method",
          align: "left",
          sortable: false,
          value: "method",
          width: "15%"
        },
        {
          text: "Dataset",
          align: "left",
          sortable: false,
          value: "dataset",
          width: "15%"
        },
        {
          text: "Parameters",
          align: "left",
          sortable: false,
          value: "parameters",
          width: "45%"
        },
        {
          text: "Score",
          align: "left",
          sortable: false,
          value: "score",
          width: "15%"
        },
      ],
      errors: [],
      cardTableTitle: "Last Runs",
      rawData: [],
      data: []
    };
  },
  methods: {
    loadData(runs) {
      //Sorted by creation date
      this.data = runs.filter(FILTER_FOR_METHOD(this.selectedMethod));

      this.data.sort((val1, val2) => {
        return val1.created_at - val2.created_at;
      });

      // Update UI
      this.data.splice(0, 0);
    },
    async loadDatasets() {
      axios
          .get(GET_ALL_DATASETS_ENDPOINT)
          .then(response => {
            // DEBUG
            console.log("StartDetectionHome::loadDatasets Got Datasets: "+response.data);
            this.datasets = response.data;
          })
          .catch(e => {
            this.errors.push(e);
            // DEBUG
            console.log(this.errors)
          });
    },
    getFormattedDate(date) {
      return moment(date, "YYYYMMDD").format("DD.MM.YYYY");
    },
    customTableSort(items, index, isDescending) {
      items.sort((a, b) => {
        if (index === "created_at") {
          if (isDescending) {
            return b.created_at - a.created_at;
          } else {
            return a.created_at - b.created_at;
          }
        }
      });
      return items;
    },
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
  },
  mounted() {
    this.$store.watch(
        (state, getters) => getters.runs,
        (newValue, oldValue) => {
          this.loadData([...newValue]);
        }
    );
    this.datasets = this.$store.getters.datasets;
    this.$store.watch(
        (state, getters) => getters.datasets,
        (newValue, oldValue) => {
          //this.loadDataset([...newValue]);
          this.datasets = newValue;
        }
    );
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