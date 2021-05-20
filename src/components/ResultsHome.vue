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
        <metric-topic-coherence/>
      </v-flex>
      <v-flex xs6 right-half-row-widget>
        <metric-perplexity/>
      </v-flex>
    </v-layout>
    <v-layout row full-row-widget>
      <v-flex xs12>
        <v-card>
        <ul>
          <li v-for="topic in topics" :key="topic.number">
            Topic {{ topic.number}} ({{ topic.name}}): <span v-for="word in topic.words" :key="word">{{ word }}, </span>
          </li>
        </ul>
        </v-card>
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
    "metric-topic-coherence": () =>
        import("./widget/MetricTopicCoherence"),
    "metric-perplexity": () => import("./widget/MetricPerplexity"),
    "metric-f1-score": () =>
        import("./widget/MetricF1Score"),
    topics:
        [{number: 1, name: "", words: ["test", "text", "more"], probability: 0.97},{number: 2, name: "misc", words: ["another", "topic"], probability: 0.23}],
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