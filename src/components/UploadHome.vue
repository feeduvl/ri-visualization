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
            <div>
              <input id="file-input-field" type='file' hidden @change="getFileName"/>
              <label v-if="!uploadedFile" for="file-input-field" class="file-action-button file-picker-button">Choose
                file</label>
              <label v-else id="submit-file-button" class="file-action-button" :style="uploadButtonStyle"
                     :enabled=uploadedFile @click="persistFile(fileDisplayName)">Submit</label>
              <span id="file-chosen-display">{{ fileDisplayName }}</span>
            </div>
            <div id="upload-sendoff" v-if="uploadedFile" width="100%">
                <span>
                    Here are some instructions on the supported file format
                </span>
            </div>
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
import {THEME_UVL, setTheme} from "@/theme";
import {POST_UPLOAD_DATASET_ENDPOINT} from "@/RESTconf";

export default {  // TODO add attribute 'multiple' on file input to allow selection of multiple files
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
      topBarTitle: "Data Upload",
      designTheme: THEME_UVL,
    }
  },
  mounted() {
    this.isMounted = true;
    setTheme(this.topBarTitle, this.designTheme, this.$store);

    //  add some computed CSS stuff
    //let halfwidth;
    //let parentwidth = document.getElementById("file-upload-panel").getBoundingClientRect().width;
    //halfwidth = Math.floor(-1 * parentwidth / 2);
    //document.getElementById("file-upload-panel-inner").style["margin"] = "0 0 0 " + halfwidth + "px";
  },
  computed: {
    fileInputField() {
      return document.getElementById("file-input-field");
    },
    fileDisplayName() {
      if (this.uploadedFile) {
        return this.uploadedFile.name;
      }
      return "No file chosen"
    }
  },
  methods: {
    async persistFile() {
      let formData = new FormData();
      formData.append('file', this.uploadedFile);
      axios.post(POST_UPLOAD_DATASET_ENDPOINT,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
      ).then(function (response) {
        if (response.status > 200 || response.status < 300) {
          this.displaySnackbar(response.data.message);
        } else {
          window.alert("Error with file upload!");
        }
      })
          .catch(function () {
            console.log(POST_UPLOAD_DATASET_ENDPOINT);
            window.alert("Could not contact backend!");
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
#file-upload-panel {
  position: absolute;
  top: 150px;
  left: 50%;
}

.file-action-button {
  color: white;
  padding: 0.5rem;
  font-family: sans-serif;
  border-radius: 0.3rem;
  cursor: pointer;
  margin-top: 1rem;
}

.file-picker-button {
  background-color: indigo;
}

#file-chosen-display {
  margin-left: 0.3rem;
  font-family: sans-serif;
}

#upload-sendoff {
  margin-top: 20px;
}

</style>
