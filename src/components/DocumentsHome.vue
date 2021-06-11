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
          :loading="loading"
          :search="search"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>{{ props.item.number }}</td>
            <td>{{ props.item.text }}</td>
            <td>
              <span v-for="topic in selectedResult.doc_topic[props.item.number]" :key="topic[0]">
                <b>Concept {{ topic[0] }} ():</b> <span v-for="word in selectedResult.topics[topic[0]]" :key="word">{{
                  word
                }}, </span><span class="space-left"> {{ topic[1].toFixed(5) * 100 }}%</span><br>
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

import {GET_ALL_RESULTS_ENDPOINT, GET_DATASET_ENDPOINT} from "@/RESTconf";
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
      selectedResult: 'selectedResult'
    })
  },
  data: function () {
    return {
      methods: [],
      component: "uvl-filter-toolbar",
      documents: {},
      search: "",
      tableHeaders: [
        {
          text: "ID",
          align: "center",
          sortable: true,
          value: "number",
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
        sortBy: "number",
        descending: false
      },
      loading: false,
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