<template>
  <div>
    <div class="load-dashboard">
      <v-subheader>Choose saved dashboard or create new one</v-subheader>
      <v-select class="select-saved-data"
                v-model="selectedDashboard"
                :items="getSelectedData"
                label="Select Dashboard"
                dense
      >
        <template v-slot:item="{ item }" >
          <div>
            {{ item }}
            <i class="material-icons delete-icon" @click.stop="openDeleteSavedData(item)">delete</i>
          </div>
        </template>
      </v-select>
      <v-btn :style="{ backgroundColor: blueFill }" @click="openRestoreDataDialog()">Show Data</v-btn>
      <v-btn :style="{ backgroundColor: blueFill }" @click="openCreateDashboardDialog()">Create new Dashboard</v-btn>
      <p v-if="warningMessage1" style="color: red">{{warningMessage1}}</p>
    </div>

    <div>
      <v-dialog v-model="deleteSavedRelations" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this saved relations?</h3>
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
          <h3>If you choose to display this data, your current data will be deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
        </v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="loadDashboard()">
            Show
          </v-btn>
          <v-btn dark color="black" @click="closeRestoreDataDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="checkCreateDashboard" :max-width="400" >
      <v-card class="create-data">
        <v-card-title class="create-data">
          <h3>If you choose to create a new dashboard, your current changes will be deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
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
              label="Dashboard type"
              outlined
              dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="createNewDashboard()" :disabled="!dashboardType || !dashboardName || dashboardNameError !== ''">
            Create
          </v-btn>
          <v-btn dark color="black" @click="closeCreateDashboardDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRefreshDataSetDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">New Version of Dataset available!</v-card-title>
        <v-card-text>
          There is a newer version of the used dataset "{{ datasetNameToRefresh }}" available. Do you want to refresh your analysis?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="confirmRefresh">Yes</v-btn>
          <v-btn color="red darken-1" text @click="cancelRefresh">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div id="start" >
      <!--<div class="container">
        <v-card class="banner">
          <v-tabs
          >
            <v-tab :class="{ 'tab': true, 'tab-left': activeTab === '/uvldashboard/jira' }">
              <v-btn @click="navigateTo('/uvldashboard/jira')" >Jira Mode</v-btn>
            </v-tab>
            <v-tab :class="{ 'tab': true, 'tab-right': activeTab === '/uvldashboard/annotation' }">
              <v-btn @click="navigateTo('/uvldashboard/annotation')" >Annotation Mode</v-btn>
            </v-tab>
          </v-tabs>
        </v-card>
      </div>-->
      <router-view></router-view>
    </div>
  </div>
</template>

<script >

import {actionGetFeedbackNamesDates} from "../store/actions";
import axios from "axios";
import { POST_START_MULTIDETECTION_ENDPOINT } from "@/RESTconf";

export default {
  data() {
    return {
      selectedDashboard: "",
      checkRestoreData: false,
      warningMessage1: "",
      checkCreateDashboard: false,
      showRefreshDataSetDialog: false,
      datasetNameToRefresh: "",
      currentDatasetIndex: 0,
      datasetsToCheck: [],
      dashboardType: null,
      toggleRefresh: false, // if refresh of classification should be done
      dashboardTypes: ["Jira", "Annotation"],
      dashboardName: '', // Dashboard name input
      dashboardNameError: '', // Error message for invalid dashboard name
      resolveUserResponse: null, // To store the resolve function for the promise
      deleteSavedRelations: false
    };
  },
  mounted() {
    console.log("mounted started")
    console.log("finish mounted")
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
      if (this.selectedData === "") {
        this.warningMessage1 = "Error: No name selected. Please select a name"
      } else {
        this.warningMessage1 = ""
        this.checkRestoreData = true
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
      console.log(this.$store.state.selectedData)
    },
    openDeleteSavedData(item) {
      this.deleteSavedRelations = true
      this.savedDataToDelete = item
    },
    createNewDashboard() {
      let dashboardType = this.dashboardType
      let dashboardName = this.dashboardName
      console.log(dashboardType)
      console.log(this.$store.state.selectedData)
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
        if (this.dashboardType === "Annotation") {
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
      console.log(response.data)
      console.log("response")
      console.log(response.data.type)
      this.$store.commit('setDashboardData', response.data)

      //Check if any dataset is outdated
      await this.$store.dispatch("actionGetFeedbackNamesDates");
      await this.compareDatesOfDatasets()
      console.log("date check completed")
      console.log(this.$store.state.storedDatasets)
      if (response.data.type === "Annotation") {
        this.$store.commit("resetAnnotator")
        if (this.toggleRefresh){
          await this.refreshAnnotation()
        }
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
      console.log("comparing datasets")
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
        console.log("found updated datasets:")
        console.log (this.datasetsToCheck)
        await this.showRefreshDialogs();
        //this.showNextDialog();
      }
    },

    async showRefreshDialogs() {
      for (let i = 0; i < this.datasetsToCheck.length; i++) {
        this.datasetNameToRefresh = this.datasetsToCheck[i];
        this.showRefreshDataSetDialog = true;

        await new Promise(resolve => {
          this.resolveUserResponse = resolve;
        });
      }
    },

    confirmRefresh() {
      this.showRefreshDataSetDialog = false;
      this.refresh(); // Call the refresh function
      this.resolveUserResponse(); // Resolve the promise to proceed
    },

    cancelRefresh() {
      this.showRefreshDataSetDialog = false;
      this.resolveUserResponse(); // Resolve the promise to proceed without refreshing
    },

    async refreshAnnotation() {
      this.displaySnackbar("Starting Run.");
      axios.post(POST_START_MULTIDETECTION_ENDPOINT, this.getFormData()
      ).then(response => {
        if (response.status > 200 || response.status < 300) {
          this.displaySnackbar("Run has been finished successfully.");
          this.$store.dispatch("actionLoadResults")
          this.$store.dispatch("actionGetAllAnnotations")
        } else {
          this.displaySnackbar("Error finishing run!");
        }
      }).catch(() => {
        this.displaySnackbar("Could not contact backend!");
        console.log(this.getFormData());
      });
    },
    getFormData() {
      let params = {
        method: this.$store.state.storedClassifier,
        dataset: this.$store.state.storedDatasets.join('#!#'),
        debug: false,
        persist: true,
        name: this.$store.state.currentDashboardName,
        annotation_name: this.$store.state.currentDashboardName,
      };
      return JSON.stringify(params);
    },

    async refreshJira(){
      this.displaySnackbar("Starting Relation.");
      let selectedFeedback = this.$store.state.storedDatasets
      let maxSimilarity = this.$store.state.storedThreshold
      await this.$store.dispatch("actionAssignIssuesToManyFeedback", {selectedFeedback, maxSimilarity})
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
    },

    getSelectedData() {
      return this.$store.state.selectedData
    },
    async getSavedData() {
      console.log("get saved data")
      await this.$store.dispatch("actionGetSavedDataNames")
      console.log(this.$store.state.selectedData)
      this.tabs = this.$store.state.selectedData;
      this.tabCounter = this.tabs.length;

      // Automatically select the first tab if there are any tabs
      if (this.tabs.length > 0) {
        this.activeTab = 0;
      }
    },
    validateDashboardName() {
      if (this.$store.state.selectedData.includes(this.dashboardName)) {
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
    },
    // Close Delete Dialogs
    dontDeleteIssues(){
      this.deleteSavedRelations = false
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
.banner{
  margin-top: 50px;
  text-align: center;
}
.container{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
}
.load-dashboard {
  float: left;
  margin-right: 30px;
  border-right: 1px solid #ccc;
  padding-right: 80px;
}
.select-saved-data {
  width: 70%;
  margin-left: 10px;
}
.delete-icon {
  color: red;
}

</style>