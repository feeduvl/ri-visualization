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
            @change="filterResultsByMethod"
        >
        </v-select>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs5 v-if="showResultsFilter()">
        <v-select
            v-model="selectedResultByDate"
            :items="sortedResults"
            label="Select Run"
            :item-text="getResultItemText"
            item-value="started_at"
            :dense="true"
            :disabled="loading"
            :loading="loading"
            @change="updateData"
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
import {loadDataset, reloadResults} from "@/RESTcalls";
import {ACTION_FILTER_RESULTS, MUTATE_SELECTED_METHOD, MUTATE_SELECTED_RESULT} from "@/store/types";
import {METHODS} from "@/methods";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";

export default {
  name: "UvlFilterToolbar",
  computed: {
    ...mapGetters({
      results: 'filteredResults',
      selectedResult: 'selectedResult',
      loading: "loadingResults",
      datasets: "datasets",
    }),
  },
  watch: {
    results: function (newValue, oldValue) {
      let a = this.results.slice();
      this.sortedResults = a.reverse();
    },
    selectedResult: function () {
      this.selectedResultByDate = this.selectedResult.started_at;
      this.selectedMethod = this.selectedResult.method;
      this.filterResultsByMethod();
      this.$store.commit(MUTATE_SELECTED_METHOD, this.selectedResult.method);
      console.log("UvlFilterToolBar::updateData: ");
      console.log(JSON.stringify(this.selectedResult));
      if (!(this.datasets.includes(this.selectedResult["dataset_name"]))) {
        this.displaySnackbar("Dataset is not in database anymore!");
      } else {
        loadDataset(this.$store, this.selectedResult["dataset_name"]);
      }
    }
  },
  data() {
    return {
      color: BLUE_FILL,
      selectedMethod: "",
      selectedResultByDate: "",
      methods: METHODS,
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
    filterResultsByMethod() {
      let payload = {
        method: this.selectedMethod,
      };
      this.$store.dispatch(ACTION_FILTER_RESULTS, payload);
      this.$store.commit(MUTATE_SELECTED_METHOD, this.selectedMethod);
      if ((JSON.stringify(this.selectedResult) !== JSON.stringify({}))) {
        if (this.selectedResult.method !== this.selectedMethod) {
          this.$store.commit(MUTATE_SELECTED_RESULT, {});
        }
      }
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
  },
  mounted() {
    let a = this.results.slice();
    this.sortedResults = a.reverse();

    if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
      this.selectedResultByDate = this.selectedResult.started_at;
      this.selectedMethod = this.selectedResult.method;
      this.filterResultsByMethod();
      this.$store.commit(MUTATE_SELECTED_METHOD, this.selectedResult.method);
      console.log("UvlFilterToolBar::updateData: ");
      console.log(JSON.stringify(this.selectedResult));
      if (!(this.datasets.includes(this.selectedResult["dataset_name"]))) {
        this.displaySnackbar("Dataset is not in database anymore!");
      } else {
        loadDataset(this.$store, this.selectedResult["dataset_name"]);
      }
    }
  }
}
</script>

<style scoped>
#reload-btn {
  margin-left: 10px;
}
</style>