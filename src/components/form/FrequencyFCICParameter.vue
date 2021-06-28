<template>
    <v-container>
        <v-form
                ref="form">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-text-field
                            v-model="max_num_concepts"
                            :messages="['How many concepts should be found by the algorithm. Default: 20']"
                            label="Max. Num. Concepts"
                            clearable
                    ></v-text-field>
                </v-flex>

                <v-flex>
                    <v-text-field
                            v-model="run_name"
                            hint="Optional string to name this run."
                            label="Run Name"
                            clearable
                            persistent-hint
                    ></v-text-field>
                </v-flex>
                <v-flex xs1/>
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
        name: "FrequencyRBAIParameter",
        props: {
            dataset: String,
        },
        data: () => ({
            method: "frequency-rbai",
            snackbarVisible: false,
            loading: false,
            snackbarText: "",
            snackbarTimeout: 1500,
            max_num_concepts: 20,
            run_name: "",
            fix_random: false,
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
                }).catch( (e) => {
                    this.displaySnackbar("Could not contact backend!");
                    console.error("FrequencyFCICParameter::startRun got error: "+e);
                    console.error("FrequencyFCICParameter::startRun Form data: "+this.getFormData());
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
                return JSON.stringify({
                    method: this.method,
                    dataset: this.$props.dataset,
                    max_num_concepts: this.max_num_concepts,
                    run_name: this.run_name,
                    term_length: 1,
                    command: "run_algorithm"
                });
            },
        },
    }
</script>

<style scoped>

</style>