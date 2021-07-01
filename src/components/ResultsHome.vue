<template>
  <v-container>
    <v-layout row class="spacing">
      <uvl-filter-toolbar/>
    </v-layout>
    <v-layout row class="spacing">
      <v-flex xs12>
        <component v-bind:is="resultComponent"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>

import {mapGetters} from "vuex";
import {getMethodObj} from "@/methods";

export default {
  name: "ConceptHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
    "topic-detection-result": () => import("./result/TopicDetectionResult"),
    "empty-result": () => import("./result/EmptyResult"),
  },
  computed: {
    ...mapGetters({
      selectedMethod: 'selectedMethod'
    }),
    resultComponent () {
      return getMethodObj(this.selectedMethod).resultComponentName;
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