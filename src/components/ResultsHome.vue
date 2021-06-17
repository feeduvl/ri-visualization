<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component"/>
    </v-layout>
    <v-card>
      <component v-bind:is="resultComponent"/>
    </v-card>
  </v-container>
</template>

<script>

import {mapGetters} from "vuex";
import {METHODS} from "@/methods";

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
      if (this.selectedMethod === "") {
        return "empty-result"
      } else {
        return METHODS[this.selectedMethod].resultComponentName;
      }
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