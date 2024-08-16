<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <div class="import-elements">
      <div class="import-buttons">
        <ImportJiraProject class="element1"></ImportJiraProject>
      </div>
    </div>

    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <p class="headline-select-jira-project">
      Select Datasets to use:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="selectedDatasetName" :items="datasets"
                label="Select dataset" item-text="dataset"
      ></v-select>
      <v-btn dark color="blue" @click="addDataset()"> ADD
      </v-btn>
    </div>
    <component v-bind:is="component" v-bind:dataset="selectedDataset" />
    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>
    <!--<v-card>
      <v-card flat class="header">
        <v-card-title primary-title>
          <h2>Select File</h2>
        </v-card-title>
      </v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs4>
            <input id="file-input-field" type='file' hidden @change="getFileName"/>
            <v-text-field
                label="File Name"
                v-model="fileDisplayName"
                readonly
                prepend-icon="attach_file"
                class="file-name-field"
            ></v-text-field>
          </v-flex>
          <v-flex xs3>
            <label for="file-input-field" class="v-btn v-btn--small theme--light primary file-action-button file-picker-button">Choose
              file</label>
            <v-btn small color="primary" :loading="loading" :disabled="loading" @click="uploadFile(fileDisplayName)">Upload</v-btn>
          </v-flex>
          <v-flex xs5>
            <span :style="{'color': 'gray'}">Currently allowed file types: xlsx, csv and txt. The dataset will be saved with its filename. Uploading a dataset which name already exists will update the dataset. For csv and txt the delimiter is set to '|'.
            <br /> Note: FCIC and RBAI require UTF-8 compatible encodings. Please consider that any typographic errors and unexpected characters may lead to artifacts in the results.</span>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card> -->


    <v-card id="listingWrapper">
      <v-card flat class="header">
        <v-card-title primary-title>
          <h2>Selected Datasets</h2>
        </v-card-title>
      </v-card>
      <v-layout row wrap id="datasetListing">
        <v-card
            id="datasetTile"
            max-width="400"
            min-width="360"
            height="100"
            v-for="dataset in selectedDatasets"
            v-bind:key="dataset"
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

    <!--<v-card>
      <div>
        <StartDetectionHome class="element1"></StartDetectionHome>
      </div>
    </v-card>-->
    <div>
      <v-btn dark color="red" @click="assignFeedbackToIssues()"> Automatically relate feedback to requirements
      </v-btn>
    </div>





    <h2>Jira Requirements Headline</h2>

    <div class="main-issue-table">
      <v-card class="v-card">
        <v-card-title>
          <h2>Jira Requirements</h2>

          <div class="search-in-table">
            <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
          </div>

          <div class="switch-container">
            <div class="label-container">
              <label for="showUnassigned" class="label-text">Show requirements without assigned feedback:</label>
            </div>
            <div class="switch-content">
              <v-switch id="showUnassigned" v-model="showUnassigned" @change="getUnassignedIssues"></v-switch>
            </div>
          </div>
        </v-card-title>

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
                <i class="material-icons delete-icon"  @click.stop="openDeleteOneRequirementDialog(props.item)">delete</i>
              </td>
            </tr>
            <tr v-if="expandedRow === props.index">
              <td :colspan="headers.length + 2">
                <v-alert :value="true" type="info">
                  <strong>Details:</strong> This is additional information for {{ props.item.key }}.
                </v-alert>
                <v-data-table
                    :headers="header_details"
                    :items="getAssignedFeedbackFilter"
                    item-key="id"
                    class="elevation-1"
                    :total-items="$store.state.totalAssignedFeedbackItems"
                    rows-per-page-text="Feedback per page"
                    :rows-per-page-items="pagination_expandable.rowsPerPageItems"
                    :pagination.sync="pagination_expandable"
                    @update:pagination.self="getAssignedFeedback(props.item)"
                    :no-data-text="warning"
                >
                  <template v-slot:items="props">
                    <td>{{ props.item.id }}</td>
                    <td>{{ props.item.text }}</td>
                    <td>{{ props.item.similarity }}</td>
                    <td>
                      <i class="material-icons delete-icon" @click="openDeleteOneAssignmentDialog(props.item)">delete</i>
                    </td>
                  </template>
                </v-data-table>
                <!-- Additional details or nested components can go here -->
              </td>

            </tr>
          </template>

          <template slot="no-data">
            <v-alert :value="true" type="error">
              No matching records found
            </v-alert>
          </template>

        </v-data-table>
      </v-card>
    </div>
  </div>


</template>

<script >

import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";
import ImportJiraProject from "@/components/uvlDashboardViews/ImportJiraProject.vue";
import StartDetectionHome from "@/components/uvlDashboardViews/StartDetectionHome.vue";
import LoadFeedbackFromDB from "@/components/jiraDashboardViews/LoadFeedbackFromDB.vue";
import { getMethodObj, METHODS } from "@/methods";
import {POST_UPLOAD_DATASET_ENDPOINT} from "@/RESTconf";
import {setTheme, SNACKBAR_DISPLAY_TIME, THEME_UVL} from "@/theme";
import {MUTATE_SELECTED_DATASET_OUTSIDE, MUTATE_SELECTED_RESULT} from "@/store/types";

import {mapGetters} from "vuex";
import axios from "axios";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  components: {
    StartDetectionHome,
    LoadingView,
    ImportJiraProject,
    LoadFeedbackFromDB,
    "empty-parameter": () => import("./../form/EmptyParameter"),
    "lda-parameter": () => import("./../form/LdaParameter"),
    "seanmf-parameter": () => import("./../form/SeanmfParameter"),
    "frequency-rbai-parameter": () => import("./../form/FrequencyRBAIParameter"),
    "frequency-fcic-parameter": () => import("./../form/FrequencyFCICParameter"),
    "acceptance-criteria-parameter": () => import("./../form/AcceptanceCriteriaParameter"),
    "stanford-ner-parameter": () => import("./../form/StanfordNERParameter"),
    "bi-lstm-parameter": () => import("./../form/BiLSTMParameter"),
    "bert-parameter": () => import("./../form/BERTParameter.vue"),
    "us-similarity-parameter": () => import("./../form/UserStorySimilarityParameter"),
    "ac-completeness-parameter": () => import("./../form/AcceptanceCriteriaCompletenessParameter"),
  },
  data() {
    return {
      expanded: [],
      expandedRow: null,
      headersIssueTypes: [
        {text: "Requirement Type", value: "issueType"},
      ],
      isProjectSelected: true,
      projectName: "",
      importDialog: false,
      uploadedFile: "",
      loading: false,
      selectedDatasets: [],
      selectedDatasetName: "",
      runMethods: METHODS,
      showUnassigned: false,
      headers: [
        {text: "Requirement Name", value: "key", sortable: false},
        {text: "Summary", value: "summary", sortable: false},
        {text: "Description", value: "description", sortable: false},
        {text: "Requirement Type", value: "issueType", sortable: false},
        {text: "Project Name", value: "projectName", sortable: false},
      ],
      header_details: [
        { text: "Id", value: "id", sortable: false },
        { text: "Text", value: "text", sortable: false },
        { text: "Similarity", value: "similarity", sortable: false },
      ],
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      pagination_expandable: {
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
      searchFeedback: "",

    }
  },
  methods:{
    /*toggleImport() {
      console.log(this.importDialog)
      this.$emit('toggleImport', !this.importDialog);
    },*/
    getAllJiraProjects() {
      this.$store.dispatch("actionGetAllJiraProjects")
    },
    getIssueTypesByProjectName() {
      if (this.projectName === "") {
        this.warning = "No project selected. Please select a project"
        return this.isProjectSelected = false
      } else {
        this.isProjectSelected = true
        this.openDialog = true
        this.dialogIssueTypes = true
        this.$store.dispatch("actionGetIssueTypesByProjectNameFromJira", this.projectName)
      }
    },
    async uploadFile() {
      if (this.fileInputField.files[0] === undefined) {
        this.displaySnackbar("Select a file first!");
        setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
      } else if (!(this.fileInputField.files[0].name.endsWith(".csv")) &&
          !(this.fileInputField.files[0].name.endsWith(".txt")) &&
          !(this.fileInputField.files[0].name.endsWith(".xlsx"))
      ) {
        this.displaySnackbar("File type not allowed!");
        setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
      } else {
        this.loading = true;
        let formData = new FormData();
        formData.append('file', this.uploadedFile);
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
            this.fileInputField.value = null;
            // Reset file name display
            this.getFileName();
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
      console.log(this.uploadedFile['name']);
      this.displaySnackbar("Please select your uploaded dataset from the dropdown menu.");
    },
    getFileName() {
      this.uploadedFile = this.fileInputField.files[0];
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
      if (!this.selectedDatasets.includes(this.selectedDatasetName,0)) {
        this.selectedDatasets.push(this.selectedDatasetName);
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
      /*if (this.maxSimilarity !== ""){
        maxSimilarity = this.maxSimilarity
      }*/
      await this.$store.dispatch("actionAssignIssuesToManyFeedback", {selectedFeedback, maxSimilarity})
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
    showDetails(item) {
      console.log(item)
      this.$router.push({ name: 'assigned_feedback', params: { item: item } });
    },
    openDeleteOneRequirementDialog(item) {
      this.deleteOneRequirement = true
      this.itemToDelete = item
    },
    toggleExpand(index) {
      //const index = this.expanded.indexOf(item);
      this.expandedRow = this.expandedRow === index ? null : index;
      this.pagination_expandable.page = 1
      /*if (index >= 0) {
        this.expanded.splice(index, 1);
      } else {
        this.expanded.push(item);
      }*/
    },
    isExpanded(index) {
      return (this.expandedRow == index);
    },
    getAssignedFeedback(issue){
      let issueKey = issue.key
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      this.$store.dispatch("actionGetAssignedFeedback", {issueKey, page, size})
    },
  },
  computed:{
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    component() {
      return getMethodObj(METHODS, this.selectedMethod).parameterComponentName;
    },
    fileInputField() {
      return document.getElementById("file-input-field");
    },
    allAvailableJiraIssues() {
      return this.$store.state.availableJiraProjects
    },
    getAssignedFeedbackFilter() {
      if (this.searchFeedback !== "") {
        return this.filterFeedbackFromIssue
      } else {
        return this.$store.state.assignedFeedback
      }
    },
    filterFeedbackFromIssue() {
      return this.$store.state.assignedFeedback.filter(item => {
        const similarityString = item.similarity.toString();
        return item.id.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
      })
    },

    ...mapGetters({
      datasets: 'datasets'
    }),
    fileDisplayName() {
      if (this.uploadedFile) {
        return this.uploadedFile.name;
      }
      return ""
    },
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
    this.getAllJiraProjects()
  },
}
</script>

<style scoped>
.container{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
}
.headline-select-jira-project{
  font-size: 18px;
}
.main-issue-table{
  margin-top: 10px;
}
</style>