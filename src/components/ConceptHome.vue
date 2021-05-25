<template>
  <v-container>
    <v-layout row class="spacing">
      <component v-bind:is="component" v-bind:dataset="selectedMethod"/>
    </v-layout>
    <v-card>
      <v-container>
        <v-layout row wrap>
          <v-flex xs3>
            <v-select
                v-model="selectedConcept"
                :items="resultConcepts"
                label="Select Concept"
                @change="updateConcept"
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
            <span v-for="word in concept.words" :key="word">{{ word }}, </span>
          </v-flex>
          <v-flex xs1/>
          <v-flex xs2>
            <v-text-field
                v-model="concept_name"
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
export default {
  name: "ConceptHome",
  components: {
    "uvl-filter-toolbar": () => import("./toolbar/UvlFilterToolbar"),
  },
  data() {
    return {
      component: "uvl-filter-toolbar",
      selectedConcept: [],
      resultConcepts: [],
      concept: {
        words: ["Test", "Test2"],
      },
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
  methods: {},
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