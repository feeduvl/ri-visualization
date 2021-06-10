<template>
  <v-toolbar :color="color" height="75">
    <v-layout row wrap>
      <v-flex xs5 v-if="showMethodFilter()">
        <v-select
            :menu-props="{maxWidth:'300'}"
            v-model="selectedMethod"
            :items="methods"
            label="Select Method"
            @change="filterResultsByMethod"
        >
        </v-select>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs5 v-if="showResultsFilter()">
        <v-select
            :menu-props="{maxWidth:'300'}"
            v-model="selectedResult"
            :items="results"
            label="Select Run"
            @change="updateDataset"
        >
        </v-select>
      </v-flex>
    </v-layout>
  </v-toolbar>
</template>

<script>
import { BLUE_FILL } from "@/colors";
import {
  ROUTE_DOCUMENTS,
  ROUTE_CONCEPTS,
  ROUTE_RESULTS
} from "@/routes";
import {mapGetters} from "vuex";
import {loadDataset} from "@/RESTcalls";

export default {
  name: "UvlFilterToolbar",
  computed: {
    ...mapGetters({
      results: 'results'
    })
  },
  data() {
    return {
      color: BLUE_FILL,
      selectedMethod: "",
      selectedResult: {},
      methods: [],
      path: this.$router.currentRoute.path
    };
  },
  methods: {
    showMethodFilter() {
      return (
          this.path === ROUTE_DOCUMENTS ||
          this.path === ROUTE_CONCEPTS ||
          this.path === ROUTE_RESULTS
      );
    },
    showResultsFilter() {
      return (
          this.path === ROUTE_DOCUMENTS ||
          this.path === ROUTE_CONCEPTS ||
          this.path === ROUTE_RESULTS
      );
    },
    filterResultsByMethod() {

    },
    updateDataset() {
      loadDataset(this.$store, this.selected_result["dataset_name"]);
    },
  },

}
</script>

<style scoped>

</style>