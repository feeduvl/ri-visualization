<template>
  <v-container class="annotationview-container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <v-card>
      <v-card flat class="header blue-bg">
        <v-card-title primary-title>
          <h2>{{ $store.state.currentDashboardName }}</h2>
        </v-card-title>
      </v-card>
      <v-container>
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

        <div>
          <StartDetectionHome ref="startDetectionHomeRef" v-bind:selected_dataset="selectedDatasets" class="element1" @updateAnnotationView="updateAnnotationView"></StartDetectionHome>
        </div>
      </v-container>

    </v-card>
    <Annotator :selectedAnnotation="selectedAnnotation" ref ="annotatorRef" class="annotator"/>
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
import {MUTATE_SELECTED_DATASET_OUTSIDE, MUTATE_SELECTED_RESULT} from "@/store/types";

import {mapGetters} from "vuex";
import axios from "axios";
import Annotator from "@/components/uvlDashboardViews/annotation/Annotator.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  components: {
    Annotator,
    StartDetectionHome,
    LoadingView,
    ImportJiraProject,
    LoadFeedbackFromDB,
    "empty-parameter": () => import("./form/EmptyParameter"),
    "lda-parameter": () => import("./form/LdaParameter"),
    "seanmf-parameter": () => import("./form/SeanmfParameter"),
    "frequency-rbai-parameter": () => import("./form/FrequencyRBAIParameter"),
    "frequency-fcic-parameter": () => import("./form/FrequencyFCICParameter"),
    "acceptance-criteria-parameter": () => import("./form/AcceptanceCriteriaParameter"),
    "stanford-ner-parameter": () => import("./form/StanfordNERParameter"),
    "bi-lstm-parameter": () => import("./form/BiLSTMParameter"),
    "bert-parameter": () => import("./form/BERTParameter.vue"),
    "us-similarity-parameter": () => import("./form/UserStorySimilarityParameter"),
    "ac-completeness-parameter": () => import("./form/AcceptanceCriteriaCompletenessParameter"),
  },
  data() {
    return {
      headersIssueTypes: [
        {text: "Requirement Type", value: "issueType"},
      ],
      headers: [
        {text: "Requirement Name", value: "key"},
        {text: "Summary", value: "summary"},
        {text: "Description", value: "description"},
        {text: "Requirement Type", value: "issueType"},
        {text: "Project Name", value: "projectName"},
      ],
      isProjectSelected: true,
      warning: "",
      projectName: "",
      importDialog: false,
      uploadedFile: "",
      loading: false,
      selectedDatasets: [],
      selectedDatasetName: "",
      runMethods: DASHBOARD_METHODS,
      showUnassigned: false,
      selectedAnnotation: ""
    }
  },
  methods:{
    // selectedDataset,
    /*toggleImport() {
      console.log(this.importDialog)
      this.$emit('toggleImport', !this.importDialog);
    },*/
    handleFileSelection(event) {
      // Get the selected file
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
    },
    updateAnnotationView (annotation) {
      console.log("annotationView knows it should update")
      this.$refs.annotatorRef.updateAnnotation(annotation)
    },
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
      console.log(filename.split('.')[0]);
      this.selectedDatasetName = filename.split('.')[0]
      this.addDataset()
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
    /*toggleImport(value) {
      console.log("toggleImport");
      this.importDialog = value;
      this.getAllIssues()
      this.getProjectNames()
    },*/
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

    /*getAllIssues() {
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
    },*/
    loadDashboardData(){
      this.$store.commit('setNeedToLoadDashboard', false)
      console.log("loading dashboard data due to beforeRouteUpdate")
      this.selectedDatasets = this.$store.state.storedDatasets
      this.$refs.startDetectionHomeRef.loadDashboardData()
      //this.getAllIssues()
    }
  },
  watch: {
    currentDashboardName(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.$store.state.storedDashboardType === "Annotation"){
          console.log("need to load new annotation dashboard")
          this.loadDashboardData();
        }
      }
    },
    needToLoadDashboard(newValue) {
      if (newValue) {
        console.log("needToLoadDashboard was true")
        this.loadDashboardData();
      }
    }

  },
  computed:{
    currentDashboardName() {
      // Map the store's state to a computed property
      return this.$store.state.currentDashboardName;
    },
    needToLoadDashboard() {
      return this.$store.state.needToLoadDashboard
    },
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    component() {
      return getMethodObj(DASHBOARD_METHODS, this.selectedMethod).parameterComponentName;
    },
    fileInputField() {
      return document.getElementById("file-input-field");
    },
    allAvailableJiraIssues() {
      return this.$store.state.availableJiraProjects
    },
    allAvailableDataSets(){

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
  },
  mounted() {
    this.getAllJiraProjects()
    if (this.$store.state.storedClassifier !== ""){ // Only saved dashboards already have a classifier, not newly created ones
      console.log("need to load annotation dashboard")
      this.loadDashboardData();
    }
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
  margin-bottom: 10px;
  font-weight: bold;
}
.dataset-list{
  margin-top: 20px;
}
.dataset-tile{
  margin: 20px
}
.blue-bg{
  background-color: rgb(0, 189, 187)
}
.annotationview-container{
  margin:0;
  padding-top: 20px;
  padding-left: 0px;
  padding-right: 0px
}
.select-issueTypes {
  flex: 1; /* Makes the dropdown take up all available space */
}
.element1 {
  flex: 0.8;
  padding-left: 0;
}
.annotator {
  margin-top: 20px;
}
</style>