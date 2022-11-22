<template>
  <v-card id="holder">
    <v-card-title>
      <h2>
        Ground Truth Comparison
      </h2>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <v-card elevation="0" class="param_header">
          <v-card-title class="param_header">
            Threshold to calculate performance
          </v-card-title>
          <v-card-text class="param_content">
            <v-text-field v-model="threshold" clearable :rules="thresholdRules">
            </v-text-field>
          </v-card-text>
        </v-card>
      </v-layout>
      <v-layout row wrap>
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
      <v-layout row wrap>
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
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Result Length</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ resultsCount }}
          </v-card-text>
        </v-card>
        <v-divider vertical inset/>
        <v-card elevation="0" class="param_holder">
          <v-card-title class="param_header">
            <span class="grey--text text-uppercase">Groundtruth Length</span>
          </v-card-title>
          <v-card-text class="param_content">
            {{ groundtruthCount }}
          </v-card-text>
        </v-card>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "GroundtruthComparisonUsSimilarity",
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
      threshold: 0.1,
      thresholdRules: [
        v => !!v || 'Threshold is required',
        v => (v && v <= 1 && v >= 0) || 'Must be between 0 and 1',
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
    threshold: function () {
      this.updateScores();
    }
  },
  methods: {
    updateScores() {
      this.groundtruthCount = this.groundtruth.length;
      if (this.groundtruthCount === 0) {
        return;
      }

      const eqSet = (xs, ys) =>
          xs.size === ys.size &&
          [...xs].every((x) => ys.has(x));

      let resultCountTemp = 0;    
      let truePositives = 0;
      for (let resultEntry of this.result) {
        if (resultEntry.score >= this.threshold) {
          resultCountTemp++;
          let set1 = resultEntry.set;
          for (let set2 of this.groundtruth) {
            if (eqSet(set1, set2)) {
              truePositives++;
            }
          }
        }
      }

      this.resultsCount = resultCountTemp;
      this.truePositives = truePositives;
      this.falsePositives = this.resultsCount - this.truePositives;
      this.falseNegatives = this.groundtruthCount - this.truePositives;

      this.precision = this.truePositives/(this.truePositives+this.falsePositives);
      if(isNaN(this.precision)) {
        this.precision = 0;
      }
      this.recall = this.truePositives/(this.truePositives+this.falseNegatives);
      if(isNaN(this.recall)) {
        this.recall = 0;
      }
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
  margin-bottom: 20px;
}
</style>