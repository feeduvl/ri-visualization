<template>
    <v-container>
        <v-form ref="form" v-model="formValid">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-checkbox v-model="debug" :label="`Include debug information`"></v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-checkbox v-model="filterUSTopicsExcludeList"
                        :label="`Filter User Story concepts by exclusion list`"></v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-checkbox v-model="filterUSTopicsSimilarity"
                        :label="`Filter User Story concepts that are too similar`"></v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="filterUSTopicsSimilarityThreshold" hint="Float between 0 and 1"
                        label="User Story topics Similarity Threshold" clearable :rules="thresholdRulesFloat"
                        persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-checkbox v-model="filterUSTopicsCompositions"
                        :label="`Filter User Story concepts that are composed of other topics`"></v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="filterUSTopicsCompositionsMinLength" hint="Integer between 2 and 10"
                        label="User Story Composition minimum length Threshold" clearable :rules="thresholdRulesInt"
                        persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="OpenIEConfidence" hint="Float between 0 and 1"
                        label="OpenIE concept extraction confidence Threshold" clearable :rules="thresholdRulesFloat"
                        persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="wordnetAlpha" hint="Float between 0 and 1"
                        label="Similarity Score Wordnet-Weight vs. non-Wordnet words" clearable
                        :rules="thresholdRulesFloat" persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="wordnetDistanceThreshold" hint="Integer between 2 and 10"
                        label="Wordnet Distance Similarity Threshold" clearable :rules="thresholdRulesInt"
                        persistent-hint></v-text-field>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs3>
                    <v-text-field v-model="run_name" hint="Optional string to name this run." label="Run Name" clearable
                        persistent-hint @input="run_name = run_name || ''"></v-text-field>
                </v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs9 />
                <v-btn small color="primary" @click="resetForm">Reset</v-btn>
                <v-btn small color="primary" :loading="loading" :disabled="loading" @click="startRun">Start</v-btn>
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
import { SNACKBAR_DISPLAY_TIME } from "@/theme";
import axios from "axios";
import { POST_START_DETECTION_ENDPOINT } from "@/RESTconf";

export default {
    name: "AcceptanceCriteriaCompletenessParameter",
    props: {
        dataset: String,
    },
    data: () => ({
        method: "acceptance-criteria-completeness",
        snackbarVisible: false,
        loading: false,
        snackbarText: "",
        snackbarTimeout: SNACKBAR_DISPLAY_TIME,
        debug: false,
        filterUSTopicsExcludeList: true,
        filterUSTopicsSimilarity: false,
        filterUSTopicsSimilarityThreshold: 0.5,
        filterUSTopicsCompositions: false,
        filterUSTopicsCompositionsMinLength: 3,
        OpenIEConfidence: 0.5,
        wordnetAlpha: 0.8,
        wordnetDistanceThreshold: 5,
        run_name: "",
        formValid: true,
        thresholdRulesInt: [
            v => !!v || 'Threshold is required',
            v => (v && v > 1 && v < 11) || 'Must be greater between 2 and 10',
        ],
        thresholdRulesFloat: [
            v => !!v || 'Threshold is required',
            v => (v && v < 1 && v > 0) || 'Must be greater than 0 and smaller than 1',
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
                dataset: this.$props.dataset,
                debug: this.debug,
                filterUSTopicsExcludeList: this.filterUSTopicsExcludeList,
                filterUSTopicsSimilarity: this.filterUSTopicsSimilarity,
                filterUSTopicsSimilarityThreshold: this.filterUSTopicsSimilarityThreshold,
                filterUSTopicsCompositions: this.filterUSTopicsCompositions,
                filterUSTopicsCompositionsMinLength: this.filterUSTopicsCompositionsMinLength,
                OpenIEConfidence: this.OpenIEConfidence,
                wordnetAlpha: this.wordnetAlpha,
                wordnetDistanceThreshold: this.wordnetDistanceThreshold,
                name: this.run_name,
            };
            return JSON.stringify(params);
        },
        validateDatasetInput() {
            return this.$props.dataset !== "";
        },
        resetForm() {
            this.debug = false,
                this.filterUSTopicsExcludeList = true,
                this.filterUSTopicsSimilarity = false,
                this.filterUSTopicsSimilarityThreshold = 0.5,
                this.filterUSTopicsCompositions = false,
                this.filterUSTopicsCompositionsMinLength = 3,
                this.OpenIEConfidence = 0.5,
                this.wordnetAlpha = 0.8,
                this.wordnetDistanceThreshold = 5,
                this.run_name = "";
        },
    },
}
</script>
    
<style scoped>

</style>