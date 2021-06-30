<template>
  <v-container>
    <v-form
        ref="form"
        v-model="formValid">
      <v-layout row wrap>
        <v-flex xs3>
          <v-text-field
              v-model="chunksize"
              hint="Positive Integer. Default: 2000"
              persistent-hint
              label="Chunksize"
              :rules="chunksizeRules"
              clearable
          ></v-text-field>
        </v-flex>
        <v-flex xs1/>
        <v-flex xs3>
          <v-text-field
              v-model="passes"
              hint="Positive Integer. Default: 1"
              label="Passes"
              clearable
              :rules="passesRules"
              persistent-hint
          ></v-text-field>
        </v-flex>
        <v-flex xs1/>
        <v-flex xs3>
          <v-text-field
              v-model="n_topics"
              hint="Positive Integer. Default: 10"
              label="Number of Topics"
              :rules="nTopicsRules"
              clearable
              persistent-hint
          ></v-text-field>
        </v-flex>
        <v-flex xs1/>
        <v-flex xs3>
          <v-text-field
              v-model="iterations"
              hint="Positive Integer. Default: 500"
              label="Iterations"
              :rules="iterationsRules"
              clearable
              persistent-hint
          ></v-text-field>
        </v-flex>
        <v-flex xs1/>
        <v-flex xs3>
          <v-checkbox
              v-model="stemming"
              :label="`Enable Stemming`"
          ></v-checkbox>
        </v-flex>
        <v-flex xs1/>
        <v-flex xs3>
          <v-checkbox
              v-model="fix_random"
              :label="`Fix Random Seed`"
          ></v-checkbox>
        </v-flex>
        <v-flex xs3>
          <v-text-field
              v-model="run_name"
              hint="Optional string to name this run."
              label="Run Name"
              clearable
              persistent-hint
          ></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs9/>
        <v-btn small color="primary" @click="resetForm">Reset</v-btn>
        <v-btn small color="primary" :loading="loading" :disabled="loading" @click="startRun">Start</v-btn>
      </v-layout>
      <v-snackbar
          v-model="snackbarVisible"
          :timeout="snackbarTimeout"
          :top=true
      >
        {{ snackbarText }}

        <v-btn
            small
            color="primary"
            text
            @click="closeSnackbar"
        >
          Close
        </v-btn>
      </v-snackbar>
    </v-form>
  </v-container>
</template>

<script>
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
import axios from "axios";
import {POST_START_DETECTION_ENDPOINT} from "@/RESTconf";

export default {
  name: "LdaParameter",
  props: {
    dataset: String,
  },
  data: () => ({
    method: "lda",
    snackbarVisible: false,
    loading: false,
    snackbarText: "",
    snackbarTimeout: SNACKBAR_DISPLAY_TIME,
    chunksize: 2000,
    passes: 1,
    n_topics: 10,
    iterations: 500,
    stemming: false,
    fix_random: false,
    run_name: "",
    formValid: true,
    chunksizeRules: [
      v => !!v || 'Chunksize is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    passesRules: [
      v => !!v || 'Number of Passes is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    nTopicsRules: [
      v => !!v || 'Number of Topics is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    iterationsRules: [
      v => !!v || 'Iterations is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
  }),
  methods: {
    async startRun() {
      if (!(this.validateDatasetInput())) {
        this.displaySnackbar("Please select a dataset!");
      } else if (!(this.formValid)) {
        this.displaySnackbar("Please validate your parameter inputs!");
      } else {
        this.loading = false;
        axios.post(POST_START_DETECTION_ENDPOINT, this.getFormData()
        ).then(response => {
          if (response.status > 200 || response.status < 300) {
            this.displaySnackbar("Run has been started successfully.");
          } else {
            this.displaySnackbar("Error starting run!");
          }
        }).catch( () => {
          this.displaySnackbar("Could not contact backend!");
          console.log(this.getFormData());
        });
        this.blockButton();
      }
    },
    reset () {
      this.$refs.form.reset()
    },
    blockButton() {
      this.loading = true;
      setTimeout(() => {  this.loading = false; }, 1600);
    },
    displaySnackbar(message) {
      this.snackbarText = message;
      this.snackbarVisible = true;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
    },
    getFormData() {
      let params = {
        method: this.method,
        dataset: this.$props.dataset,
        chunksize: this.chunksize,
        passes: this.passes,
        n_topics: this.n_topics,
        iterations: this.iterations,
        stemming: this.stemming,
        fix_random: this.fix_random,
        name: this.run_name,
      };
      return JSON.stringify(params);
    },
    validateDatasetInput() {
      return this.$props.dataset !== "";
    },
    resetForm() {
      this.chunksize = 2000;
      this.passes = 1;
      this.n_topics = 10;
      this.iterations = 500;
      this.stemming = false;
      this.fix_random = false;
      this.run_name = "";
    },
  },
}
</script>

<style scoped>

</style>