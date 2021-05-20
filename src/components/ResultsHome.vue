<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component" v-bind:dataset="selectedMethod"/>
    </v-layout>
    <v-card>
      Test Detection Results
    </v-card>
    <v-layout row full-row-widget>
      <v-flex xs6 left-half-row-widget>
        <class-frequency-distribution/>
      </v-flex>
      <v-flex xs6 right-half-row-widget>
        <sentiment-performance/>
      </v-flex>
    </v-layout>
    <v-layout row full-row-widget>
      <v-flex xs12>
        <heatmap-class-frequency/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {THEME_UVL, setTheme} from "@/theme";

export default {
  name: "ConceptHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
    "heatmap-class-frequency": () =>
        import("./widget/heatmap/HeatmapClassFrequency"),
    "sentiment-performance": () => import("./widget/line/SentimentPerformance"),
    "class-frequency-distribution": () =>
        import("./widget/bar/ClassFrequencyDistribution")
  },
  data() {
    return {
      designTheme: THEME_UVL,
      topBarTitle: "Detection Results",
      component: "uvl-filter-toolbar",
    }
  },
  methods: {},
  mounted() {
    setTheme(this.topBarTitle, this.designTheme, this.$store);
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
  float: right;
}

.layout.row {
  padding-bottom: 10px;
}
</style>