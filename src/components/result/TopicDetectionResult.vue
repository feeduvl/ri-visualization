<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card id="parameter_holder">
        <v-card-title>
          <h2>Method Parameter </h2>
          <v-spacer/>
          <v-btn small color="primary" @click="showEditName" class="btnAlign">
            Rename
          </v-btn>
          <v-btn small color="primary" @click="downloadResult" class="btnAlign">
            Download
          </v-btn>
          <v-btn small outline color="error" @click="showDeleteResult" class="btnAlign">
            Delete
          </v-btn>
        </v-card-title>
        <v-layout row wrap id="parameter_layout">
            <v-card elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">Run Name</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ displayRunName(selectedResult.name) }}
              </v-card-text>
            </v-card>
            <v-card elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">Dataset</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ selectedResult.dataset_name }}
              </v-card-text>
            </v-card>
            <v-card elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">Run Date</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ displayRunDate() }}
              </v-card-text>
            </v-card>
          <template v-for="(item, key) in selectedResult.params">
            <v-card elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">{{ key }}</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ item }}
              </v-card-text>
            </v-card>
          </template>
          <v-card elevation="0" class="param_holder">
            <v-card-title class="param_header">
              <span class="grey--text text-uppercase">Topic Coherence</span>
            </v-card-title>
            <v-card-text class="param_content">
              {{ displayScore(selectedResult) }}
            </v-card-text>
          </v-card>
        </v-layout>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card id="wordcloud_holder">
        <v-card-title>
          <h2>Concept Wordcloud</h2>
        </v-card-title>
        <cloud :data="topicWords" :height="height" :padding="padding" :width="width" :fontSizeMapper="fontSizeMapper" :rotate="rotate" :coloring="coloring" :colors="colors" />
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          <h2>Concept Words</h2>
        </v-card-title>
        <v-data-table
            :headers="tableHeaders"
            :items="topicWordlist"
            :pagination.sync="pagination"
            :loading="loadingResults"
        >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ props.item.number }}</td>
              <td>
                <span v-for="word in props.item.words">
                    <v-chip>{{ word }}</v-chip><span> </span>
                </span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-flex xs12 id="heatmap-holder">
      <heatmap-document-topic/>
    </v-flex>
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
    <v-dialog
        v-model="editDialogVisible"
        max-width="290"
    >
      <v-card>
        <v-card-title class="text-h5">
          Edit Result Name
        </v-card-title>

        <v-card-text>
          <v-text-field
              v-model="newResultName"
              label="Name"
              single-line
              hide-details
              clearable
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              color="primary"
              text
              @click="editName"
              :loading="editBtn"
              :disabled="editBtn"
          >
            Edit
          </v-btn>

          <v-btn
              color="error"
              text
              @click="editDialogVisible = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        :timeout="deleteSnackbarTimeout"
        :top=true
    >
      Delete Result {{ resultToDelete.name }}?

      <v-btn
          color="error"
          small
          :loading="deleteBtn"
          :disabled="deleteBtn"
          @click="deleteResult"
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
  </v-layout>
</template>

<script>
import {mapGetters} from "vuex";
import Cloud from 'vue-d3-cloud'
import {CLOUD} from "@/colors";
import {getMethodObj} from "@/methods";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
import axios from "axios";
import {DELETE_RESULT_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT} from "@/RESTconf";
import {ACTION_DELETE_RESULT, ACTION_EDIT_RESULT_NAME} from "@/store/types";

export default {
  name: "TopicDetectionResult",
  computed: {
    ...mapGetters({
      loadingResults: 'loadingResults',
      selectedResult: 'selectedResult',
    }),
    topicWordlist() {
      let list = []
      for (let topic in this.selectedResult.topics) {
        let li = []
        let obj = {}
        for (let index in this.selectedResult.topics[topic]) {
          let word = this.selectedResult.topics[topic][index];
            li.push(word);
        }
        obj.number = parseInt(topic) + 1;
        obj.words = li.sort();
        list.push(obj);
      }
      return list;
    },
    topicWords() {
      let list = []
      let tw = []
      for (let topic in this.selectedResult.topics) {
        for (let index in this.selectedResult.topics[topic]) {
          let word = this.selectedResult.topics[topic][index];
          if (!(list.indexOf(word) > -1)) {
            list.push(word);
            tw.push({text: word, value: 24})
          }
        }
      }
      return tw;
    }
  },
  components: {
    Cloud,
    "heatmap-document-topic": () =>
        import("../widget/heatmap/HeatmapDocumentTopic"),
  },
  data: function () {
    return {
      resultToDelete: {},
      resultToEdit: {},
      deleteSnackbarVisible: false,
      editDialogVisible: false,
      newResultName: "",
      deleteBtn: false,
      editBtn: false,
      snackbarVisible: false,
      snackbarTimeout: 0,
      deleteSnackbarTimeout: 0,
      snackbarText: "",
      fontSizeMapper: word => word.value,
      rotate: 0,
      coloring: "random",
      colors: CLOUD,
      width: 1152,
      height: 400,
      padding: 5,
      tableHeaders: [
        {
          text: "Number",
          align: "center",
          sortable: true,
          value: "id",
          width: "10%",
          filterable: false
        },
        {
          text: "Concept Words",
          align: "left",
          sortable: false,
          value: "text",
          width: "90%",
          filterable: false
        },
      ],
      pagination: {
        sortBy: "Number",
        descending: false,
        rowsPerPage: 10,
      },
    }
  },
  methods: {
    editName() {
      this.editBtn = true;
      this.resultToEdit.name = this.newResultName;
      axios.post(POST_UPDATE_RESULT_NAME_ENDPOINT, {
        name: this.resultToEdit.name,
        started_at: this.resultToEdit.started_at
      })
          .then(response => {
            if (response.status > 200 || response.status < 300) {
              this.displaySnackbar("Name edited");
              this.$store.dispatch(ACTION_EDIT_RESULT_NAME, this.resultToEdit);
              this.resultToEdit = {};
              this.newResultName = "";
            } else {
              this.displaySnackbar("Error with result name edit!");
            }
          })
          .catch(e => {
            this.errors.push(e);
            console.log(e);
            this.displaySnackbar("Could not contact backend!");
          })
          .finally(() => {
            this.editBtn = false;
            this.editDialogVisible = false;
            setTimeout(() => {
              this.snackbarVisible = false;
            }, SNACKBAR_DISPLAY_TIME);
          }
      )},
    deleteResult() {
      this.deleteBtn = true;
      axios.delete(DELETE_RESULT_ENDPOINT(this.resultToDelete.started_at))
          .then(response => {
            if (response.status > 200 || response.status < 300) {
              this.displaySnackbar(response.data.message);
              this.$store.dispatch(ACTION_DELETE_RESULT, this.resultToDelete);
              this.resultToDelete = {};
            } else {
              this.displaySnackbar("Error with result deletion!");
            }
          })
          .catch(e => {
            this.errors.push(e);
            this.displaySnackbar("Could not contact backend!");
          }).finally(() => {
            this.deleteBtn = false;
            this.deleteSnackbarVisible = false;
            setTimeout(() => {
              this.snackbarVisible = false;
            }, SNACKBAR_DISPLAY_TIME);
          }
      )},
    displayRunName(name) {
      if (name === "") {
        return "-";
      } else {
        return name;
      }
    },
    getNameForFile() {
      let name = "";
      if (this.selectedResult.name === "") {
        name = this.selectedResult.method;
      } else {
        name = this.selectedResult.name;
      }
      return name + "-" + this.selectedResult.started_at.replace(":","-") + ".json";
    },
    displayRunDate() {
      if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
        return this.selectedResult.started_at.replace("Z", "").replace("T", " ").substring(0, 19);
      } else {
        return "-";
      }
    },
    displayScore(item) {
      return getMethodObj(item.method).scoreFunction(item);
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },
    downloadResult() {
      if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
        const data = JSON.stringify(this.selectedResult);
        const blob = new Blob([data], {type: 'text/plain'});
        const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
        a.download = this.getNameForFile();
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
      } else {
        this.displaySnackbar("Select a result first!");
        setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
      }
    },
    showEditName() {
      this.resultToEdit = this.selectedResult;
      this.newResultName = this.selectedResult.name;
      this.editDialogVisible = true;
    },
    showDeleteResult() {
      this.resultToDelete = this.selectedResult;
      this.deleteSnackbarVisible = true;
    },
  },
}
</script>

<style scoped>

#wordcloud_holder {
  margin-bottom: 20px;
}

#parameter_holder {
  margin-bottom: 20px;
}

#heatmap-holder {
  margin-top: 20px;
}

.param_content {
  padding-top: 0;
  padding-left: 25px;
}

.param_header {
  padding-bottom: 5px;
}

.param_holder {
  min-width: 360px;
}

#parameter_layout {
  padding-left: 20px;
}

.btnAlign {
  float: right;
}

</style>