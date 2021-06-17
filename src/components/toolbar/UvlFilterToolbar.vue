<template>
  <v-toolbar :color="color" height="75">
    <v-layout row wrap>
      <v-flex xs5 v-if="showMethodFilter()">
        <v-select
            v-model="selectedMethod"
            :items="methods"
            label="Select Method"
            :dense="true"
            @change="filterResultsByMethod"
        >
        </v-select>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs5 v-if="showResultsFilter()">
        <v-select
            v-model="selectedResultByDate"
            :items="results"
            label="Select Run"
            :item-text="getResultItemText"
            item-value="started_at"
            :dense="true"
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
import {ACTION_FILTER_RESULTS, ACTION_FILTER_TWEETS, MUTATE_SELECTED_RESULT} from "@/store/types";
import {METHOD_LIST} from "@/methods";

export default {
  name: "UvlFilterToolbar",
  computed: {
    ...mapGetters({
      results: 'filteredResults',
      selectedResult: 'selectedResult',
    }),

  },
  data() {
    return {
      color: BLUE_FILL,
      selectedMethod: "",
      selectedResultByDate: "",
      methods: METHOD_LIST,
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
      let payload = {
        method: this.selectedMethod,
      };
      this.$store.dispatch(ACTION_FILTER_RESULTS, payload);
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
      this.$store.commit(MUTATE_SELECTED_RESULT, this.getSelectedResultFromDate());
      console.log("UvlFilterToolBar::updateDataset: ");
      console.log(JSON.stringify(this.selectedResult));
      loadDataset(this.$store, this.selectedResult["dataset_name"]);
    },
    getResultItemText(item) {
      let n = "";
      if (item.name === "") {
        n = item.method;
      } else {
        n = item.name;
      }
      return n + " - " + item.started_at.replace("Z", "").replace("T", " ");
    },
  },

}
</script>

<style scoped>

</style>