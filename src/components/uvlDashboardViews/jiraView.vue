<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <p class="headline-select-jira-project">
      Select Project to import:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="projectName" :items="allAvailableJiraIssues"
                label="Select project" item-text="name"
      ></v-select>
      <v-btn dark :style="{ backgroundColor: blueDark }" class="element2" @click="openImportDialog()"> Import Requirements
      </v-btn>
      <v-dialog class="custom-dialog" v-model="importDialog">
        <ImportJiraProject class="import-dialog" @toggleImport="toggleImport" :importDialog="importDialog"/>
      </v-dialog>
      <!--<v-btn dark color="blue" @click="getIssueTypesByProjectName()"> SEARCH
      </v-btn>-->
    </div>
    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>

    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <p class="headline-select-jira-project">
      Select Datasets to use:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="projectName" :items="datasets"
                label="Select dataset" item-text="dataset"
      ></v-select>
      <v-btn dark color="blue" @click="getIssueTypesByProjectName()"> ADD
      </v-btn>
    </div>
    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>
    <v-card>
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
    </v-card>
    <v-card>
      <v-card flat class="header">
        <v-card-title primary-title>
          <h1>Start Analysis</h1>
        </v-card-title>
      </v-card>
      <v-container>
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
          <v-flex xs3>
            <v-select v-model="selectedDataset" :items="datasets" label="Dataset">
            </v-select>
          </v-flex>
        </v-layout>
      </v-container>
      <v-divider />
      <component v-bind:is="component" v-bind:dataset="selectedDataset" />
    </v-card>
    <div>
      <v-btn dark color="red" @click=""> Automatically relate feedback to requirements
      </v-btn>
    </div>
  </div>

</template>

<script >

import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";
import ImportJiraProject from "@/components/uvlDashboardViews/ImportJiraProject.vue";
import LoadFeedbackFromDB from "@/components/jiraDashboardViews/LoadFeedbackFromDB.vue";

import {mapGetters} from "vuex";
import axios from "axios";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  components: {
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
    }
  },
  methods:{
    toggleImport() {
      console.log(this.importDialog)
      this.$emit('toggleImport', !this.importDialog);
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
  },
  computed:{
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    allAvailableJiraIssues() {
      return this.$store.state.availableJiraProjects
    },
    allAvailableDataSets(){

    },
    // Close Dialog for import jira issues
    toggleImport(value) {
      this.importDialog = value;
      <!--this.getAllIssues()
      this.getProjectNames()-->
    },
    openImportDialog(){
      this.importDialog = true
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
</style>