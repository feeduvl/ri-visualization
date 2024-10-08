<template>
    <v-container class="bert-container">
        <v-form ref="form" v-model="formValid">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-select v-model="chainedMethodSelect" :items="chainableMethods" 
                        item-text="displayName" item-value="name" label="Classification Methods">
                    </v-select>
                </v-flex>
            </v-layout>

            <v-snackbar v-model="snackbarVisible" :timeout="snackbarTimeout" :top=true>
                {{ snackbarText }}

                <v-btn small color="primary" text @click="closeSnackbar">
                    Close
                </v-btn>
            </v-snackbar>
        </v-form>
    </v-container>
</template>

<script>
import axios from "axios";
import { POST_START_MULTIDETECTION_ENDPOINT } from "@/RESTconf";
import { SNACKBAR_DISPLAY_TIME } from "@/theme";
import { CHAINABLE_METHODS } from "@/methods";

export default {
    name: "BERTParameter",
    props: {
        dataset: String,
    },
    data: () => ({
        method: "bert",
        snackbarVisible: false,
        loading: false,
        snackbarText: "",
        snackbarTimeout: SNACKBAR_DISPLAY_TIME,
        debug: false,
        run_name: "",
        formValid: true,
        persist: false,
        chainableMethods: CHAINABLE_METHODS,
        annotation_name: "",
    }),
    computed: {
        chainedMethodSelect: {
            get() {
                return this.method
            },
            set(newValue) {
                this.method = newValue
            }
        }
    },
    methods: {
        async startRun() {
            this.$store.commit('setClassifierDetail', this.method)
            if (!(this.validateDatasetInput())) {
                this.displaySnackbar("Please select a dataset!");
            } else if (!(this.formValid)) {
                this.displaySnackbar("Please validate your parameter inputs!");
            } else {
                this.loading = false;
              this.displaySnackbar("Starting Run.");
              axios.post(POST_START_MULTIDETECTION_ENDPOINT, this.getFormData()
                ).then(response => {
                    if (response.status > 200 || response.status < 300) {
                        this.displaySnackbar("Run has been finished successfully.");
                      this.$store.dispatch("actionLoadResults")
                      this.$store.dispatch("actionGetAllAnnotations")
                    } else {
                        this.displaySnackbar("Error finishing run!");
                    }
                }).catch(() => {
                    this.displaySnackbar("Could not contact backend!");
                    console.log(this.getFormData());
                });
                this.blockButton();
            }
        },
        blockButton() {
            this.loading = true;
            setTimeout(() => { this.loading = false; }, 1600);
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
                dataset: this.$props.dataset.join('#!#'),
                debug: false,
                persist: true,
                name: this.$store.state.currentDashboardName,
                annotation_name: this.$store.state.currentDashboardName,
            };
            return JSON.stringify(params);
        },
        validateDatasetInput() {
            return this.$props.dataset !== "";
        },
        resetForm() {
            this.method = "";
            this.debug = false;
            this.persist = false;
            this.run_name = "";
            this.annotation_name = "";
        },
    },
}
</script>

<style scoped>
.bert-container{
  padding-left: 0;
}
</style>