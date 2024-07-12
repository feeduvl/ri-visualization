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
      <v-select class="select-issueTypes" v-model="projectName" :items="datasets"
                label="Select dataset" item-text="dataset"
      ></v-select>
      <v-btn dark color="blue" @click="addDataset()"> ADD
      </v-btn>
    </div>
    <component v-bind:is="component" v-bind:dataset="selectedDataset" />


    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>
    <v-card>
      <component v-bind:is="component" v-bind:dataset="selectedDataset" />
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
            v-for="dataset in datasets"
            v-bind:key="dataset"
        >
          <v-card-title><h3>{{ dataset }}</h3></v-card-title>
          <v-btn small outline color="error" @click="showRemoveDataset(dataset)" class="btnAlign">
            Delete
          </v-btn>
          <v-btn small color="primary" @click="showDataset(dataset)" class="btnAlign">
            Show
          </v-btn>
        </v-card>
      </v-layout>
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
      selectedDataset: "",
      warning: "",
      projectName: "",
      importDialog: false,
      uploadedFile: "",
      loading: false,
      datasets: []
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
      this.datasets.push(this.$props.dataset);

    }

  },
  computed:{
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    component() {
      return getMethodObj(METHODS, this.selectedMethod).parameterComponentName;
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
.import-dialog {
  background-color: white;
  height: 300px;
}
</style>