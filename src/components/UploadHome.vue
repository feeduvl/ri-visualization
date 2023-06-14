<template>
  <v-container>
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
    <v-card id="listingWrapper">
      <v-card flat class="header">
        <v-card-title primary-title>
          <h2>Available Datasets</h2>
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
          <v-btn small outline color="error" @click="showDeleteDataset(dataset)" class="btnAlign">
            Delete
          </v-btn>
          <v-btn small color="primary" @click="showDataset(dataset)" class="btnAlign">
            Show
          </v-btn>
          <v-btn small color="primary" @click="showAddGroundtruth(dataset)" class="btnAlign">
            Add Ground truth
          </v-btn>
        </v-card>
      </v-layout>
    </v-card>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        :timeout="deleteSnackbarTimeout"
        :top=true
        :multi-line="true"
    >
      Delete Dataset {{ datasetToDelete }}?

      <v-checkbox
          v-model="alsoDeleteRuns"
          :label="``"
          :dark="true"
      ></v-checkbox>
      Also delete runs with this dataset?

      <v-btn
          color="error"
          small
          :loading="deleteBtn"
          :disabled="deleteBtn"
          @click="deleteDataset"
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
    <v-dialog
        v-model="addGroundtruthDialogVisible"
        max-width="490"
    >
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          Add Ground truth
        </v-card-title>

        <v-card-text>
          <input id="file-input-field-groundtruth" type='file' hidden @change="getGroundtruthFileName"/>
          <v-text-field
              label="File Name"
              v-model="groundtruthFileDisplayName"
              readonly
              prepend-icon="attach_file"
              class="file-name-field"
          ></v-text-field>
            <label for="file-input-field-groundtruth" class="v-btn v-btn--small theme--light primary file-action-button file-picker-button">Choose
              file</label>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              color="primary"
              text
              @click="uploadGroundtruth"
              :loading="uploadGroundtruthBtn"
              :disabled="uploadGroundtruthBtn"
          >
            Upload
          </v-btn>

          <v-btn
              color="error"
              text
              @click="addGroundtruthDialogVisible = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  ACTION_SET_TOOLBAR_HEADER
} from "@/store/types";
import axios from "axios";
import {
  BLUE_BORDER
} from "@/colors";
import {DELETE_DATASET_ENDPOINT, DELETE_RESULT_ENDPOINT, POST_UPLOAD_DATASET_ENDPOINT, POST_ADD_GROUNDTRUTH_ENDPOINT} from "@/RESTconf";
import {mapGetters} from "vuex";
import {loadDatasets} from "@/RESTcalls";
import {setTheme, SNACKBAR_DISPLAY_TIME, THEME_UVL} from "@/theme";
import {ACTION_DELETE_RESULT, MUTATE_SELECTED_DATASET_OUTSIDE, MUTATE_SELECTED_RESULT} from "@/store/types";

export default {
  name: "UploadHome",
  data: function () {
    return {
      isMounted: false,
      uploadedFile: "",
      uploadButtonStyle: {
        "background-color": BLUE_BORDER
      },
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
      loading: false,
      deleteSnackbarVisible: false,
      deleteSnackbarTimeout: 0,
      datasetToDelete: "",
      deleteBtn: false,
      datasetNameForGroundtruth: "",
      addGroundtruthDialogVisible: false,
      uploadedFileGroundtruth: "",
      uploadGroundtruthBtn: false,
      errors: [],
      alsoDeleteRuns: false,
    }
  },
  mounted() {
    this.isMounted = true;
    this.$store.dispatch(ACTION_SET_TOOLBAR_HEADER, "Upload");
  },
  computed: {
    fileInputField() {
      return document.getElementById("file-input-field");
    },
    fileDisplayName() {
      if (this.uploadedFile) {
        return this.uploadedFile.name;
      }
      return ""
    },
    fileInputFieldGroundtruth() {
      return document.getElementById("file-input-field-groundtruth");
    },
    groundtruthFileDisplayName() {
      if (this.uploadedFileGroundtruth) {
        return this.uploadedFileGroundtruth.name;
      }
      return ""
    },
    selectedDatasetName () {
      if (Object.prototype.hasOwnProperty.call(this.$store.state.selectedDataset, name)) {
        return this.$store.state.selectedDataset.name;
      } else {
        return "";
      }
    },
    ...mapGetters({
      datasets: 'datasets',
      results: 'finishedResults',
      selectedResult: 'selectedResult',
    })
  },
  methods: {
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
    async uploadGroundtruth () {
      if (this.fileInputFieldGroundtruth.files[0] === undefined) {
        this.displaySnackbar("Select a file first!");
        setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
      } else if (!(this.fileInputFieldGroundtruth.files[0].name.endsWith(".csv")) &&
          !(this.fileInputFieldGroundtruth.files[0].name.endsWith(".txt")) &&
          !(this.fileInputFieldGroundtruth.files[0].name.endsWith(".xlsx"))
      ) {
        this.displaySnackbar("File type not allowed!");
        setTimeout(() => {  this.closeSnackbar(); }, SNACKBAR_DISPLAY_TIME);
      } else {
        this.uploadGroundtruthBtn = true;
        let formData = new FormData();
        formData.append('file', this.uploadedFileGroundtruth);
        formData.append('dataset', this.datasetNameForGroundtruth);
        axios.post(POST_ADD_GROUNDTRUTH_ENDPOINT,
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
            this.fileInputFieldGroundtruth.value = null;
            // Reset file name display
            this.getGroundtruthFileName();
            this.addGroundtruthDialogVisible = false;
            // Update local dataset if the selectedDataset is the one that changed
            if (this.selectedDatasetName === this.datasetNameForGroundtruth) {
              this.loadDataset(this.$store, this.selectedDatasetName);
            }
            this.datasetNameForGroundtruth = "";
          } else {
            this.displaySnackbar("Error with file upload!");
          }
        }).catch(e => {
          console.log("UploadHome::uploadGroundtruth:" + e);
          this.displaySnackbar("Could not contact backend!");
        }).finally(() => {
          this.uploadGroundtruthBtn = false;
        });
      }
    },
    getFileName() {
      this.uploadedFile = this.fileInputField.files[0];
    },
    getGroundtruthFileName() {
      this.uploadedFileGroundtruth = this.fileInputFieldGroundtruth.files[0];
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
    showDeleteDataset(dataset) {
      this.datasetToDelete = dataset;
      this.deleteSnackbarVisible = true;
    },
    showAddGroundtruth(dataset) {
      this.datasetNameForGroundtruth = dataset;
      this.addGroundtruthDialogVisible = true;
    },
    deleteDataset() {
      this.deleteBtn = true;
        axios
            .delete(DELETE_DATASET_ENDPOINT(this.datasetToDelete))
            .then(response => {
              if (response.status > 200 || response.status < 300) {
                // Check to also delete runs with dataset
                if (this.alsoDeleteRuns) {
                  let runsWithDataset = this.results.filter(a => a.dataset_name === this.datasetToDelete);
                  for (let index in runsWithDataset) {
                    this.deleteResult(runsWithDataset[index]);
                  }
                }
                loadDatasets(this.$store);
                this.displaySnackbar(response.data.message);
                this.datasetToDelete = "";
              } else {
                this.displaySnackbar("Error with file deletion!");
              }
            })
            .catch(e => {
              this.errors.push(e);
              this.displaySnackbar("Could not contact backend!");
            }).finally( () => {
              this.deleteBtn = false;
              this.deleteSnackbarVisible = false;
              setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
              this.alsoDeleteRuns = false;
        });
    },
    deleteResult(result) {
      axios.delete(DELETE_RESULT_ENDPOINT(result.started_at))
          .then(response => {
            if (response.status > 200 || response.status < 300) {
              if (this.selectedResult.started_at === result.started_at) {
                this.$store.commit(MUTATE_SELECTED_RESULT, {});
              }
              this.$store.dispatch(ACTION_DELETE_RESULT, result);
            } else {
              console.log("DatasetHome::deleteResult: ", response.status);
            }
          })
          .catch(e => {
            console.log("DatasetHome::deleteResult: ", e);
          })
    },
    updateTheme (title, theme) {
      if (theme !== "") {
        setTheme(title, theme, this.$store);
      }
    },
  }
}
</script>

<style scoped>

.file-name-field {
  margin-right: 10px;
  padding-top: 0;
  margin-top: 0;
}

#datasetListing {
  padding-top: 10px;
  padding-bottom: 10px;
}

#listingWrapper {
  margin-top: 20px;
}

#datasetTile {
  margin: 10px 5px 10px 11px;
}

.btnAlign {
  float: right;
}

.dialog-title {
  font-weight: 500;
}

</style>
