<template>
  <v-container>
  <v-form
      ref="form"
      v-model="formValid">
    <v-layout row wrap>
      <v-flex xs3>
      <v-text-field
              v-model="alpha"
              hint="Must be between 0 and 1. Default: 0.1"
              persistent-hint
              label="Alpha"
              :rules="alphaRules"
              clearable
          ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
          <v-text-field
              v-model="beta"
              hint="Must be between 0 and 1. Default: 0"
              label="Beta"
              clearable
              :rules="betaRules"
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
            v-model="max_iter"
            hint="Positive Integer. Default: 500"
            label="Maximum Iterations"
            :rules="maxIterRules"
            clearable
            persistent-hint
        ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
        <v-text-field
            v-model="max_err"
            hint="Positive Float. Default: 0.1"
            label="Stop Criterion"
            :rules="maxErrRules"
            clearable
            persistent-hint
        ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
      <v-checkbox
          v-model="fix_random"
          :label="`Fix Random Seed`"
      ></v-checkbox>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
        <v-text-field
            v-model="vocab_min_count"
            hint="Positive Integer. Default: 3"
            label="Minimum Word Count"
            :rules="vocabMinCountRules"
            clearable
            persistent-hint
        ></v-text-field>
      </v-flex>
      <v-flex xs1/>
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
      <v-btn small color="primary" :loading="loading" :disabled="loading" @click="resetForm">Reset</v-btn>
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
import axios from "axios";
import {POST_START_DETECTION_ENDPOINT} from "@/RESTconf";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
export default {
  name: "SeanmfParameter",
  props: {
    dataset: String,
  },
  data: () => ({
    method: "seanmf",
    snackbarVisible: false,
    loading: false,
    snackbarText: "",
    snackbarTimeout: SNACKBAR_DISPLAY_TIME,
    alpha: 0.1,
    beta: 0,
    n_topics: 10,
    max_iter: 500,
    max_err: 0.1,
    fix_random: false,
    vocab_min_count: 3,
    run_name: "",
    formValid: true,
    alphaRules: [
      v => !!v || 'Alpha is required',
      v => (v && v > 0 && v <= 1) || 'Must be > 0 and <= 1',
    ],
    betaRules: [
      v => (String(v) !== "null" && String(v) !== "") || 'Beta is required',
      v => (v >= 0 && v <= 1) || 'Must be between 0 and 1',
    ],
    nTopicsRules: [
      v => !!v || 'Number of Topics is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    maxIterRules: [
      v => !!v || 'Maximum Iterations is required',
      v => (v && v % 1 === 0) || 'Must be an integer',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    maxErrRules: [
      v => !!v || 'Stop Criterion is required',
      v => (v && v > 0) || 'Must be greater than 0',
    ],
    vocabMinCountRules: [
      v => !!v || 'Minimum Word Count is required',
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
        alpha: this.alpha,
        beta: this.beta,
        n_topics: this.n_topics,
        max_iter: this.max_iter,
        max_err: this.max_err,
        fix_random: this.fix_random,
        vocab_min_count: this.vocab_min_count,
        name: this.run_name,
      };
      return JSON.stringify(params);
    },
    validateDatasetInput() {
      return this.$props.dataset !== "";
    },
    resetForm() {
      this.alpha = 0.1;
      this.beta = 0;
      this.n_topics = 10;
      this.max_iter = 500;
      this.max_err = 0.1;
      this.fix_random = false;
      this.vocab_min_count = 3;
      this.run_name = "";
    },
  },
}
</script>

<style scoped>

</style>