<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card id="parameter_holder">
        <v-card-title>
          <h2>Method Parameter </h2>
          <v-spacer/>
          <v-btn small color="primary" @click="downloadResult" class="btnAlign">
            Download
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
        >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ props.item.id }}</td>
              <td>{{ props.item.text }}</td>
              <td>
                <span v-for="ac in getAC(props.item.number)" :key="ac">
                  <v-chip v-if="ac.startsWith('ERROR: ')" color="red" text-color="white"><v-avatar left style="margin-left: -8px; margin-right: 4px"><v-icon>error</v-icon></v-avatar>{{ ac.substring(7) }}</v-chip>
                  <v-chip v-else-if="ac.startsWith('WARNING: ')" color="orange" text-color="white"><v-avatar left style="margin-left: -8px; margin-right: 4px"><v-icon>warning</v-icon></v-avatar>{{ ac.substring(9) }}</v-chip>
                  <v-chip v-else-if="ac.startsWith('INFO: ')" color="blue" text-color="white"><v-avatar left style="margin-left: -8px; margin-right: 4px"><v-icon>info</v-icon></v-avatar>{{ ac.substring(6) }}</v-chip>
                  <v-chip v-else-if="ac.startsWith('DEBUG: ')" text-color="grey darken-1"><v-avatar left style="margin-left: -8px; margin-right: 4px"><v-icon>bug_report</v-icon></v-avatar>{{ ac.substring(7) }}</v-chip>
                  <v-chip v-else>{{ ac }}</v-chip>
                  <span> </span>
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
import {getMethodObj} from "@/methods";

export default {
  name: "AcceptanceCriteriaResult",
  watch: { },
  computed: {
    ...mapGetters({
      loadingResults: 'loadingResults',
      selectedResult: 'selectedResult',
      selectedDataset: 'selectedDataset',
    }),
  },
  components: { },
  data: function () {
    return {
      methods: [],
      documents: [],
      itemsPerPage: 25,
      tableHeaders: [
        {
          text: "ID",
          align: "center",
          sortable: false,
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
        descending: false,
        rowsPerPage: 25,
        rowsPerPageItems: [5,10,25,50,100,{"text":"All","value":-1}]
      }
    }
  },
  methods: {
    getAC: function (usNumber) {
      if (Object.keys(this.selectedResult.doc_topic).includes(usNumber.toString())) {
        let acs = []
        for (let acIdentifier of this.selectedResult.doc_topic[usNumber.toString()]) {
          if (acIdentifier[1] > 0.5) {
            acs.push(this.selectedResult.topics[acIdentifier[0].toString()][0])
          }
        }
        return acs;
      }
      return [];
    },
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
    displayScore(item) {
      return getMethodObj(item.method).scoreFunction(item);
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
      }
    }
  },
  mounted() { },
}
</script>

<style scoped>

#parameter_holder {
  margin-bottom: 20px;
}

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

.grey-headline {
  color: grey;
  font-weight: 450;
}

::v-deep .v-chip {
  border-radius: 14px;
}

::v-deep .v-chip__content {
  height: auto;
  padding: 6px 12px;
  white-space: normal;
}

</style>