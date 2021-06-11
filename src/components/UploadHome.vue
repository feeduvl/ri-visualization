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
  </v-container>
</template>

<script>
import axios from "axios";
import {
  BLUE_BORDER
} from "@/colors";
import {POST_UPLOAD_DATASET_ENDPOINT} from "@/RESTconf";
import {mapGetters} from "vuex";
import {loadDatasets} from "@/RESTcalls";

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
      this.loading = true;
      if (this.fileInputField.files[0] === undefined) {
        this.displaySnackbar("Select a file first!");
        setTimeout(() => {  this.closeSnackbar(); }, 3000);
      } else if (!(this.fileInputField.files[0].name.endsWith(".csv"))) {
        this.displaySnackbar("File type not allowed!");
        setTimeout(() => {  this.closeSnackbar(); }, 3000);
      } else {
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
            // Reset file name display
            this.getFileName();
            loadDatasets(this.$store);
          } else {
            this.displaySnackbar("Error with file upload!");
          }
        })
            .catch(() => {
              this.displaySnackbar("Could not contact backend!");
            });
      }
      this.loading = false;
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
  }
}
</script>

<style scoped>

.v-text-field {
  margin-right: 10px;
  padding-top: 0px;
  margin-top: 0px;
}

</style>
