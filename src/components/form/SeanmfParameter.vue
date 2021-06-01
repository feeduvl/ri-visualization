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
    </v-layout>
    <v-layout row wrap>
      <v-flex xs10/>
      <v-btn small color="primary" :loading="loading" :disabled="loading" @click="startRun">Start</v-btn>
    </v-layout>
    <v-snackbar
        v-model="snackbar"
        :timeout="timeout"
        :top=true
    >
      {{ text }}

        <v-btn
            small
            color="primary"
            text
            @click="snackbar = false"
        >
          Close
        </v-btn>
    </v-snackbar>
  </v-form>
  </v-container>
</template>

<script>
export default {
  name: "SeanmfParameter",
  props: {
    dataset: String,
  },
  data: () => ({
    snackbar: false,
    loading: false,
    text: 'Run has been started successfully.',
    timeout: 2000,
    alpha: 0.1,
    beta: 0,
    n_topics: 10,
    max_iter: 500,
    max_err: 0.1,
    fix_random: false,
  }),
  methods: {
    startRun() {
      this.snackbar = true;
      this.blockButton();
      //this.reset();
    },
    reset () {
      this.$refs.form.reset()
    },
    blockButton() {
      this.loading = true;
      setTimeout(() => {  this.loading = false; }, 1500);
    },
  }
}
</script>

<style scoped>

</style>