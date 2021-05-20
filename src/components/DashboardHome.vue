<template>
  <v-container>
    <v-layout row>
      <filter-tool-bar/>
    </v-layout>

    <v-layout row full-row-widget>
      <v-flex xs12>
        <heatmap-class-frequency/>
      </v-flex>
    </v-layout>

    <div v-if="$vuetify.breakpoint.smAndUp">
      <v-layout row full-row-widget>
        <v-flex xs4 md6 left-half-row-widget>
          <classification-trend-report tweetCategory="problem_report"/>
        </v-flex>
        <v-flex xs4 md6 left-half-row-widget>
          <classification-trend-report tweetCategory="inquiry"/>
        </v-flex>
        <v-flex xs4 md6 right-half-row-widget>
          <sentiment-trend-report/>
        </v-flex>
      </v-layout>

      <v-layout row full-row-widget>
        <v-flex xs6 left-half-row-widget>
          <class-frequency-distribution/>
        </v-flex>
        <v-flex xs6 right-half-row-widget>
          <sentiment-performance/>
        </v-flex>
      </v-layout>
    </div>
    <div v-else>
      <v-flex xs12 full-row-widget>
        <classification-trend-report tweetCategory="problem_report"/>
      </v-flex>
      <v-flex xs12 full-row-widget>
        <classification-trend-report tweetCategory="inquiry"/>
      </v-flex>
      <v-flex xs12 full-row-widget>
        <sentiment-trend-report/>
      </v-flex>
      <v-flex xs12 full-row-widget>
        <class-frequency-distribution/>
      </v-flex>
      <v-flex xs12 full-row-widget>
        <sentiment-performance/>
      </v-flex>
    </div>
  </v-container>
</template>
<script>
import {
  ACTION_SET_FOOTER_TEXT,
  ACTION_SET_PROJECT_TITLE,
  ACTION_SET_TOP_BAR_ALT_TEXT,
  ACTION_SET_TOP_BAR_LOGO
} from "@/store/types";
import {THEME_OPENREQ, setTheme} from "@/theme";

export default {
  name: "DashboardHome",
  components: {
    "filter-tool-bar": () => import("./toolbar/FilterToolBar"),
    "heatmap-class-frequency": () =>
      import("./widget/heatmap/HeatmapClassFrequency"),
    "sentiment-trend-report": () =>
      import("./widget/trend/SentimentTrendReport"),
    "classification-trend-report": () =>
      import("./widget/trend/ClassificationTrendReport"),
    "sentiment-performance": () => import("./widget/line/SentimentPerformance"),
    "class-frequency-distribution": () =>
      import("./widget/bar/ClassFrequencyDistribution")
  },
  mounted() {
    setTheme("Dashboard", THEME_OPENREQ, this.$store);
  }
};
</script>


