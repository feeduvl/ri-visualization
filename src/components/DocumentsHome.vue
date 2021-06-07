<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component" v-bind:selectedMethod="selectedMethod" v-bind:selectedResult="selectedResult"
                 v-bind:methods="methods" v-bind:results="results"/>
    </v-layout>
    <v-card>
      <v-layout row>
        <v-flex xs6>
          <v-card flat class="header">
            <v-card-title>
              <h2>Document</h2>
            </v-card-title>
          </v-card>
        </v-flex>
        <v-flex xs4>
          <v-card flat class="header">
            <v-card-title>
              <h2>Related Topcis</h2>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout row v-for="item in documents" :key="item.number">
        <v-flex xs1 class="small"/>
        <v-flex xs1 class="small">{{ item.number }}</v-flex>
        <v-flex xs5>{{ item.content }}</v-flex>
        <v-flex xs5>
          <ul>
            <li v-for="topic in item.topics" :key="topic.number">
              Topic {{ topic.number }} ({{ topic.name }}): <span v-for="word in topic.words" :key="word">{{
                word
              }}, </span><span class="space-left"> {{ topic.probability * 100 }}%</span>
            </li>
          </ul>
        </v-flex>
      </v-layout>
    </v-card>
  </v-container>
</template>

<script>

import {GET_ALL_RESULTS_ENDPOINT, GET_DATASET_ENDPOINT} from "@/RESTconf";
import axios from "axios";

export default {
  name: "DocumentsHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
  },
  data: function () {
    return {
      component: "uvl-filter-toolbar",
      selected_method: {},
      selected_result: {},
      methods: ["LDA", "SeaNMF"],
      documents: [],
      results: [],
      //documents: [ { number: 1,
      //content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, ", topics:
      //      [{number: 1, name: "", words: ["test", "text", "more"], probability: 0.97},{number: 2, name: "misc", words: ["another", "topic"], probability: 0.23}] },{ number: 2, content: "Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov lingua franca: On refusa continuar payar custosi traductores. At solmen va esser necessi far uniform grammatica, pronunciation e plu sommun paroles. Ma quande lingues coalesce, li grammatica del resultant lingue es plu simplic e regulari quam ti del coalescent lingues. Li nov lingua franca va esser plu simplic e regulari quam li existent Europan ", topics: [{number: 1, name: "blindtext", words: ["lorem", "omnicros", "more"]},{number: 2, name: "misc", words: ["another", "topic"]}]}],
    };
  },
  methods: {
    async getAllResults() {
      axios.get(GET_ALL_RESULTS_ENDPOINT)
          .then(response => {
            // DEBUG
            console.log(response.data);
            this.results = response.data;
          })
          .catch(e => {
            this.errors.push(e);
            // DEBUG
            console.log(this.errors)
          });
    },
    async loadDataset() {
      axios
          .get(GET_DATASET_ENDPOINT(this.selected_result["dataset_name"]))
          .then(response => {
            this.documents = response.data;
          })
          .catch(e => {
            this.errors.push(e);
          });
    },
  },
  mounted() {
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