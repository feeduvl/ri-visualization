<template>
  <v-card id="holder">
    <v-card-title>
      <h2>
        Ground Truth Comparison
      </h2>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Concepts of Method</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ numConceptsMethod }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Concepts groundtruth</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ numConceptsGroundtruth }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">True Positives</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ truePositives }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">False Positives</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ falsePositives }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
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
            <score-gauge v-bind:value="precision"/>
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder_gauge">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Recall</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ recall.toString().substring(0, 6) }}
            <score-gauge v-bind:value="recall"/>
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder_gauge">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">F1-Score</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ fOneScore.toString().substring(0, 6) }}
            <score-gauge v-bind:value="fOneScore"/>
          </v-card-text>
        </v-card>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "GroundtruthComparison",
  components: {
    "score-gauge": () => import("@/components/widget/gauge/ScoreGauge"),
  },
  props: {
    conceptWords: Array,
    groundtruth: Array,
  },
  data: function () {
    return {
      numConceptsMethod: 0,
      numConceptsGroundtruth: 0,
      falsePositives: 0,
      falseNegatives: 0,
      truePositives: 0,
      precision: 0.0,
      recall: 0.0,
      fOneScore: 0.0,
    }
  },
  watch: {
    conceptWords: function () {
      this.updateScores();
    },
    groundtruth: function () {
      this.updateScores();
    }
  },
  methods: {
    updateScores() {
      this.numConceptsMethod = this.conceptWords.length;
      this.numConceptsGroundtruth = this.groundtruth.length;
      this.truePositives = 0;
      for (let index in this.conceptWords) {
        for (let index2 in this.groundtruth) {
          if ((" " + this.groundtruth[index2].toLowerCase()).includes(" " + this.conceptWords[index])) {
            this.truePositives++;
            break;
          }
        }
      }
      this.falseNegatives = this.numConceptsGroundtruth - this.truePositives;
      this.falsePositives = this.numConceptsMethod - this.truePositives;
      // precision
      this.precision = this.truePositives/(this.truePositives+this.falsePositives);
      if(isNaN(this.precision)) {
        this.precision = 0;
      }
      // recall
      this.recall = this.truePositives/(this.truePositives+this.falseNegatives);
      if(isNaN(this.recall)) {
        this.recall = 0;
      }
      // f1-score
      this.fOneScore = this.truePositives/(this.truePositives + (0.5 * (this.falsePositives + this.falseNegatives)));
      if(isNaN(this.fOneScore)) {
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