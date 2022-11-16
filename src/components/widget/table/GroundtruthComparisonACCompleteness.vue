<template>
  <v-card id="holder">
    <v-card-title>
      <h2>
        Ground Truth Comparison
      </h2>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <v-card>
          <v-card-title class="param_header">
            Threshold to calculate performance
          </v-card-title>
          <v-card-text class="param_content">
            <v-text-field v-model="comparisonThreshold" clearable :rules="thresholdRulesFloat">
            </v-text-field>
          </v-card-text>
        </v-card>
        <v-divider vertical inset />
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">True Positives</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ truePositives }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset />
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">False Positives</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ falsePositives }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset />
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">False Negatives</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ falseNegatives }}
          </v-card-text>
        </v-card>
        <v-card elevation="0" class="param_holder_gauge">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Precision</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ precision.toString().substring(0, 6) }}
            <score-gauge v-bind:value="precision" />
          </v-card-text>
        </v-card>
        <v-divider vertical inset />
        <v-card elevation="0" class="param_holder_gauge">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Recall</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ recall.toString().substring(0, 6) }}
            <score-gauge v-bind:value="recall" />
          </v-card-text>
        </v-card>
        <v-divider vertical inset />
        <v-card elevation="0" class="param_holder_gauge">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">F1-Score</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ fOneScore.toString().substring(0, 6) }}
            <score-gauge v-bind:value="fOneScore" />
          </v-card-text>
        </v-card>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "GroundtruthComparisonACCompleteness",
  components: {
    "score-gauge": () => import("@/components/widget/gauge/ScoreGauge"),
  },
  props: {
    result: Array,
    groundtruth: Array,
  },
  data: function () {
    return {
      resultsCount: 0,
      groundtruthCount: 0,
      falsePositives: 0,
      falseNegatives: 0,
      truePositives: 0,
      precision: 0.0,
      recall: 0.0,
      fOneScore: 0.0,
      comparisonThreshold: 0.1,
      thresholdRulesFloat: [
        v => !!v || 'Threshold is required',
        v => (v && v < 1 && v > 0) || 'Must be greater than 0 and smaller than 1',
      ],
    }
  },
  watch: {
    result: function () {
      this.updateScores();
    },
    groundtruth: function () {
      this.updateScores();
    },
    comparisonThreshold: function () {
      this.updateScores();
    }
  },
  methods: {
    updateScores() {
      this.truePositives = 0;
      this.falsePositives = 0;
      this.falseNegatives = 0;
      this.trueNegatives = 0;
      for (let resultItem in this.result) {
        for (let gtItem in this.groundtruth) {
          if (this.groundtruth[gtItem].id == this.result[resultItem].id) {
            if (this.result[resultItem].completeness < this.comparisonThreshold) {
              if (parseInt(this.groundtruth[gtItem].value) < 0.5) {
                this.trueNegatives++;
              } else {
                this.falseNegatives++;
              }
            } else {
              if (parseInt(this.groundtruth[gtItem].value) < 0.5) {
                this.falsePositives++;
              } else {
                this.truePositives++;
              }
            }
            break;
          }
        }
      }
      // precision
      this.precision = this.truePositives / (this.truePositives + this.falsePositives);
      if (isNaN(this.precision)) {
        this.precision = 0;
      }
      // recall
      this.recall = this.truePositives / (this.truePositives + this.falseNegatives);
      if (isNaN(this.recall)) {
        this.recall = 0;
      }
      // f1-score
      this.fOneScore = this.truePositives / (this.truePositives + (0.5 * (this.falsePositives + this.falseNegatives)));
      if (isNaN(this.fOneScore)) {
        this.fOneScore = 0;
      }
    },
  },
  mounted() {
    this.updateScores();
  },
}
</script>

<style scoped>
.param_header {
  padding-bottom: 5px;
}

.param_holder {
  min-width: 222px;
}

.param_holder_gauge {
  min-width: 360px;
  max-height: 220px;
  overflow: hidden;
}

.param_content {
  padding-top: 0;
  padding-left: 25px;
  font-size: 20px;
  font-weight: 500;
}

#holder {
  max-height: 450px;
}
</style>