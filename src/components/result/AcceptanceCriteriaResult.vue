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
          <template v-for="(item, key) in selectedResult.params">
            <v-card :key="key" elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">{{ key }}</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ item }}
              </v-card-text>
            </v-card>
          </template>
          <template v-for="(item, key) in selectedResult.metrics">
            <v-card :key="key" elevation="0" class="param_holder">
              <v-card-title class="param_header">
                <span class="grey--text text-uppercase">{{ key }}</span>
              </v-card-title>
              <v-card-text class="param_content">
                {{ item }}
              </v-card-text>
            </v-card>
          </template>
        </v-layout>
        <v-data-table
            :headers="tableHeaders"
            :items="selectedDataset.documents"
            :pagination.sync="pagination"
            :loading="loadingResults"
            :search="search"
        >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ props.item.id }}</td>
              <td :inner-html.prop="props.item.text | highlight(search)"></td>
              <td>
                <span v-for="ac in getAC(props.item.id)" :key="ac">
                  <v-chip @click="searchProxy = ac">{{ ac }}</v-chip><span> </span>
                </span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapGetters} from "vuex";
// import Cloud from 'vue-d3-cloud';
// import {BLUE_LIGHT, CLOUD, ORANGE_LIGHT} from "@/colors";
import {getMethodObj} from "@/methods";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
import axios from "axios";
import {DELETE_RESULT_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT} from "@/RESTconf";
import {ACTION_DELETE_RESULT, ACTION_EDIT_RESULT_NAME, MUTATE_SELECTED_RESULT} from "@/store/types";

export default {
  name: "AcceptanceCriteriaResult",
  watch: {
    // selectedResult: function () {
    //   this.updateWordMapping();
    // },
    // selectedDataset: function () {
    //   this.updateWordMapping();
    // }
  },
  computed: {
    ...mapGetters({
      loadingResults: 'loadingResults',
      selectedResult: 'selectedResult',
      selectedDataset: 'selectedDataset',
    }),
    search() {
      if (this.searchProxy === null) {
        return null;
      } else {
        return " " + this.searchProxy;
      }
    },
    // getAC: function (usNumber) {
    //   return "someWord";
    // },
    // topicWordList() {
    //   let list = [];
    //   for (let topic in this.selectedResult.topics) {
    //     for (let index in this.selectedResult.topics[topic]) {
    //       let word = this.selectedResult.topics[topic][index];
    //       if (word.length <= 1) {
    //         continue;
    //       }
    //       if (!(list.indexOf(word) > -1)) {
    //         list.push(word);
    //       }
    //     }
    //   }
    //   return list.sort();
    // },
    // groundtruthList() {
    //   let list = [];
    //   if (Object.prototype.hasOwnProperty.call(this.selectedDataset,"ground_truth")) {
    //     for (let index in this.selectedDataset.ground_truth) {
    //       let gt = this.selectedDataset.ground_truth[index];
    //       if (!(list.indexOf(gt.value) > -1)) {
    //         list.push(gt.value);
    //       }
    //     }
    //   }
    //   return list.sort();
    // },
    // topicWords() {
    //   if (this.selectedDataset.documents !== undefined) {
    //     let list = [];
    //     let tw = [];
    //     for (let topic in this.selectedResult.topics) {
    //       for (let index in this.selectedResult.topics[topic]) {
    //         let word = this.selectedResult.topics[topic][index];
    //         if (word.length <= 1) {
    //           continue;
    //         }
    //         if (!(list.indexOf(word) > -1)) {
    //           list.push(word);
    //         }
    //       }
    //     }
    //     for (const word of list) {
    //       let count = 0;
    //       for (const document of this.selectedDataset["documents"]) {
    //         if ((" " + document.text.toLowerCase()).includes(" " + word)) {
    //           count++;
    //         }
    //       }
    //       tw.push({text: word, value: Math.min((count *2) + this.baseFontsize, 100)});
    //     }
    //     return tw;
    //   } else {
    //     return [];
    //   }
    // }
  },
  components: {
    // Cloud,
    // "heatmap-word-document": () =>
    //     import("../widget/heatmap/HeatmapWordDocument"),
    // "groundtruth-comparison": () => import("@/components/widget/table/GroundtruthComparison"),
  },
  data: function () {
    return {
      methods: [],
      // component: "uvl-filter-toolbar",
      documents: [],
      searchProxy: "",
      itemsPerPage: 25,
      tableHeaders: [
        {
          text: "ID",
          align: "center",
          sortable: true,
          value: "id",
          width: "10%",
          filterable: true
        },
        {
          text: "User Story",
          align: "left",
          sortable: false,
          value: "text",
          width: "45%",
          filterable: true
        },
        {
          text: "Acceptance Criteria",
          align: "left",
          sortable: false,
          value: "text",
          width: "45%"
        },
      ],
      pagination: {
        sortBy: "ID",
        descending: false,
        rowsPerPage: 25,
      },
    //   BLUE_LIGHT: BLUE_LIGHT,
    //   ORANGE_LIGHT: ORANGE_LIGHT,
    //   baseFontsize: 20,
    //   resultToDelete: {},
    //   resultToEdit: {},
    //   showMatching: true,
    //   showNotMatching: true,
    //   deleteSnackbarVisible: false,
    //   editDialogVisible: false,
    //   conceptWordPositives: [],
    //   groundtruthPositives: [],
    //   newResultName: "",
    //   deleteBtn: false,
    //   editBtn: false,
    //   snackbarVisible: false,
    //   snackbarTimeout: 0,
    //   deleteSnackbarTimeout: 0,
    //   snackbarText: "",
    //   fontSizeMapper: word => word.value,
    //   rotate: 0,
    //   coloring: "random",
    //   colors: CLOUD,
    //   width: 1152,
    //   height: 400,
    //   padding: 5,
    //   errors: [],
    //   tableHeaders: [
    //     {
    //       text: "Concept Words",
    //       align: "left",
    //       sortable: false,
    //       value: "text",
    //       width: "90%",
    //       filterable: false
    //     },
    //     {
    //       text: "Ground Truth",
    //       align: "left",
    //       sortable: false,
    //       value: "text",
    //       width: "90%",
    //       filterable: false
    //     },
    //   ],
    //   pagination: {
    //     sortBy: "Number",
    //     descending: false,
    //     rowsPerPage: 10,
    //   },
    }
  },
  methods: {
    getAC: function (usNumber) {
      return "someOtherWord";
    },
    // toggleShowMatching() {
    //   this.showMatching = !this.showMatching;
    // },
    // toggleShowNotMatching() {
    //   this.showNotMatching = !this.showNotMatching;
    // },
    // updateWordMapping() {
    //   let twPositives = [];
    //   let gtPositives = [];
    //   for (let index in this.topicWordList) {
    //     for (let index2 in this.groundtruthList) {
    //       if ((" " + this.groundtruthList[index2].toLowerCase()).includes(" " + this.topicWordList[index])) {
    //         twPositives.push(this.topicWordList[index]);
    //         if (!(gtPositives.indexOf(this.groundtruthList[index2]) > -1)) {
    //           gtPositives.push(this.groundtruthList[index2]);
    //         }
    //       }
    //     }
    //   }
    //   this.conceptWordPositives = twPositives;
    //   this.groundtruthPositives = gtPositives;
    // },
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
        return "-";
      } else {
        return name;
      }
    },
    displayDatasetName(dataset_name) {
      if (dataset_name === "" || dataset_name === undefined) {
        return "-";
      } else {
        return dataset_name;
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
    // displaySnackbar(message) {
    //   this.snackbarText = message;
    //   this.snackbarVisible = true;
    // },
    // closeSnackbar() {
    //   this.snackbarVisible = false;
    //   this.snackbarText = "";
    // },
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
  mounted() {
    // this.updateWordMapping();
  },
}
</script>

<style scoped>

/* #wordcloud_holder {
  margin-bottom: 20px;
}

#concept_word_holder {
  margin-bottom: 20px;
} */

#parameter_holder {
  margin-bottom: 20px;
}

/* #heatmap-holder {
  margin-top: 20px;
} */

.param_content {
  padding-top: 0;
  padding-left: 25px;
  font-weight: 500;
  font-size: 16px;
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

/* #concept_words {
  margin-left: 20px;
  margin-bottom: 20px;
}

#groundtruth_words {
  margin-right: 20px;
  align-content: center;
} */

.grey-headline {
  color: grey;
  font-weight: 450;
}

/* #cw_legend {
  font-weight: 450;
  float: right;
  margin-top: 6px;
  margin-left: 700px;
}

#concept_word_content {
  overflow-y: scroll;
  max-height: 500px;
  padding-bottom: 20px;
} */

</style>