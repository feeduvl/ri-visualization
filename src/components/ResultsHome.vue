<template>
  <v-container>
    <v-layout row class="spacing">
      <uvl-filter-toolbar/>
    </v-layout>
    <v-card>
      <component v-bind="resultComponentProps" v-bind:is="resultComponent"/>
    </v-card>
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
    "ranked-list-result": () => import("./result/RankedListResult"),
    "empty-result": () => import("./result/EmptyResult"),
  },
  computed: {
    ...mapGetters({
      selectedMethod: 'selectedMethod'
    }),
    resultComponent () {
      return getMethodObj(this.selectedMethod).resultComponentName;
    },
    resultComponentProps(){
      return getMethodObj(this.selectedMethod).resultProps;
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