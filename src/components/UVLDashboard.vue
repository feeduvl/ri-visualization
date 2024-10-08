<template>
  <v-container>
    <v-card>
      <v-card flat class="header">
        <v-card-title primary-title>
          <h2>Choose to load a saved dashboard or create a new dashboard.</h2>
        </v-card-title>
      </v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs12 sm7 md6>
            <v-select class="select-saved-data"
                      v-model="selectedDashboard"
                      :items="getSelectedData"
                      item-text="name"
            item-value="name"
            label="Select Dashboard"
            dense
            >
            <template v-slot:item="{ item }">
              <div class="dropdown-item">
                <span class="item">{{ item.name }} ({{ item.type }})</span>
                <i class="material-icons delete-icon" @click.stop="openDeleteSavedData(item)">delete</i>
              </div>
            </template>
            </v-select>
          </v-flex>
          <v-flex xs12 sm6 md3>
            <v-btn class="primary" @click="openRestoreDataDialog()">Load Dashboard</v-btn>
          </v-flex>
          <v-flex xs12 sm6 md3>
            <v-btn class="success" @click="openCreateDashboardDialog()">Create new Dashboard</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
      <p v-if="warningMessage1" class="warning_text">{{warningMessage1}}</p>
    </v-card>

    <div>
      <v-dialog v-model="deleteSavedRelations" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this dashb?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteSavedData">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteIssues()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>


    <v-dialog v-model="checkRestoreData" :max-width="400" >
      <v-card class="restore-data">
        <v-card-title class="restore-data">
          <h3>If you choose to load a new dashboard, data of your currently edited annotation may me deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
        </v-card-title>
        <v-card-actions>
          <v-btn class="success" @click="loadDashboard()">
            Open Dashboard
          </v-btn>
          <v-btn color="red" @click="closeRestoreDataDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="checkCreateDashboard" :max-width="400" >
      <v-card class="create-data">
        <v-card-title class="create-data">
          <h3>Please configure the dashboard that you want to create.</h3>
          <h4>Attention: If you choose to create a new dashboard, changes of a currently edited annotation may be deleted.</h4>
        </v-card-title>
        <v-card-text>
          <!-- Input field for Dashboard Name -->
          <v-text-field
              v-model="dashboardName"
              label="Dashboard Name"
              outlined
              dense
              :error-messages="dashboardNameError"
              @input="validateDashboardName"
          ></v-text-field>
          <!-- Error message -->
          <v-alert
              v-if="dashboardNameError"
              type="error"
              dense
          >
            {{ dashboardNameError }}
          </v-alert>

          <v-select
              v-model="dashboardType"
              :items="dashboardTypes"
              label="Dashboard Type"
              outlined
              dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn class="success" @click="createNewDashboard()" :disabled="!dashboardType || !dashboardName || dashboardNameError !== ''">
            Create
          </v-btn>
          <v-btn color="red" @click="closeCreateDashboardDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRefreshDataSetDialog" max-width="400">
      <v-card>
        <v-card-title>
          <h3>New Version of Dataset available!</h3>
          <h4>There is a newer version of the used dataset "{{ datasetNameToRefresh }}" available. Do you want to refresh your analysis?
          </h4>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="success" text @click="confirmRefresh">Yes</v-btn>
          <v-btn color="red" text @click="cancelRefresh">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div id="start" >
    </div>
    <v-snackbar v-model="snackbarVisible" :timeout="snackbarTimeout" :top=true>
      {{ snackbarText }}

      <v-btn small color="primary" text @click="closeSnackbar">
        Close
      </v-btn>
    </v-snackbar>
    <router-view></router-view>
  </v-container>
</template>

<script >

import {actionGetFeedbackNamesDates} from "../store/actions";
import axios from "axios";
import { POST_START_MULTIDETECTION_ENDPOINT } from "@/RESTconf";
import { SNACKBAR_DISPLAY_TIME } from "@/theme";

export default {
  data() {
    return {
      snackbarVisible: false,
      snackbarText: "",
      snackbarTimeout: SNACKBAR_DISPLAY_TIME,
      selectedDashboard: "",
      checkRestoreData: false,
      warningMessage1: "",
      checkCreateDashboard: false,
      showRefreshDataSetDialog: false,
      datasetNameToRefresh: "",
      datasetsToCheck: [],
      dashboardType: null,
      toggleRefresh: false, // if refresh of classification should be done
      dashboardTypes: ["Relation", "Usage Information"],
      dashboardName: '', // Dashboard name input
      dashboardNameError: '', // Error message for invalid dashboard name
      resolveUserResponse: null, // To store the resolve function for the promise
      deleteSavedRelations: false
    };
  },
  activated() {
    this.getSavedDataNames()
  },
  methods: {
    navigateTo(route) {
      this.activeTab = route.split('/').pop();
      this.$router.push(route);
    },
    openRestoreDataDialog() {
      if (this.selectedDashboard === "") {
        this.displaySnackbar("Error: No Dashboard selected. Please select a Dashboard");
      } else {
        if (this.$store.state.currentDashboardName) {
          this.warningMessage1 = ""
          this.checkRestoreData = true
        } else {
          this.loadDashboard()
        }
      }
    },
    closeRestoreDataDialog() {
      this.checkRestoreData = false
    },

    openCreateDashboardDialog() {
      this.checkCreateDashboard = true
    },
    closeCreateDashboardDialog() {
      this.checkCreateDashboard = false
    },
    // Get names of the saved relations
    getSavedDataNames() {
      this.$store.dispatch("actionGetSavedDataNames")
      console.log("got saved data names")
    },
    openDeleteSavedData(item) {
      this.deleteSavedRelations = true
      this.savedDataToDelete = item.name
    },
    createNewDashboard() {
      let dashboardType = this.dashboardType
      let dashboardName = this.dashboardName
      this.$store.dispatch("actionCreateDashboard", {dashboardName, dashboardType});
      let data_to_store = {
        datasets: [],
        name: dashboardName,
        threshold: "",
        classifier: "",
        type: dashboardType
      }
      this.$store.commit('setDashboardData', data_to_store)
      if (!this.dashboardNameError) {
        if (this.dashboardType === "Usage Information") {
          this.$store.commit("resetAnnotator")
          this.navigateTo('/uvldashboard/annotation')
        } else {
          this.navigateTo('/uvldashboard/jira')
        }
        this.closeCreateDashboardDialog()
      }
      this.getSavedDataNames()
    },
    async loadDashboard(){
      let response = await this.$store.dispatch("actionGetSelectedData", this.selectedDashboard);
      this.$store.commit('setDashboardData', response.data)
      this.$store.commit('setClassifierDetail', response.data.classifier_detail)

      //Check if any dataset is outdated
      await this.$store.dispatch("actionGetFeedbackNamesDates");
      await this.compareDatesOfDatasets()
      if (response.data.type === "Usage Information") {
        this.$store.commit("resetAnnotator")
        if (this.toggleRefresh){
          await this.refreshAnnotation()
        }
        this.$store.commit('setNeedToLoadDashboard', true)
        this.navigateTo('/uvldashboard/annotation')
      } else {
        if (this.toggleRefresh){
          await this.refreshJira()
        }
        this.navigateTo('/uvldashboard/jira')

      }
      this.checkRestoreData = false
    },

    async compareDatesOfDatasets() {
      this.toggleRefresh = false
      this.datasetsToCheck = this.$store.state.storedDatasetsWithDates.map(storedDataset => {
        let correspondingDataset = this.$store.state.allDatasetsWithDates.find(dataset => dataset.name === storedDataset.name);

        if (correspondingDataset) {
          const storedDate = new Date(storedDataset.uploaded_at);
          const allDatasetDate = new Date(correspondingDataset.uploaded_at);

          if (storedDate.getTime() < allDatasetDate.getTime()) {
            console.log(`A newer version exists for dataset: ${storedDataset.name}`);
            return storedDataset.name; // Return name to show in dialog
          } else {
            console.log(`There is no newer dataset: ${storedDataset.name}`);
          }
        } else {
          console.log(`No corresponding dataset found for: ${storedDataset.name}`);
        }
        return null;
      }).filter(name => name !== null);

      if (this.datasetsToCheck.length > 0) {
        await this.showRefreshDialogs();
      }
    },

    async showRefreshDialogs() {
      this.shouldSkipRemainingDialogs = false;

      for (let i = 0; i < this.datasetsToCheck.length; i++) {
        if (this.shouldSkipRemainingDialogs){
          break;
        }
        this.datasetNameToRefresh = this.datasetsToCheck[i];
        this.checkRestoreData = false
        this.showRefreshDataSetDialog = true;

        await new Promise(resolve => {
          this.resolveUserResponse = resolve;
        });
      }
    },

    confirmRefresh() {
      this.showRefreshDataSetDialog = false;
      this.shouldSkipRemainingDialogs = true;
      this.toggleRefresh = true;
      this.resolveUserResponse(); // Resolve the promise to proceed
    },

    cancelRefresh() {
      this.showRefreshDataSetDialog = false;
      this.resolveUserResponse(); // Resolve the promise to proceed without refreshing
    },

    async refreshAnnotation() {
      this.displaySnackbar("Starting Run.");
      let index = this.$store.state.available_annotations.findIndex(item => item.name === this.$store.state.currentDashboardName);
      this.$store.state.available_annotations.splice(index, 1)

      const response = await axios.post(POST_START_MULTIDETECTION_ENDPOINT, this.getFormData());
      console.log(response)
      if (response.status >= 200 && response.status < 300) {
        this.displaySnackbar("Run has been finished successfully.");
        console.log("run finished")
        this.$store.dispatch("actionLoadResults");
        console.log("actionLoadResults finished")
        this.$store.dispatch("actionGetAllAnnotations");
        console.log("new annotation list")
        console.log(this.$store.state.available_annotations)
      } else {
        this.displaySnackbar("Error finishing run!");
      }

      // Return a promise to wait for the store variable update
      await new Promise((resolve) => {
        const unwatch = this.$watch(
            () => this.$store.state.available_annotations.find(a => a.name === this.$store.state.currentDashboardName),
            (newValue) => {
              if (newValue !== null) {
                console.log('Store variable updated:');
                console.log(newValue)
                console.log(this.$store.state.available_annotations)
                unwatch(); // Stop watching after the variable is updated
                resolve();
              }
            }
        );
      });
      console.log("annotation finished")

    },
    getFormData() {
      let params = {
        method: this.$store.state.storedClassifierDetail,
        dataset: this.$store.state.storedDatasets.join('#!#'),
        debug: false,
        persist: true,
        name: this.$store.state.currentDashboardName,
        annotation_name: this.$store.state.currentDashboardName,
      };
      console.log("getFormData")
      console.log(params)
      return JSON.stringify(params);
    },

    async refreshJira(){
      this.displaySnackbar("Starting Relation.");
      let selectedFeedback = this.$store.state.storedDatasets
      let maxSimilarity = this.$store.state.storedThreshold
      await this.$store.dispatch("actionAssignIssuesToManyFeedback", {selectedFeedback, maxSimilarity})
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },
    validateDashboardName() {
      let allDashboardNames = this.getAllDashboardNames();
      if (allDashboardNames.includes(this.dashboardName)) {
        this.dashboardNameError = 'This dashboard name already exists. Please choose a different name.';
      } else {
        this.dashboardNameError = '';
      }
    },
    async deleteSavedData(){
      let item = this.savedDataToDelete
      await this.$store.dispatch("actionDeleteSavedData", item);
      this.getSavedDataNames()
      this.deleteSavedRelations = false
      this.savedDataToDelete = []
      if (item === this.$store.state.currentDashboardName){
        this.navigateTo('/uvldashboard')
      }
    },
    // Close Delete Dialogs
    dontDeleteIssues(){
      this.deleteSavedRelations = false
    },
    getAllDashboardNames() {
      return this.$store.state.selectedData.map(dashboard => dashboard.name);
    },
  },
  computed: {
    getSelectedData() {
      return this.$store.state.selectedData
    },

  }
};
</script>

<style scoped>
#start {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.select-saved-data {
  flex: 1;
}
.delete-icon {
  cursor: pointer;
  color: red;
  margin-left: 10px;
}
.warning_text {
  color: red;
}
.dropdown-item {
  display: flex;
  justify-content: space-between; /* Ensures the name and icon are spaced apart */
  align-items: center;
  width: 100%;
}
.item {
  flex: 1; /* Makes sure the name takes up all available space */
}
</style>