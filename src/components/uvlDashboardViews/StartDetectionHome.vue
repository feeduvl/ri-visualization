<template>
  <v-container>
    <p class="classifier-headline">
      Classification Method
    </p>

    <v-layout row wrap>
      <v-flex xs3>
        <v-select v-model="selectedMethod" :items="runMethods" item-text="displayName" item-value="name"
          label="Method">
        </v-select>
      </v-flex>
      <v-flex xs1 />
      <v-flex xs3 id="service-status">
        <b>Status: <span :style="{ 'color': serviceColor }">{{ serviceStatus }}</span></b>
      </v-flex>
      <v-flex xs1 />
    </v-layout>

      <v-divider />
      <component v-bind:is="component" v-bind:dataset="this.$props.selected_dataset" ref="detectionRef"/>

    <v-snackbar v-model="deleteSnackbarVisible" :timeout="deleteSnackbarTimeout" :top=true>
      Delete Result {{ resultToDelete.name }}?
      <v-btn color="error" small :loading="deleteBtn" :disabled="deleteBtn" @click="deleteResult">
        Confirm
      </v-btn>
      <v-btn color="primary" small @click="deleteSnackbarVisible = false">
        Cancel
      </v-btn>
    </v-snackbar>

    <v-snackbar v-model="snackbarVisible" :timeout="snackbarTimeout" :top=true>
      {{ snackbarText }}
      <v-btn color="blue" text @click="closeSnackbar">
        Close
      </v-btn>
    </v-snackbar>

    <v-dialog v-model="editDialogVisible" max-width="290">
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          Edit Result Name
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newResultName" label="Name" single-line hide-details clearable></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="editName" :loading="editBtn" :disabled="editBtn">
            Edit
          </v-btn>
          <v-btn color="error" text @click="editDialogVisible = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div>
      <v-btn color="red" @click="startClassifier()"> Extract Usage Information
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import { GREEN_FILL, RED_FILL, GRAY} from "@/colors";
import { DELETE_RESULT_ENDPOINT, GET_SERVICE_STATUS_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT } from "@/RESTconf";
import { mapGetters } from 'vuex'
import { getMethodObj, DASHBOARD_METHODS } from "@/methods";
import {
  ACTION_DELETE_RESULT,
  ACTION_EDIT_RESULT_NAME,
  // mutations
  MUTATE_SELECTED_RESULT,
  MUTATE_SELECTED_METHOD
} from "@/store/types";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
export default {
  name: "StartDetectionHome",
  props: {
    selected_dataset: Array,
  },
  components: {
    "empty-parameter": () => import("./form/EmptyParameter"),
    "bert-parameter": () => import("./form/BERTParameter.vue"),
  },
  created() {
    this.$store.dispatch('actionGetAllAnnotations');
  },
  computed: {
    component() {
      return getMethodObj(DASHBOARD_METHODS, this.selectedMethod).parameterComponentName;
    },
    checkForAnnotationFinished() {
      return this.$store.state.available_annotations.find(a => a.name === this.$store.state.currentDashboardName)
    },
    selectedMethod: {
      get() {
        return this.$store.state.selectedMethod;
      },
      set(newValue) {
        this.$store.commit(MUTATE_SELECTED_METHOD, newValue);
        if (this.$store.state.selectedResult.method !== newValue) {
          this.$store.commit(MUTATE_SELECTED_RESULT, {})
        }
      }
    },
    ...mapGetters({
      datasets: 'datasets',
      results: 'results',
      loading: "loadingResults",
      filteredResults: "resultsForSelectedMethod",
      selectedResult: "selectedResult",
    })
  },
  watch: {
    selectedMethod: function (val) {
      this.updateServiceStatus(val);
    },

    checkForAnnotationFinished(val) {
      if (val && this.waitingForAnnotation) {
        this.updateAnnotationView()
      }
    }
  },
  data() {
    return {
      key: this.$route.path,
      selectedDataset: "",
      serviceStatus: "NA",
      serviceColor: GRAY,
      runMethods: DASHBOARD_METHODS,
      search: "",
      pagination: {
        sortBy: "started_at",
        descending: true,
      },
      tableHeaders: [
        {
          text: "Date",
          align: "center",
          sortable: true,
          width: "10%",
          value: "started_at",
          filterable: false,
        },
        {
          text: "Method",
          align: "left",
          sortable: false,
          value: "method",
          width: "9%",
          filterable: false,
        },
        {
          text: "Dataset",
          align: "left",
          sortable: false,
          value: "dataset_name",
          width: "9%",
          filterable: false,
        },
        {
          text: "Parameters",
          align: "left",
          sortable: false,
          value: "params",
          width: "40%",
          filterable: false,
        },
        {
          text: "Name",
          align: "left",
          sortable: false,
          value: "name",
          width: "10%",
          filterable: true,
        },
        {
          text: "Status",
          align: "left",
          sortable: false,
          value: "status",
          width: "12%",
          filterable: false,
        },
        {
          text: "Score",
          align: "left",
          // Change to 'false' and change the value, when there are new methods that do not use topic coherence as metric
          sortable: true,
          value: "metrics.total_coherence",
          width: "10%",
        },
        {
          text: "Actions",
          align: "center",
          sortable: false,
          value: 'actions',
          width: "12%",
        },
      ],
      errors: [],
      resultToDelete: {},
      resultToEdit: {},
      deleteSnackbarVisible: false,
      editDialogVisible: false,
      newResultName: "",
      deleteBtn: false,
      editBtn: false,
      snackbarVisible: false,
      deleteSnackbarTimeout: 0,
      snackbarText: "",
      snackbarTimeout: 0,
      waitingForAnnotation: false
    };
  },
  methods: {
    async startClassifier() {
      let selectedFeedback = this.$props.selected_dataset.join('#!#');
      await this.$refs.detectionRef.startRun()
      console.log("classification started, waiting for finishing")
      this.waitingForAnnotation = true
    },
    async updateAnnotationView() {
    let annotation = this.$store.state.available_annotations.find(a => a.name === this.$store.state.currentDashboardName)
      let datasets = this.$props.selected_dataset
      if (datasets.length <= 0){ //happens, if existing annotation is loaded
        datasets = this.$store.state.storedDatasets
      }
      console.log(datasets)
      if (annotation) {
        this.waitingForAnnotation = false
        console.log("found annotation, now saving it")
        let data_to_store = {
          datasets: datasets,
          name: this.$store.state.currentDashboardName,
          threshold: "",
          classifier: this.selectedMethod,
          type: "Usage Information"
        }
        this.$store.commit('setDashboardData', data_to_store)
        await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
        console.log("saved annotation, now updating view")
        this.$emit('updateAnnotationView', annotation)
        console.log("emit done")
      } else {
        console.log("could not find annotation")
      }
    },
    updateServiceStatus(service) {
      if (service === "") {
        this.serviceColor = GRAY;
        this.serviceStatus = "NA";
      } else {
        this.checkServiceStatus(service);
      }
    },
    editName() {
      this.editBtn = true;
      this.resultToEdit.name = this.newResultName;
      axios.post(POST_UPDATE_RESULT_NAME_ENDPOINT, {
        name: this.resultToEdit.name,
        started_at: this.resultToEdit.started_at
      })
        .then(response => {
          if (response.status > 200 || response.status < 300) {
            this.displaySnackbar("Name edited");
            this.$store.dispatch(ACTION_EDIT_RESULT_NAME, this.resultToEdit);
            this.resultToEdit = {};
            this.newResultName = "";
          } else {
            this.displaySnackbar("Error with result name edit!");
          }
        })
        .catch(e => {
          this.errors.push(e);
          console.log(e);
          this.displaySnackbar("Could not contact backend!");
        }).finally(() => {
          this.editBtn = false;
          this.editDialogVisible = false;
          setTimeout(() => {
            this.snackbarVisible = false;
          }, SNACKBAR_DISPLAY_TIME);
        });
    },
    deleteResult() {
      this.deleteBtn = true;
      axios.delete(DELETE_RESULT_ENDPOINT(this.resultToDelete.started_at))
        .then(response => {
          if (response.status > 200 || response.status < 300) {
            this.displaySnackbar(response.data.message);
            this.$store.dispatch(ACTION_DELETE_RESULT, this.resultToDelete);
            if (this.resultToDelete.started_at === this.selectedResult.started_at) {
              this.$store.commit(MUTATE_SELECTED_RESULT, {});
            }
            this.resultToDelete = {};
          } else {
            this.displaySnackbar("Error with result deletion!");
          }
        })
        .catch(e => {
          this.errors.push(e);
          this.displaySnackbar("Could not contact backend!");
        }).finally(() => {
          this.deleteBtn = false;
          this.deleteSnackbarVisible = false;
          setTimeout(() => {
            this.snackbarVisible = false;
          }, SNACKBAR_DISPLAY_TIME);
        });
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },
    async checkServiceStatus(service) {
      let status = "checking"
      this.updateStatus(status);
      axios
        .get(GET_SERVICE_STATUS_ENDPOINT(service))
        .then(response => {
          if (response.data !== null) {
            status = response.data.status;
          } else {
            status = "offline";
          }
        })
        .catch(e => {
          status = "offline"
          this.errors.push(e);
        }).finally(() => {
          this.updateStatus(status);
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
    loadDashboardData(){
      console.log("loading dashboard data due to change of Dashboard name")
      this.selectedMethod = this.$store.state.storedClassifier
      this.updateAnnotationView()
      console.log(this.selectedMethod)
      console.log(this.$store.state.storedClassifier)
    }
  },
  mounted() {
    this.updateServiceStatus(this.selectedMethod);

    setInterval(function () {
      if (!(this._inactive)) {
        this.updateServiceStatus(this.selectedMethod);
      }
    }.bind(this), 30000);

  }
}

</script>

<style scoped>
table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}

h1 {
  text-align: center;
}

#service-status {
  padding-left: 0;
  padding-top: 25px;
}

table.v-table tbody td:first-child,
table.v-table tbody td:not(:first-child),
table.v-table tbody th:first-child,
table.v-table tbody th:not(:first-child),
table.v-table thead td:first-child,
table.v-table thead td:not(:first-child),
table.v-table thead th:first-child,
table.v-table thead th:not(:first-child) {
  padding: 0 8px;
}

.dialog-title {
  font-weight: 500;
}
.classifier-headline{
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: bold;
}
</style>