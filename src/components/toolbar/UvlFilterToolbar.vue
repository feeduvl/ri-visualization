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
            v-model="selectedResultByDate"
            :items="results"
            label="Select Run"
            item-text="started_at"
            @change="updateData"
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
import {MUTATE_SELECTED_RESULT} from "@/store/types";

export default {
  name: "UvlFilterToolbar",
  computed: {
    ...mapGetters({
      results: 'results'
    }),

  },
  data() {
    return {
      color: BLUE_FILL,
      selectedMethod: "",
      selectedResultByDate: "",
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
    getSelectedResultFromDate () {
      let res = {};
      for (const r of this.results) {
        if (r["started_at"] === this.selectedResultByDate) {
          res = r;
          break;
        }
      }
      return res;
    },
    updateData() {
      console.log("UvlFilterToolBar::updateDataset: ");
      console.log(JSON.stringify(this.selectedResult));
      loadDataset(this.$store, this.selectedResult["dataset_name"]);
      this.$store.commit(MUTATE_SELECTED_RESULT, this.getSelectedResultFromDate());
    },
  },

}
</script>

<style scoped>

</style>