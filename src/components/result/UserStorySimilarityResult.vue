<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card id="parameter_holder">
        <v-card-title>
          <h2>Method Parameter and Metrics</h2>
          <v-spacer/>
          <v-btn small color="primary" @click="showEditName" class="btnAlign">
            Rename
          </v-btn>
          <v-btn small color="primary" @click="downloadResult" class="btnAlign">
            Download
          </v-btn>
          <v-btn small outlined color="error" @click="showDeleteResult" class="btnAlign">
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
                {{ displayDatasetName(selectedResult.dataset_name) }}
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
          <template>
            <v-card v-for="(item, key) in selectedResult.params" :key="key" elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">{{ key }}</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ item }}
              </v-card-text>
            </v-card>
          </template>
          <template>
            <v-card v-for="(item, key) in selectedResult.metrics" :key="key" elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">{{ key }}</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ item }}
              </v-card-text>
            </v-card>
          </template>
        </v-layout>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card id="us-similarity-result-table">
        <v-card-title>
          <h3>Similarity Results</h3>
        </v-card-title>
        <v-data-table
          :headers="tableHeaders"
          :items="tableResults"
          class="elevation-1"
          id="resultTable"
          :rowsPerPageItems="[5,10,25,50,100,{'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}]"
          :pagination.sync="pagination"
          :loading="loadingResults"
          >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{props.item.id_1}}</td>
              <td>{{props.item.us_1}}</td>
              <td>{{props.item.ac_1}}</td>
              <td>{{props.item.id_2}}</td>
              <td>{{props.item.us_2}}</td>
              <td>{{props.item.ac_2}}</td>
              <td>{{ roundSimilarityScore(props.item.score) }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-flex xs12 id="similar-us-groundtruth-comparison-holder">
      <groundtruth-comparison-us-similarity v-bind:result="result" v-bind:groundtruth="groundtruth"/>
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
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
import axios from "axios";
import {DELETE_RESULT_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT} from "@/RESTconf";
import {ACTION_DELETE_RESULT, ACTION_EDIT_RESULT_NAME, MUTATE_SELECTED_RESULT} from "@/store/types";

export default {
  name: "UserStorySimilarityResult",
  watch: { },
  computed: {
    ...mapGetters({
      loadingResults: 'loadingResults',
      selectedResult: 'selectedResult',
      selectedDataset: 'selectedDataset',
    }),
    tableResults() {
      if (this.selectedResult.topics) {
        return this.selectedResult.topics.similarity_results;
      }
      return []
    },
    groundtruth() {
      if (!this.selectedDataset.ground_truth) {
        return []
      }
      function getSimilarIds(ids_string){
        ids_string = ids_string.replace(/\s/g, "");
        if (ids_string.length === 0) {
          return [];
        }
        return ids_string.split(",");
      }

      let groundtruthArrOfSets = [];
      for (let thruthElement of this.selectedDataset.ground_truth) {
        let similar_ids = getSimilarIds(thruthElement.value);
        if (similar_ids.length === 0) {
          continue;
        }
        for (let similar_id of similar_ids){
          let temp_set = new Set([thruthElement.id, similar_id]);
          if (isNotContained(temp_set, groundtruthArrOfSets)){
            groundtruthArrOfSets.push(temp_set);
          }
        }
      }

      return groundtruthArrOfSets;
    },
    result() {
      if (!this.selectedResult.topics) {
        return []
      }
      let simResult = this.selectedResult.topics.similarity_results;
      let resultArrOfSets = [];
      for (let result of simResult) {
        let tempSet = new Set([result.id_1, result.id_2]);
        if (isNotContained(tempSet, resultArrOfSets)) {
          resultArrOfSets.push(tempSet);
        }
      }
      return resultArrOfSets;
    },
  },
  components: {"groundtruth-comparison-us-similarity": () => import("@/components/widget/table/GroundtruthComparisonUsSimilarity"),},
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
      errors: [],
      tableHeaders: [
        {
          text: "ID 1",
          align: "left",
          sortable: true,
          value: "id_1"
        },
        {
          text: "US 1",
          align: "left",
          sortable: false,
          value: "us_1"
        },
        {
          text: "AC 1",
          align: "left",
          sortable: false,
          value: "us_1"
        },
        {
          text: "ID 2",
          align: "left",
          sortable: true,
          value: "id_2"
        },
        {
          text: "US 2",
          align: "left",
          sortable: false,
          value: "us_2"
        },
        {
          text: "AC 2",
          align: "left",
          sortable: false,
          value: "us_2"
        },
        {
          text: "Score",
          align: "left",
          sortable: true,
          value: "score",
        },
      ],
      pagination: {
        descending: false,
        rowsPerPage: 25
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
            this.$store.commit(MUTATE_SELECTED_RESULT, {});
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
      if (name === "" || name === undefined) {
        return "–";
      } else {
        return name;
      }
    },
    displayDatasetName(dataset_name) {
      if (dataset_name === "" || dataset_name === undefined) {
        return "–";
      } else {
        return dataset_name;
      }
    },
    roundSimilarityScore(score) {
      return score.toFixed(4);
    },
    getNameForFile() {
      let name = "";
      if (this.selectedResult.name === "") {
        name = this.selectedResult.method;
      } else {
        name = this.selectedResult.name;
      }
      return name + "–" + this.selectedResult.started_at.replace(":","-") + ".json";
    },
    displayRunDate() {
      if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
        return this.selectedResult.started_at.replace("Z", "").replace("T", " ").substring(0, 19);
      } else {
        return "–";
      }
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
      if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
        this.resultToEdit = this.selectedResult;
        this.newResultName = this.selectedResult.name;
        this.editDialogVisible = true;
      } else {
        this.displaySnackbar("Select a result first!");
        setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
      }
    },
    showDeleteResult() {
      if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
        this.resultToDelete = this.selectedResult;
        this.deleteSnackbarVisible = true;
      } else {
        this.displaySnackbar("Select a result first!");
        setTimeout(() => {  this.snackbarVisible = false; }, SNACKBAR_DISPLAY_TIME);
      }
    },
  },
  mounted() { },
}
function isNotContained(set, arr){
  const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

  let is_contained = false;
  for (let s of arr) {
    is_contained = eqSet(s, set)
    if (is_contained) break;
  }
  return !is_contained;
}
</script>

<style scoped>

#parameter_holder {
  margin-bottom: 20px;
}

#us-similarity-result-table {
  margin-bottom: 20px;
}

#resultTable tr td{
  white-space: pre-line;
}

.param_header {
  padding-bottom: 5px;
}

.param_holder {
  min-width: 360px;
}

#parameter_layout {
  padding-left: 20px;
  padding-bottom: 20px;
}

.btnAlign {
  float: right;
}
  
</style>
