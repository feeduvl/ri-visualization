<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component" v-bind:methods="methods" v-bind:results="results"/>
    </v-layout>
    <v-card>
      <v-card-title>
        <h2>Documents and Concepts</h2>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="Search for ID or text content"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="dataset.documents"
          :pagination.sync="pagination"
          :loading="loadingDataset"
          :search="search"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>{{ props.item.id }}</td>
            <td :inner-html.prop="props.item.text | highlight(search)"></td>
            <td>
              <span v-for="word in topicWordlist">
                <span v-if="props.item.text.includes(word)">
                  <v-chip @click="search = word">{{ word }}</v-chip><span> </span>
                </span>
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

import {GET_DATASET_ENDPOINT} from "@/RESTconf";
import axios from "axios";
import {mapGetters} from "vuex";

export default {
  name: "DocumentsHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
  },
  computed: {
    ...mapGetters({
      results: 'results',
      dataset: 'selectedDataset',
      selectedResult: 'selectedResult',
      loadingDataset: 'loadingDataset',
    }),
    topicWordlist() {
      let list = []
      for (let topic in this.selectedResult.topics) {
        for (let index in this.selectedResult.topics[topic]) {
          let word = this.selectedResult.topics[topic][index];
          if (!(list.indexOf(word) > -1)) {
            list.push(word);
          }
        }
      }
      return list;
    }
  },
  filters: {
    highlight: function (value, query) {
      return value.replace(new RegExp(query, "ig"), '<span class=\'blue\'>' + query + '</span>')
    },
  },
  data: function () {
    return {
      methods: [],
      component: "uvl-filter-toolbar",
      documents: [],
      search: "",
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
          text: "Text",
          align: "left",
          sortable: false,
          value: "text",
          width: "45%",
          filterable: true
        },
        {
          text: "Concepts",
          align: "left",
          sortable: false,
          value: "text",
          width: "45%"
        },
      ],
      pagination: {
        sortBy: "ID",
        descending: false
      },
    };
  },
  methods: {
    async loadDataset() {
      axios
          .get(GET_DATASET_ENDPOINT(this.selectedResult["dataset_name"]))
          .then(response => {
            this.documents = response.data;
          })
          .catch(e => {
            this.errors.push(e);
          });
    },
  },
  mounted() {
  }
}
</script>

<style scoped>
.spacing {
  margin-bottom: 20px;
}

.small {
  flex-basis: 4.5%;
}

.space-left {
  padding-left: 10px;
}

.layout.row {
  padding-bottom: 10px;
}
</style>