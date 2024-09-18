<template>
  <v-container class="jiraview-container">
    <v-snackbar v-model="snackbarVisible" :timeout="snackbarTimeout" :top=true>
      {{ snackbarText }}

      <v-btn small color="primary" text @click="closeSnackbar">
        Close
      </v-btn>
    </v-snackbar>
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <v-dialog v-model="deleteOneRequirement" :max-width="300" class="delete-all-issues">
      <v-card>
        <v-card-title>
          <h3>Are you sure you want to delete this requirement?</h3>
        </v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="deleteIssue">
            Delete
          </v-btn>
          <v-btn dark color="black" @click="dontDeleteIssues()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card flat class="header blue-bg">
        <v-card-title primary-title>
          <h2>{{ $store.state.currentDashboardName }}</h2>
        </v-card-title>
      </v-card>
      <div>
        <ImportJiraProject class="element1"></ImportJiraProject>
      </div>
        <v-dialog v-model="isLoadingData" :max-width="300">
          <LoadingView/>
        </v-dialog>
      <v-container >
          <p class="headline-select-jira-project">
            Add Dataset to Dashboard:
          </p>
        <v-layout row wrap>
            <v-select class="select-issueTypes" v-model="selectedDatasetName" :items="datasets"
                      label="Select dataset" item-text="dataset"
            ></v-select>
            <v-btn class="primary" @click="addDataset()"> ADD
            </v-btn>

            <!-- File input (hidden) -->
            <input id="file-input-field" type="file" ref="fileInput" @change="handleFileSelection" style="display: none;"/>

            <!-- Label for the file input, acting as a button -->
            <label for="file-input-field" class="v-btn theme--light primary file-action-button file-picker-button">
              Choose file
            </label>
        </v-layout>
        <v-layout row wrap align-center>
          <p class="headline-threshold">
            Threshold:
          </p>
          <input id="maxSimilarity" class="chooseSimilarity" type="number" v-model="maxSimilarity" />
        </v-layout>
      </v-container>
    </v-card>
    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>

    <v-card class="dataset-list">
      <v-card flat>
        <v-card-title primary-title>
          <h2>Selected Datasets</h2>
        </v-card-title>
      </v-card>
      <v-layout row wrap>
        <v-card
            id="datasetTile"
            max-width="400"
            min-width="360"
            height="100"
            v-for="dataset in selectedDatasets"
            v-bind:key="dataset"
            class="dataset-tile"
        >
          <v-card-title><h3>{{ dataset }}</h3></v-card-title>
          <v-btn small outline color="error" @click="showRemoveDataset(dataset)" class="btnAlign">
            Remove
          </v-btn>
          <v-btn small color="primary" @click="showDataset(dataset)" class="btnAlign">
            Show
          </v-btn>
        </v-card>
      </v-layout>
    </v-card>

    <div class="d-flex justify-center">
      <v-btn color="red" @click="assignFeedbackToIssues()"> Automatically relate feedback to requirements
      </v-btn>
    </div>

    <v-card class="jira-requirements">
        <v-card-title>
          <h2>Jira Requirements</h2>
        </v-card-title>
      <v-card class="table-options">
          <div class="search-in-table">
            <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
          </div>
          <v-layout row wrap align-center>
          <label for="showUnassigned" class="label-text">Show requirements without assigned feedback:</label>
          <v-switch id="showUnassigned" class="label-text" v-model="showUnassigned" @change="getUnassignedIssues"></v-switch>
          </v-layout>
      </v-card>

        <v-data-table :headers="headers"
                      :items="getIssues"
                      class="elevation-1"
                      :rows-per-page-items="pagination.rowsPerPageItems"
                      :pagination.sync="pagination"
                      @update:pagination.self="getAllIssues()"
                      :total-items="$store.state.totalIssueItems"
                      item-key="key"
                      >
          <template slot="items" slot-scope="props">
            <tr @click="toggleExpand(props.index)">
              <td v-for="field in Object.keys(props.item)" :key="field" class="text-xs-left">
                {{ props.item[field] }}
              </td>
              <td>
                <v-icon>{{ isExpanded(props.index) ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
              </td>
              <td>
                <i class="material-icons delete-icon pointer-cursor" style="color: red;" @click.stop="openDeleteOneRequirementDialog(props.item)">delete</i>
              </td>
            </tr>

            <tr v-if="expandedRow === props.index">
              <td :colspan="headers.length + 2">
                <issue-details :item="props.item" :page="nestedPage"/>
              </td>

            </tr>
          </template>

          <template slot="no-data">
            <v-alert :value="true" type="error">
              No matching records found
            </v-alert>
          </template>
          <div class="export-buttons">
            <v-btn class="primary" @click="getAssignedDataToExport()"> Export relations Data to CSV </v-btn>
          </div>
        </v-data-table>

      </v-card>

  </v-container>


</template>

<script >

import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";
import ImportJiraProject from "@/components/uvlDashboardViews/ImportJiraProject.vue";
import StartDetectionHome from "@/components/uvlDashboardViews/StartDetectionHome.vue";
import LoadFeedbackFromDB from "@/components/jiraDashboardViews/LoadFeedbackFromDB.vue";
import { getMethodObj, DASHBOARD_METHODS } from "@/methods";
import {POST_UPLOAD_DATASET_ENDPOINT} from "@/RESTconf";
import {setTheme, SNACKBAR_DISPLAY_TIME, THEME_UVL} from "@/theme";
import {MUTATE_SELECTED_DATASET_OUTSIDE} from "@/store/types";

import {mapGetters} from "vuex";
import axios from "axios";
import IssueDetails from "./issueDetails.vue";
import {loadDatasets} from "../../RESTcalls";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  components: {
    IssueDetails,
    StartDetectionHome,
    LoadingView,
    ImportJiraProject,
    LoadFeedbackFromDB,
  },
  data() {
    return {
      expanded: [],
      expandedRow: null,
      isProjectSelected: true,
      projectName: "",
      importDialog: false,
      loading: false,
      selectedDatasets: [],
      selectedDatasetName: "",
      showUnassigned: false,
      maxSimilarity: 0,
      headers: [
        {text: "Description", value: "description", sortable: false},
        {text: "Requirement Type", value: "issueType", sortable: false},
        {text: "Requirement Name", value: "key", sortable: false},
        {text: "Project Name", value: "projectName", sortable: false},
        {text: "Summary", value: "summary", sortable: false},
      ],

      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },

      search: "",
      warning: "Select/import a project or feedback",
      deleteOneRequirement: false,
      itemToDelete: [],
      expandablePage: 1, // Page number of expandable
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
    }
  },
  methods:{
    handleFileSelection(event) {
      // Get the selected file (optional: store file data)
      const file = event.target.files[0];
      if (file) {
        // Automatically call the uploadFile method
        this.uploadFile(file);
      }
    },

    getAllJiraProjects() {
      this.$store.dispatch("actionGetAllJiraProjects")
    },
    async uploadFile(file) {
      let filename = file.name
      if (!(filename.endsWith(".csv")) &&
          !(filename.endsWith(".txt")) &&
          !(filename.endsWith(".xlsx"))
      ) {
        this.displaySnackbar("File type not allowed!");
        setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
      } else {
        this.loading = true;
        let formData = new FormData();
        formData.append('file', file);
        axios.post(POST_UPLOAD_DATASET_ENDPOINT,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
        ).then(response => {
          if (response.status > 200 || response.status < 300) {
            this.displaySnackbar(response.data.message);
            setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
            loadDatasets(this.$store);
          } else {
            this.displaySnackbar("Error with file upload!");
          }
        }).catch(() => {
          this.displaySnackbar("Could not contact backend!");
        }).finally(() => {
          this.loading = false;
        });
      }
      console.log(filename.split('.')[0]);
      this.selectedDatasetName = filename.split('.')[0]
      this.addDataset()
    },
    getProjectNames() {
      this.$store.dispatch("actionGetImportedJiraProjects")
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },

    // Close Dialog for import jira issues
    toggleImport(value) {
      console.log("toggleImport");
      this.importDialog = value;
      this.getAllIssues()
      this.getProjectNames()
    },
    showDataset(dataset) {
      this.updateTheme("Dataset View", THEME_UVL);
      this.$store.commit(MUTATE_SELECTED_DATASET_OUTSIDE, dataset);
      this.$router.push("/dataset");
    },
    addDataset() {
      if(this.selectedDatasetName) {
        if (!this.selectedDatasets.includes(this.selectedDatasetName, 0)) {
          this.selectedDatasets.push(this.selectedDatasetName);
        }
      } else {
        this.displaySnackbar("Please select a dataset first.")
      }

    },
    showRemoveDataset(dataset){
      const index = this.selectedDatasets.indexOf(dataset)
      this.selectedDatasets.splice(index, 1)
    },
    updateTheme (title, theme) {
      if (theme !== "") {
        setTheme(title, theme, this.$store);
      }
    },
    async assignFeedbackToIssues(){
      let selectedFeedback = this.selectedDatasets
      console.log (selectedFeedback)
      let maxSimilarity = 0
      if (this.maxSimilarity !== ""){
        maxSimilarity = this.maxSimilarity
      }
      await this.$store.dispatch("actionAssignIssuesToManyFeedback", {selectedFeedback, maxSimilarity})
      console.log("relation successful")
      let data_to_store = {
        datasets: this.selectedDatasets,
        name: this.$store.state.currentDashboardName,
        threshold: maxSimilarity,
        classifier: "",
        type: "Jira"
      }
      this.$store.commit('setDashboardData', data_to_store)
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
      console.log("updated saved_data")
      this.$store.commit('setIssuesHaveChanged', false);
      this.getAllIssues()
    },
    getAllIssues() {
      if(this.showUnassigned){
        this.getUnassignedIssues()
      }else{
        let page = this.pagination.page
        let size = this.pagination.rowsPerPage
        this.$store.dispatch("actionGetAllIssues", {page, size})
      }
    },
    async getUnassignedIssues() {
      if(this.showUnassigned){
        let page = this.pagination.page
        let size = this.pagination.rowsPerPage
        await this.$store.dispatch("actionGetIssuesWithoutAssignment", {page, size})
      }else{
        this.getAllIssues()
      }
    },
    openDeleteOneRequirementDialog(item) {
      this.deleteOneRequirement = true
      this.itemToDelete = item
    },
    toggleExpand(index) {
      this.expandedRow = this.expandedRow === index ? null : index;
      this.expandablePage = 1
    },
    isExpanded(index) {
      return (this.expandedRow === index);
    },
    async getAssignedDataToExport() {
      let selectedFeedback
      if(this.$store.state.selectedFeedback === ""){
        selectedFeedback = "None"
      }else{
        selectedFeedback = this.$store.state.selectedFeedback
      }
      await this.$store.dispatch("actionGetAssignedDataToExport", selectedFeedback)
      this.exportAssignedDataToCSV()
    },
    exportAssignedDataToCSV() {
      const csvContent = [];
      const dataToExport = this.$store.state.dataToExport;

      if (dataToExport.length === 0) {
        return;
      }
      const issueKeys = [];
      const issueSummaries = [];
      const issueDescriptions = [];

      for (const data of dataToExport) {
        issueKeys.push(data.issue_key);
        issueSummaries.push(data.issue_summary);
        issueDescriptions.push(data.issue_description);
      }
      csvContent.push('issue_key#' + issueKeys.join('##'));
      csvContent.push('issue_summary#' + issueSummaries.join('##'));
      csvContent.push('issue_description#' + issueDescriptions.join('##'));

      const maxFeedbackCount = Math.max(...dataToExport.map(data => data.feedback_data.length));

      for (let i = 0; i < maxFeedbackCount; i++) {
        const feedbackIdRow = [];
        const feedbackTextRow = [];

        for (const data of dataToExport) {
          if (i < data.feedback_data.length) {
            const feedback = data.feedback_data[i];
            feedbackIdRow.push(feedback.feedback_id);
            feedbackTextRow.push(feedback.feedback_text);
          } else {
            feedbackIdRow.push('');
            feedbackTextRow.push('');
          }
        }
        csvContent.push('feedback_id' + (i + 1) + '#' + feedbackIdRow.join('##'));
        csvContent.push('feedback_text' + (i + 1) + '#' + feedbackTextRow.join('##'));
      }
      const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assigned_feedback-issues.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    loadDashboardData(){
      console.log("loading dashboard data due to change of dashboard name")
      this.selectedDatasets = this.$store.state.storedDatasets
      this.maxSimilarity = this.$store.state.storedThreshold
      this.getAllIssues()
    },
    async deleteIssue(){
      try {
        const projectName = this.itemToDelete.projectName
        const issueKey = this.itemToDelete.key
        await this.$store.dispatch("actionDeleteIssue", {projectName, issueKey});
        this.getAllIssues();
        this.getProjectNames();
        await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
        this.itemToDelete = []
        this.deleteOneRequirement = false
      } catch (error) {
        console.error("Error:", error);
      }
    },
    // Close Delete Dialogs
    dontDeleteIssues(){
      this.deleteAllIs = false
      this.deleteOneRequirement = false
      this.deleteAllRequirementsByProjectName = false
      this.deleteSavedRelations = false
    },
  },
  watch: {
    currentDashboardName(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.$store.state.storedDashboardType === "Jira"){
          this.loadDashboardData();
        }
      }
    }
  },
  computed:{
    currentDashboardName() {
      // Map the store's state to a computed property
      return this.$store.state.currentDashboardName;
    },
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    component() {
      return getMethodObj(DASHBOARD_METHODS, this.selectedMethod).parameterComponentName;
    },

    ...mapGetters({
      datasets: 'datasets'
    }),
    getIssues() {
      if (this.showUnassigned){
        if(this.search !== ""){
          return this.filterUnassignedIssues
        }else{
          return this.$store.state.issuesWithoutAssignment
        }
      }else{
        if(this.search !== ""){
          return this.filterIssues
        }else{
          return this.$store.state.issues
        }
      }
    },
    filterUnassignedIssues() {
      return this.$store.state.issuesWithoutAssignment.filter(issue => {
        const summary = issue.summary || "";
        const key = issue.key || "";
        const description = issue.description || "";
        const issueType = issue.issueType || "";
        const projectName = issue.projectName || "";
        return summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      });
    },
    filterIssues() {
      return this.$store.state.issues.filter(issue => {
        const summary = issue.summary || "";
        const key = issue.key || "";
        const description = issue.description || "";
        const issueType = issue.issueType || "";
        const projectName = issue.projectName || "";
        return summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      });
    },
  },
  mounted() {
    console.log("mounted function executed")
    this.getAllJiraProjects()
    this.getAllIssues()
    if (this.$store.state.storedThreshold !== ""){ // Only saved dashboards already have a threshold, not newly created ones
      console.log("need to load jira dashboard")
      this.loadDashboardData();
    }
  }
}
</script>

<style scoped>
.header{
  margin-bottom: 20px
}
.headline-select-jira-project{
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: bold;
}
.headline-threshold{
  font-size: 18px;
  margin-bottom: 0;
  font-weight: bold;
}
.select-issueTypes {
  flex: 1; /* Makes the dropdown take up all available space */
}
.pointer-cursor {
  cursor: pointer; /* Makes the cursor a hand when hovering over the delete icon */
}
.chooseSimilarity{
  width: 70px;
  border: 2px solid #ccc;
  padding: 5px;
  margin-left: 5px;
}
.export-buttons {
  float: left;
  margin-left: 20px;
}
.jiraview-container{
  margin:0;
  padding-top: 20px;
  padding-left: 0;
  padding-right: 0
}
.dataset-list{
  margin-top: 20px;
}
.dataset-tile{
  margin: 20px
}
.jira-requirements{
  margin-top: 20px;
}
.label-text{
  padding: 5px
}
.table-options{
  margin: 20px;
  padding: 20px
}
.blue-bg{
  background-color: rgb(0, 189, 187)
}
</style>