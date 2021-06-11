<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component" v-bind:methods="methods" v-bind:results="results"/>
    </v-layout>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs3>
            <v-select
                v-model="selectedConcept"
                :items="resultConcepts"
                label="Select Concept"
                @change="updateContent"
                max-width="200px"
            >
            </v-select>
          </v-flex>
        </v-layout>
      </v-container>
      <v-divider/>
      <v-container>
        <v-layout row wrap>
          <v-flex xs7>
            <h3>Concept Words:</h3>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs4>
            <h3>Concept Name:</h3>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs7>
            <span v-for="word in conceptWords" :key="word">{{ word }}, </span>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs2>
            <v-text-field
                v-model="conceptName"
                label="Concept Name"
                clearable>
            </v-text-field>
          </v-flex>
          <v-flex xs1>
            <v-btn small color="primary" @click="updateConcept">Update</v-btn>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs7>
            <h3>Related Documents:</h3>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs2>
            <h3>Probability:</h3>
          </v-flex>
        </v-layout>
        <ul>
          <li v-for="document in documents" :key="document.number">
            <v-layout row wrap>
              <v-flex xs7>
                {{ document.text }}
              </v-flex>
              <v-flex xs1/>
              <v-flex xs2>
                {{ document.probability * 100 }} %
              </v-flex>
          </v-layout>
          </li>
        </ul>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "ConceptHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
  },
  computed: {
    ...mapGetters({
      results: 'results',
      dataset: 'selectedDataset',
      selectedResult: 'selectedResult'
    }),
    conceptWords() {
      let words = [];
      if (this.selectedResult["topics"] === undefined) {
        return words;
      } else {
        for (const word in this.selectedResult['topics'][this.selectedConcept[1]]) {
          words.push(word);
        }
      }
    },
    resultConcepts() {
      let concepts = [];
      let conceptName = "";
      if (this.selectedResult["topics"] === undefined) {
        return concepts;
      } else {
        for (const c of this.selectedResult["topics"]) {
          try {
            conceptName = c[2];
          } catch {
            conceptName = "";
          }
          try {
            concepts.push({text: "Concept " + c[0] + " " + conceptName, value: c[0]});
          } catch {
            return concepts;
          }
        }
        return concepts;
      }
    },
  },
  data() {
    return {
      component: "uvl-filter-toolbar",
      methods: [],
      selectedConcept: {},
      conceptName: "",
      concept: {
        words: ["Test", "Test2"],
      },
      // documents: {},
      documents: [
        {
          number: 1,
        text: "Lorem ipisum Lorem ipisum Lorem ipisum Lorem ipisum Lorem ipisum",
        probability: 0.97,
        },
        {
          number: 2,
          text: "Test Text",
          probability: 0.23,
        },
        {
          number: 3,
          text: "Master thesis Feeduvl",
          probability: 0.17,
        }
      ],
    }
  },
  methods: {
    updateConcept() {

    },
    updateContent() {

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