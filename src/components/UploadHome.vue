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
            ></v-text-field>
            </v-flex>
          <v-flex xs3>
            <label for="file-input-field" class="v-btn v-btn--small theme--light primary file-action-button file-picker-button">Choose
              file</label>
            <v-btn small color="primary" :loading="loading" :disabled="loading" @click="uploadFile(fileDisplayName)">Upload</v-btn>
          </v-flex>
          <v-flex xs5>
            <span :style="{'color': 'gray'}">Currently allowed file types: csv. The dataset will be saved with its filename. Uploading a dataset which name already exists will update the dataset. The delimiter is set to '|'.</span>
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
        >
          <v-card-title><h3>{{ dataset }}</h3></v-card-title>
          <v-btn small outline color="error" @click="showDeleteDataset(dataset)" class="btnAlign">
            Delete
          </v-btn>
          <v-btn small color="primary" @click="showDataset(dataset)" class="btnAlign">
            Show
          </v-btn>
        </v-card>
      </v-layout>
    </v-card>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        :timeout="deleteSnackbarTimeout"
        :top=true
    >
      Delete Dataset {{ datasetToDelete }}?

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
  </v-container>
</template>

<script>
import axios from "axios";
import {
  BLUE_BORDER
} from "@/colors";
import {DELETE_DATASET_ENDPOINT, POST_UPLOAD_DATASET_ENDPOINT} from "@/RESTconf";
import {mapGetters} from "vuex";
import {loadDatasets} from "@/RESTcalls";
import {setTheme, THEME_UVL} from "@/theme";
import {MUTATE_SELECTED_DATASET_OUTSIDE} from "@/store/types";

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
      errors: [],
    }
  },
  mounted() {
    this.isMounted = true;
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
    ...mapGetters({
      datasets: 'datasets'
    })
  },
  methods: {
    async uploadFile() {
      if (this.fileInputField.files[0] === undefined) {
        this.displaySnackbar("Select a file first!");
        setTimeout(() => {  this.closeSnackbar(); }, 6000);
      } else if (!(this.fileInputField.files[0].name.endsWith(".csv")) &&
          !(this.fileInputField.files[0].name.endsWith(".txt")) &&
          !(this.fileInputField.files[0].name.endsWith(".xlsx"))
      ) {
        this.displaySnackbar("File type not allowed!");
        setTimeout(() => {  this.closeSnackbar(); }, 6000);
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
            this.fileInputField.value = null;
            this.loading = false;
            // Reset file name display
            this.getFileName();
            loadDatasets(this.$store);
          } else {
            this.displaySnackbar("Error with file upload!");
            this.loading = false;
          }
        })
            .catch(() => {
              this.displaySnackbar("Could not contact backend!");
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
    showDataset(dataset) {
      this.updateTheme("Dataset View", THEME_UVL);
      this.$store.commit(MUTATE_SELECTED_DATASET_OUTSIDE, dataset);
      this.$router.push("/dataset");
    },
    showDeleteDataset(dataset) {
      this.datasetToDelete = dataset;
      this.deleteSnackbarVisible = true;
    },
    deleteDataset() {
      this.deleteBtn = true;
        axios
            .delete(DELETE_DATASET_ENDPOINT(this.datasetToDelete))
            .then(response => {
              if (response.status > 200 || response.status < 300) {
                loadDatasets(this.$store);
                this.displaySnackbar(response.data.message);
                this.deleteBtn = false;
                this.deleteSnackbarVisible = false;
                this.datasetToDelete = {};
                setTimeout(() => {  this.snackbarVisible = false; }, 6100);
              } else {
                this.displaySnackbar("Error with file deletion!");
                this.deleteBtn = false;
                this.deleteSnackbarVisible = false;
                setTimeout(() => {  this.snackbarVisible = false; }, 6100);
              }
            })
            .catch(e => {
              this.errors.push(e);
              this.displaySnackbar("Could not contact backend!");
              this.deleteBtn = false;
              this.deleteSnackbarVisible = false;
              setTimeout(() => {  this.snackbarVisible = false; }, 6100);
            });
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

.v-text-field {
  margin-right: 10px;
  padding-top: 0px;
  margin-top: 0px;
}

#datasetListing {
  padding-top: 10px;
  padding-bottom: 10px;
}

#listingWrapper {
  margin-top: 20px;
}

#datasetTile {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-right: 5px;
}

.btnAlign {
  float: right;
}

</style>
