<template>
  <v-container>
  <v-form
      ref="form">
    <v-layout row wrap>
      <v-flex xs3>
      <v-text-field
              v-model="alpha"
              :messages="['Must be between 0 and 1. Default: 0.1']"
              label="Alpha"
              clearable
          ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
          <v-text-field
              v-model="beta"
              :messages="['Must be between 0 and 1. Default: 0']"
              label="Beta"
              clearable
          ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
        <v-text-field
            v-model="n_topics"
            :messages="['Positive Integer. Default: 10']"
            label="Number of Topics"
            clearable
        ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
        <v-text-field
            v-model="max_iter"
            :messages="['Positive Integer. Default: 500']"
            label="Maximum Iterations"
            clearable
        ></v-text-field>
      </v-flex>
      <v-flex xs1/>
      <v-flex xs3>
        <v-text-field
            v-model="max_err"
            :messages="['Positive Float. Default: 0.1']"
            label="Stop Criterion"
            clearable
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
            :messages="['Integer. Default: 3']"
            label="Minimum Word Count"
            clearable
        ></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs10/>
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
    snackbarTimeout: 1500,
    alpha: 0.1,
    beta: 0,
    n_topics: 10,
    max_iter: 500,
    max_err: 0.1,
    fix_random: false,
    vocab_min_count: 3,
  }),
  methods: {
    async startRun() {
      this.loading = false;
      axios.post(POST_START_DETECTION_ENDPOINT, this.getFormData()
      ).then(response => {
        if (response.status > 200 || response.status < 300) {
          this.displaySnackbar("Run has been started successfully.");
        } else {
          this.displaySnackbar("Error starting run!!");
        }
      }).catch( () => {
        this.displaySnackbar("Could not contact backend!");
        console.log(this.getFormData());
      });
      this.blockButton();
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
      };
      return JSON.stringify(params);
    },
  },
}
</script>

<style scoped>

</style>