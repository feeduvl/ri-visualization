<template>
  <v-container>
    <v-card>
      <v-card flat class="header">
        <v-card-title>
          <h2>{{ cardTableTitle }}</h2>
        </v-card-title>
      </v-card>
      <v-layout row wrap>
        <v-flex xs1/>
        <v-flex xs3>
          <v-select
              v-model="selectedDataset"
              :items="datasets"
              label="Dataset"
              @change="loadDataset"
          >
          </v-select>
        </v-flex>
        <v-flex xs1/>
        <span v-show="!hasGroundtruth" class="groundtruth_info">Groundtruth: {{ this.hasGroundtruthString }}</span>
        <span v-show="hasGroundtruth" class="groundtruth_info">Groundtruth:
        <v-btn small color="primary" @click="toggleShowGroundtruth">
          {{ gtBtnText }}
        </v-btn>
        </span>
        <v-flex xs3/>
        <v-flex xs2>
          <v-btn small outline color="error" @click="showDeleteDataset(selectedDataset)" id="delete_button">
            Delete Dataset
          </v-btn>
        </v-flex>
      </v-layout>
      <v-data-table
          :headers="tableHeaders"
          :items="data"
          :pagination.sync="pagination"
          :loading="loading"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.text }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-snackbar
        v-model="snackbarVisible"
        :timeout="snackbarTimeout"
        :top=true
    >
      {{ snackbarText }}

      <v-btn
          color="blue"
          text
          @click="closeSnackbar"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        :timeout="deleteSnackbarTimeout"
        :top=true
        :multi-line="true"
    >
      Delete Dataset {{ datasetToDelete }}?

      <v-checkbox
          v-model="alsoDeleteRuns"
          :label="``"
          :dark="true"
      ></v-checkbox>
      Also delete runs with this dataset?

      <v-btn
          color="error"
          small
          :loading="deleteBtn"
          :disabled="deleteBtn"
          @click="deleteDataset"
      >
        Confirm
      </v-btn>

      <v-btn
          color="primary"
          small
          @click="deleteSnackbarVisible = false"
      >
        Cancel
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import {
  GET_DATASET_ENDPOINT,
  DELETE_DATASET_ENDPOINT, DELETE_RESULT_ENDPOINT
} from "@/RESTconf";
import { mapGetters } from 'vuex'
import {ACTION_DELETE_RESULT, MUTATE_SELECTED_DATASET_OUTSIDE, MUTATE_SELECTED_RESULT} from "@/store/types";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
import {loadDatasets} from "@/RESTcalls";

export default {
  name: "DatasetHome",
  watch: {
    dataset: function () {
      console.log(!!this.dataset.hasOwnProperty("ground_truth"));
      console.log(this.dataset);
      this.hasGroundtruth = !!this.dataset.hasOwnProperty("ground_truth");
      console.log(this.hasGroundtruth);
    }
  },
  computed: {
    ...mapGetters({
      datasets: 'datasets',
      selectedDatasetOutside: 'selectedDatasetOutside',
      results: 'finishedResults',
      selectedResult: 'selectedResult',
    }),
    selectedDataset: {
      get () {
        if (this.selectedDatasetOutside === "") {
          return this.selectedDatasetProxy;
        } else {
          this.selectedDatasetProxy = this.selectedDatasetOutside;
          this.$store.commit(MUTATE_SELECTED_DATASET_OUTSIDE, "");
          this.loadDataset();
          return this.selectedDatasetProxy;
        }
      },
      set (val) {
        this.selectedDatasetProxy = val;
      },
    },
  },
  data() {
    return {
      key: this.$route.path,
      selectedDatasetProxy: "",
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
      deleteSnackbarVisible: false,
      deleteSnackbarTimeout: 0,
      hasGroundtruthString: "Not available",
      hasGroundtruth: false,
      gtBtnText: "Show",
      showGroundtruth: false,
      datasetToDelete: "",
      alsoDeleteRuns: false,
      deleteBtn: false,
      loading: false,
      btnLoading: false,
      data: [],
      dataset: {},
      cardTableTitle: "Dataset Content",
      pagination: {
        sortBy: "number",
        descending: false,
        rowsPerPage: 25,
      },
      tableHeaders: [
        {
          text: "ID",
          align: "center",
          sortable: true,
          value: "id",
          width: "10%"
        },
        {
          text: "Text",
          align: "left",
          sortable: false,
          value: "text",
          width: "90%"
        },
      ],
      errors: [],
      rawData: [],
    };
  },
  methods: {
    toggleShowGroundtruth() {
      if (this.showGroundtruth) {
        this.gtBtnText = "Hide";
      } else {
        this.gtBtnText = "Show";
      }
      this.showGroundtruth = !this.showGroundtruth;
      this.updateTable(this.dataset);
    },
    async loadDataset() {
      this.data = [];
      this.loading = true;
      axios
          .get(GET_DATASET_ENDPOINT(this.selectedDataset))
          .then(response => {
            this.updateTable(response.data);
            this.dataset = response.data;
          })
          .catch(e => {
            this.errors.push(e);
          }).finally( () =>
          this.loading = false);
    },
    updateTable(responseData) {
      let documents = []
      for (let index in responseData["documents"]) {
        let document = responseData["documents"][index];
        let t = document.text;
        if (this.showGroundtruth) {
          for (const gt of this.dataset.ground_truth) {
            t = t.replace(new RegExp(gt.text, "ig"), ' ' + '<span class=\'blue\'>' + gt.text.trim() + '</span>');
          }
        }
        let d = { text: t,
              number: document.number,
              id: document.id};
        documents.push(d);
      }
      this.data = documents;
    },
    resetTable() {
      this.data = [];
    },
    showDeleteDataset(dataset) {
      if (this.selectedDataset !== "") {
        this.datasetToDelete = dataset;
        this.deleteSnackbarVisible = true;
      } else {
        this.displaySnackbar("Select a dataset first!");
        setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
      }
    },
    displaySnackbar(message, timeout=0) {
      this.snackbarText = message;
      this.snackbarVisible = true;
      this.snackbarTimeout = timeout;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
      this.snackbarTimeout = 0;
    },
    deleteDataset() {
      this.deleteBtn = true;
      axios
          .delete(DELETE_DATASET_ENDPOINT(this.datasetToDelete))
          .then(response => {
            if (response.status > 200 || response.status < 300) {
              // Check to also delete runs with dataset
              if (this.alsoDeleteRuns) {
                let runsWithDataset = this.results.filter(a => a.dataset_name === this.datasetToDelete);
                for (let index in runsWithDataset) {
                  this.deleteResult(runsWithDataset[index]);
                }
              }
              loadDatasets(this.$store);
              this.displaySnackbar(response.data.message);
              this.datasetToDelete = "";
            } else {
              this.displaySnackbar("Error with file deletion!");
            }
          })
          .catch(e => {
            this.errors.push(e);
            this.displaySnackbar("Could not contact backend!");
          })
          .finally( () => {
            this.deleteBtn = false;
            this.deleteSnackbarVisible = false;
            setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
            this.resetTable();
            this.alsoDeleteRuns = false;
          });
    },
    deleteResult(result) {
      axios.delete(DELETE_RESULT_ENDPOINT(result.started_at))
          .then(response => {
            if (response.status > 200 || response.status < 300) {
              if (this.selectedResult.started_at !== undefined) {
                if (this.selectedResult.started_at === result.started_at) {
                  this.$store.commit(MUTATE_SELECTED_RESULT, {});
                }
              }
              this.$store.dispatch(ACTION_DELETE_RESULT, result);
            } else {
              console.log("DatasetHome::deleteResult: ", response.status);
            }
          })
          .catch(e => {
            console.log("DatasetHome::deleteResult: ", e);
          })
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

td {
  padding-top: 10px;
  padding-bottom: 10px;
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
  padding-top: 0;
}

.pointer {
  cursor: pointer;
}

.toggle-effect {
  background-color: #bdbdbd !important;
}

.anti-margin {
  margin-bottom: 0 !important;
}

#delete_button {
  margin-top: 22px;
}

.groundtruth_info {
  color: gray;
  margin-top: 25px;
}
</style>