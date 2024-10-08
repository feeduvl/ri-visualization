<template>
  <v-container class="annotationview-container">
    <v-snackbar v-model="snackbarVisible" :timeout="snackbarTimeout" :top=true>
      {{ snackbarText }}

      <v-btn small color="primary" text @click="closeSnackbar">
        Close
      </v-btn>
    </v-snackbar>
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
import {MUTATE_SELECTED_DATASET_OUTSIDE} from "@/store/types";

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
    "bert-parameter": () => import("./form/BERTParameter.vue"),
  },
  data() {
    return {
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
      uploadedFile: "",
      loading: false,
      selectedDatasets: [],
      selectedDatasetName: "",
      selectedAnnotation: "",
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
    }
  },
  methods:{
    handleFileSelection(event) {
      // Get the selected file
      const file = event.target.files[0];
      if (file) {
        this.uploadFile(file);
      }
    },
    updateAnnotationView (annotation) {
      this.$refs.annotatorRef.updateAnnotation(annotation)
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
      this.selectedDatasetName = filename.split('.')[0]
      this.addDataset()
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
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

    loadDashboardData(){
      this.$store.commit('setNeedToLoadDashboard', false)
      this.selectedDatasets = this.$store.state.storedDatasets
      this.$refs.startDetectionHomeRef.loadDashboardData()
    }
  },
  watch: {
    currentDashboardName(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.$store.state.storedDashboardType === "Usage Information"){
          this.loadDashboardData();
        }
      }
    },
    needToLoadDashboard(newValue) {
      if (newValue) {
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

    ...mapGetters({
      datasets: 'datasets'
    }),
  },
  mounted() {
    this.getAllJiraProjects()
    if (this.$store.state.storedClassifier !== ""){ // Only saved dashboards already have a classifier, not newly created ones
      this.loadDashboardData();
    }
  },
}
</script>

<style scoped>
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
  padding-left: 0;
  padding-right: 0
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