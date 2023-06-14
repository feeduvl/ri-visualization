<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-card-text>
            <v-form v-model="valid" ref="form" @submit.prevent="sendCheckAccessKey">
              <v-text-field
                autofocus
                v-model="accessKey"
                prepend-icon="lock"
                name="password"
                label="Access Key"
                type="password"
                :rules="accessKeyRules"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :color="color"
              class="white--text"
              :disabled="!valid"
              @click="sendCheckAccessKey"
            >
              <v-spacer></v-spacer>
              <v-icon v-if="!waitingForResponse" left dark>send</v-icon>
              <v-progress-circular v-else color="white" indeterminate left></v-progress-circular>Send
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-snackbar v-model="errorSnackbar" :timeout="errorSnackbarTimeout" :top="true">
          Access Key does not exist
          <v-btn color="pink" flat @click="errorSnackbar = false">Close</v-btn>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import {
  POST_RETRIEVE_ACCESS_KEY_CONFIGURATION,
  POST_RETRIEVE_ACCESS_KEY_CONFIGURATION_PAYLOAD
} from "./../RESTconf.js";
import { BLUE_FILL } from "../colors.js";
import {
  ACTION_FETCH_INITIAL_DATA,
  MUTATE_LOGGED_IN,
  MUTATE_TWEETS,
  MUTATE_ACCESS_KEY,
  MUTATE_ACCESS_KEY_CONFIGURATION,
  MUTATE_TWITTER_ACCOUNTS,
  LOCAL_STORAGE_ACCESS_KEY,
  LOCAL_STORAGE_ACCESS_KEY_CONFIGURATION, ACTION_FETCH_INITIAL_CONCEPT_DATA
} from "../store/types.js";

import { ROUTE_DASHBOARD } from "../routes";
export default {
  name: "LoginHome",
  data() {
    return {
      color: BLUE_FILL,
      accessKey: "",
      accessKeyRules: [v => !!v || "required"],
      valid: false,
      waitingForResponse: false,
      /*
       * errors
       */
      errorSnackbar: false,
      errorSnackbarTimeout: 6000,
      errors: []
    };
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.valid = true;
      }
    },
    sendCheckAccessKey() {
      this.waitingForResponse = true;
      axios
        .post(
          POST_RETRIEVE_ACCESS_KEY_CONFIGURATION(),
          POST_RETRIEVE_ACCESS_KEY_CONFIGURATION_PAYLOAD(this.accessKey)
        )
        .then(response => {
          if (response.status == 200) {
            this.$store.commit(
              MUTATE_TWITTER_ACCOUNTS,
              response.data.twitter_accounts
            );
            this.$store.commit(MUTATE_ACCESS_KEY_CONFIGURATION, response.data);
            localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, this.accessKey);

            this.getInitialConceptsData();
            this.$store
              .dispatch(
                ACTION_FETCH_INITIAL_DATA,
                response.data.twitter_accounts
              )
              .then(
                response => {
                  this.waitingForResponse = false;
                  this.$store.commit(MUTATE_ACCESS_KEY, this.accessKey);
                  this.$router.push({ path: ROUTE_DASHBOARD });
                },
                error => {
                  this.waitingForResponse = false;
                  console.error(
                    "Got nothing from server. Prompt user to check internet connection and try again"
                  );
                }
              );
          } else {
            this.waitingForResponse = false;
            this.errorSnackbar = true;
            this.accessKey = "";
          }
        })
        .catch(e => {
          this.waitingForResponse = false;
          this.errorSnackbar = true;
          this.accessKey = "";
          this.errors.push(e);
        });
    },
    getInitialConceptsData() {
      this.$store
          .dispatch(
              ACTION_FETCH_INITIAL_CONCEPT_DATA,
          )
          .then(
              response => {
              },
              error => {
                console.error(
                    "Got nothing from server. Prompt user to check internet connection and try again"
                );
              }
          );
    }
  },
  mounted() {
    this.$store.dispatch(
      "Check Access and Load Configuration"
    );
    if (localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)) {
      this.accessKey = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY);
      this.sendCheckAccessKey();
    }
  }
};
</script>

<style scoped>
</style>
