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
          <v-flex xs2>
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
            <v-btn small color="primary" @click="uploadFile(fileDisplayName)">Upload</v-btn>
          </v-flex>
          <v-flex xs6>
            <span :style="{'color': 'gray'}">Currently allowed file types: csv</span>
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

export default {
  name: "UploadHome",
  data: function () {
    return {
      isMounted: false,
      uploadedFile: undefined,
      uploadButtonStyle: {
        "background-color": BLUE_BORDER
      },
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
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
    }
  },
  methods: {
    async uploadFile() {
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
        } else {
          this.displaySnackbar("Error with file upload!!");
        }
      })
          .catch( () => {
            this.displaySnackbar("Could not contact backend!");
          });
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

</style>
