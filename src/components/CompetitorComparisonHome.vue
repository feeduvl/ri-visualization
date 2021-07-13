<template>
  <v-container>
    <v-layout>
      <filter-tool-bar />
    </v-layout>
    <v-spacer />
    <v-layout row wrap>
      <v-flex xs12 md6 left-half-row-widget class="row">
        <sentiment-performance-multiline />
      </v-flex>
      <v-flex xs12 md6 class="row">
        <class-frequency-distribution-multibar />
      </v-flex>
      <v-flex xs12 class="row">
        <competitor-comparison />
      </v-flex>
      <v-flex xs12 class="row" v-for="topic in selectedTopics" :key="topic">
        <competitor-comparison :topic="topic" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

const PROBLEM_REPORTS = "problem_reports";
const INQUIRIES = "inquiries";
const ACCOUNT = "account";
const TOTAL = "total";
const YESTERDAY = "yesterday";
const WEEK = "week";
const MONTH = "month";

export default {
  name: "CompetitorComparisonHome",
  components: {
    "filter-tool-bar": () => import("./toolbar/FilterToolBar"),
    "sentiment-performance-multiline": () =>
      import("./widget/line/SentimentPerformanceMultiline"),
    "class-frequency-distribution-multibar": () =>
      import("./widget/bar/ClassFrequencyDistributionMultibar"),
    "competitor-two-category-comparison": () =>
      import("./widget/table/CompetitorTwoCategoryComparison"),
    "trend-multiline": () => import("./widget/line/TrendMultiline"),
    "competitor-comparison": () =>
      import("./widget/comparison/CompetitorSideBySideComparison")
  },
  data() {
    return {
      selectedTopics: [],
      errors: [],
    };
  },
  mounted() {
    this.topics = this.$store.state.accessKeyConfiguration.topics;
    this.$store.watch(
      (state, getters) => getters.selectedTopics,
      (newValue, oldValue) => {
        this.selectedTopics = [...newValue];
      }
    );
  }
};
</script>

<style scoped>
table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}
.row {
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>