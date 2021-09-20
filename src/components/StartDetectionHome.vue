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
            >
            </v-select>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs3 id="service-status">
            <b>Status: <span :style="{'color': serviceColor}">{{ serviceStatus }}</span></b>
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
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  @click="reloadResults"
                  v-bind="attrs"
                  v-on="on"
                  id="reload-btn"
              >
                refresh
              </v-icon>
            </template>
            <span>Reload Results</span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="search"
              label="Search for Run Name"
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
            <td style="text-align:center">{{
                props.item.started_at.replace("Z", "").replace("T", " ").substring(0, 19)
              }}
            </td>
            <td>{{ getDisplayName(props.item.method) }}</td>
            <td>{{ props.item.dataset_name }}</td>
            <td>{{ displayParameter(props.item.params) }}</td>
            <td>{{ displayRunName(props.item.name) }}</td>
            <td><span :style="{'color': getStatusColor(props.item.status)}">{{ props.item.status.toUpperCase() }}</span>
            </td>
            <td>{{ displayScore(props.item) }}</td>
            <td><span v-if="props.item.status !== 'scheduled' && props.item.status !== 'started'">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                      small
                      @click="showResult(props.item)"
                      v-bind="attrs"
                      v-on="on"
                  >
                    visibility
                  </v-icon>
                </template>
                <span>Show Result</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                      small
                      @click="showEditName(props.item)"
                      v-bind="attrs"
                      v-on="on"
                  >
                    edit
                  </v-icon>
                </template>
                <span>Edit Name</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                      small
                      @click="showDeleteResult(props.item)"
                      v-bind="attrs"
                      v-on="on"
                  >
                    delete
                  </v-icon>
                </template>
                <span>Delete Result</span>
              </v-tooltip>
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        :timeout="deleteSnackbarTimeout"
        :top=true
    >
      Delete Result {{ resultToDelete.name }}?

      <v-btn
          color="error"
          small
          :loading="deleteBtn"
          :disabled="deleteBtn"
          @click="deleteResult"
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
    <v-dialog
        v-model="editDialogVisible"
        max-width="290"
    >
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          Edit Result Name
        </v-card-title>

        <v-card-text>
          <v-text-field
              v-model="newResultName"
              label="Name"
              single-line
              hide-details
              clearable
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              color="primary"
              text
              @click="editName"
              :loading="editBtn"
              :disabled="editBtn"
          >
            Edit
          </v-btn>

          <v-btn
              color="error"
              text
              @click="editDialogVisible = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import {GREEN_FILL, RED_FILL, GRAY, PRIMARY} from "@/colors";
import {DELETE_RESULT_ENDPOINT, GET_SERVICE_STATUS_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT} from "@/RESTconf";
import {mapGetters} from 'vuex'
import {getMethodObj, METHODS} from "@/methods";
import {
  ACTION_DELETE_RESULT,
  ACTION_EDIT_RESULT_NAME,
  // mutations
  MUTATE_SELECTED_RESULT,
  MUTATE_SELECTED_METHOD
} from "@/store/types";
import {setTheme, SNACKBAR_DISPLAY_TIME, THEME_UVL} from "@/theme";
import {loadDataset, reloadResults} from "@/RESTcalls";

export default {
  name: "StartDetectionHome",
  components: {
    "empty-parameter": () => import("./form/EmptyParameter"),
    "lda-parameter": () => import("./form/LdaParameter"),
    "seanmf-parameter": () => import("./form/SeanmfParameter"),
    "frequency-rbai-parameter": () => import("./form/FrequencyRBAIParameter"),
    "frequency-fcic-parameter": () => import("./form/FrequencyFCICParameter")
  },
  computed: {
    component() {
      return getMethodObj(this.selectedMethod).parameterComponentName;
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
    }
  },
  data() {
    return {
      key: this.$route.path,
      selectedDataset: "",
      serviceStatus: "NA",
      serviceColor: GRAY,
      runMethods: METHODS,
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
      cardTableTitle: "Last Runs",
      rawData: [],
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
    };
  },
  methods: {
    updateServiceStatus(service) {
      if (service === "") {
        this.serviceColor = GRAY;
        this.serviceStatus = "NA";
      } else {
        this.checkServiceStatus(service);
      }
    },
    showResult(item) {
      this.updateTheme("Detection Results", THEME_UVL)
      this.$router.push("/results");
      this.$store.commit(MUTATE_SELECTED_RESULT, item);
      loadDataset(this.$store, item["dataset_name"]);
    },
    showEditName(item) {
      this.resultToEdit = item;
      this.newResultName = item.name;
      this.editDialogVisible = true;
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
          }).finally( () => {
            this.editBtn = false;
            this.editDialogVisible = false;
            setTimeout(() => {
              this.snackbarVisible = false;
            }, SNACKBAR_DISPLAY_TIME);
      });
    },
    showDeleteResult(item) {
      this.resultToDelete = item;
      this.deleteSnackbarVisible = true;
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
          }).finally( () => {
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
    updateTheme(title, theme) {
      if (theme !== "") {
        setTheme(title, theme, this.$store);
      }
    },
    getStatusColor(status) {
      let color;
      if (status === "finished") {
        color = GREEN_FILL;
      } else if (status === "failed") {
        color = RED_FILL;
      } else if (status === "started") {
        color = PRIMARY;
      } else {
        color = GRAY;
      }
      return color;
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
          }).finally( () => {
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
    displayParameter(params) {
      return (JSON.stringify(params).replace("{", "").replace("}", "")
          .replaceAll('"', "").replaceAll(",", ", "));
    },
    displayScore(item) {
      return getMethodObj(item.method).scoreFunction(item);
    },
    displayRunName(name) {
      if (name === "") {
        return "-";
      } else {
        return name;
      }
    },
    getDisplayName(method) {
      return getMethodObj(method).displayName;
    },
    async reloadResults() {
      if(!(this._inactive)) {
        await reloadResults(this.$store);
      }
    },
  },
  mounted() {
    this.updateServiceStatus(this.selectedMethod);

    setInterval(function () {
      if(!(this._inactive)) {
        this.updateServiceStatus(this.selectedMethod);
      }
    }.bind(this), 30000);

    setInterval(function () {
      this.reloadResults(this.$store);
    }.bind(this), 20000);

  }
}

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

#service-status {
  padding-left: 0;
  padding-top: 25px;
}

#reload-btn {
  margin-left: 10px;
}

table.v-table tbody td:first-child, table.v-table tbody td:not(:first-child), table.v-table tbody th:first-child, table.v-table tbody th:not(:first-child), table.v-table thead td:first-child, table.v-table thead td:not(:first-child), table.v-table thead th:first-child, table.v-table thead th:not(:first-child) {
  padding: 0 8px;
}

.dialog-title {
  font-weight: 500;
}

</style>