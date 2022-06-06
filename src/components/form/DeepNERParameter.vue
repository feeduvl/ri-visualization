<template>
    <v-container>
        <v-form
            ref="form"
            v-model="formValid">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-checkbox
                        v-model="debug"
                        :label="`Include debug information`"
                    ></v-checkbox>
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
import axios from "axios";
import {POST_START_DETECTION_ENDPOINT} from "@/RESTconf";
import {SNACKBAR_DISPLAY_TIME} from "@/theme";
export default {
    name: "DeepNERParameter",
    props: {
        dataset: String,
    },
    data: () => ({
        method: "deep-ner",
        snackbarVisible: false,
        loading: false,
        snackbarText: "",
        snackbarTimeout: SNACKBAR_DISPLAY_TIME,
        debug: false,
        run_name: "",
        formValid: true,
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
                debug: this.debug,
                name: this.run_name,
            };
            return JSON.stringify(params);
        },
        validateDatasetInput() {
            return this.$props.dataset !== "";
        },
        resetForm() {
            this.debug = false;
            this.run_name = "";
        },
    },
}
</script>

<style scoped>

</style>