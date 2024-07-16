<template>
  <v-container>
    <v-layout row class="spacing">
      <uvl-filter-toolbar />
    </v-layout>
    <v-layout row class="spacing">
      <v-flex xs12>
        <component v-bind:is="resultComponent" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

import { mapGetters } from "vuex";
import { getMethodObj, METHODS, getMethodOrChainedObj } from "@/methods";

export default {
  name: "ConceptHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
    "topic-detection-result": () => import("./result/TopicDetectionResult"),
    "fcic-result": () => import("./result/FcicResult"),
    "empty-result": () => import("./result/EmptyResult"),
    "rbai-result": () => import("./result/RbaiResult"),
    "acceptance-criteria-result": () => import("./result/AcceptanceCriteriaResult"),
    "classifier-tore-result": () => import("./result/ClassifierTOREResult"),
    "bi-lstm-tore-result": () => import("./result/ClassifierTOREResult"),
    "us-similarity-result": () => import("./result/UserStorySimilarityResult"),
    "acceptance-criteria-completeness-result": () => import("./result/AcceptanceCriteriaCompletenessResult"),
    "bert-tore-result": () => import("./result/ClassifierTOREResult"),
    "bert-bert-result": () => import("./result/ClassifierTOREResult"),
    "bilstm-bert-result": () => import("./result/ClassifierTOREResult"),
    "sner-bert-result": () => import("./result/ClassifierTOREResult"),
    "relevance-classifier-result": () => import("./result/RelevanceClassifierResult"),
    "spellchecker-result": () => import("./result/SpellcheckerResult"),
  },
  computed: {
    ...mapGetters({
      selectedMethod: 'selectedMethod'
    }),
    resultComponent() {
      return getMethodOrChainedObj(METHODS, this.selectedMethod).resultComponentName;
    }
  },
  data() {
    return {
      component: "uvl-filter-toolbar",
      comp: null,
    }
  },
  methods: {},
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