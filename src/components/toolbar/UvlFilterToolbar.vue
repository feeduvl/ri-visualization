<template>
  <v-toolbar :color="color" height="75">
    <v-layout row wrap>
      <v-flex xs5 v-if="showMethodFilter()">
        <v-select
            v-model="selectedMethod"
            :items="methods"
            item-text="displayName"
            item-value="name"
            label="Select Method"
            :dense="true"
            :disabled="loading"
            @change="updateSelectedMethod"
        >
        </v-select>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs5 v-if="showResultsFilter()">
        <v-select
            v-model="selectedResultByDate"
            :items="resultsForMethod"
            label="Select Run"
            :item-text="getResultItemText"
            item-value="started_at"
            :dense="true"
            :disabled="loading"
            :loading="loading"
            @change="updateSelectedResult"
        >
        </v-select>
      </v-flex>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
              @click="reloadResults"
              v-bind="attrs"
              v-on="on"
              id="reload-btn"
          >
            refresh
          </v-icon>
        </template>
        <span>Reload Results</span>
      </v-tooltip>
    </v-layout>
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
  </v-toolbar>
</template>

<script>
import { BLUE_FILL } from "@/colors";
import {
  ROUTE_DOCUMENTS,
  ROUTE_RESULTS
} from "@/routes";
import {mapGetters} from "vuex";
import {reloadResults} from "@/RESTcalls";
import {MUTATE_SELECTED_METHOD, MUTATE_SELECTED_RESULT} from "@/store/types";
import {METHODS} from "@/methods";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";

export default {
  name: "UvlFilterToolbar",
  computed: {
    methods(){
      if(this.path === ROUTE_DOCUMENTS){
          return this.documentViewMethods;
      } else{
        return METHODS;
      }
    },
    ...mapGetters({
      resultsForMethod: 'resultsForSelectedMethod',
      selectedResult: 'selectedResult',
      datasets: "datasets",
      documentViewMethods: "documentViewMethods"
    }),
  },
  data() {
    return {
      loading: this.$store.state.loadingResults,
      color: BLUE_FILL,
      selectedMethod: "",
      selectedResultByDate: "",
      path: this.$router.currentRoute.path,
      snackbarVisible: false,
      snackbarTimeout: SNACKBAR_DISPLAY_TIME,
      snackbarText: "",
      sortedResults: [],
    };
  },
  methods: {
    showMethodFilter() {
      return (
          this.path === ROUTE_DOCUMENTS ||
          this.path === ROUTE_RESULTS
      );
    },
    showResultsFilter() {
      return (
          this.path === ROUTE_DOCUMENTS ||
          this.path === ROUTE_RESULTS
      );
    },
    getSelectedResultFromDate () {
      let res = {};
      for (const r of this.resultsForMethod) {
        if (r["started_at"] === this.selectedResultByDate) {
          res = r;
          break;
        }
      }
      return res;
    },
    updateSelectedMethod(){
      this.$store.commit(MUTATE_SELECTED_METHOD, this.selectedMethod);
    },
    updateSelectedResult() {
      this.$store.commit(MUTATE_SELECTED_RESULT, this.getSelectedResultFromDate());
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
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },
    reloadResults() {
      reloadResults(this.$store);
    },
  }
}

</script>

<style scoped>
#reload-btn {
  margin-left: 10px;
}
</style>