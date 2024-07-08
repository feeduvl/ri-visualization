<template>
    <v-container>
        <v-form ref="form" v-model="formValid">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-checkbox 
                    v-model="dataset_persist" 
                    :label="`Create new Dataset based on ${this.$props.dataset}`">
                </v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs4>
                    <v-text-field 
                        v-model="new_dataset_name" 
                        label="Enter a unique Dataset Name"
                        :rules="[new_dataset_name => !new_dataset_name || !datasets.includes(new_dataset_name) || 'Dataset Name is already in use.']"
                        :disabled="!dataset_persist">
                    </v-text-field>
                </v-flex>
            </v-layout>
            <v-layout row wrap>
                <v-flex xs3>
                    <v-checkbox v-model="persist" :label="`Create new Annotation for ${this.$props.dataset}`"></v-checkbox>
                </v-flex>
                <v-flex xs1 />
                <v-flex xs4>
                    <v-text-field 
                        v-model="new_annotation_name" 
                        label="Enter a unique Annotation Name" 
                        :rules="[new_annotation_name => !new_annotation_name || !$store.state.available_annotations.filter(a => a.name === new_annotation_name).length > 0 || 'Annotation Name is already in use.']"
                        :disabled="!persist">
                    </v-text-field>
                </v-flex>
            </v-layout>
            <v-flex xs3>
                    <v-text-field v-model="run_name" hint="Optional string to name this run." label="Run Name"
                        persistent-hint></v-text-field>
                </v-flex>
            <v-layout row wrap>
                <v-flex xs9 />
                <v-btn small color="primary" @click="resetForm">Reset</v-btn>
                <v-btn small color="primary" :loading="loading" :disabled="loading" @click="startRun">Create</v-btn>
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
import { POST_START_RELEVANCE_CLASSIFICATION_ENDPOINT } from "@/RESTconf";
import { SNACKBAR_DISPLAY_TIME } from "@/theme";
import { mapGetters } from 'vuex';
import {loadDatasets} from "@/RESTcalls";

export default {
    name: "RelevanceClassifierParameter",
    props: {
        dataset: String,
    },
    data: () => ({
        method: "relevance-classifier",
        snackbarVisible: false,
        loading: false,
        snackbarText: "",
        snackbarTimeout: SNACKBAR_DISPLAY_TIME,
        formValid: true,
        persist: false,
        dataset_persist: false,
        new_annotation_name: "",
        new_dataset_name: "",
        relevance_classification_conf: "",
        run_name: ""
    }),
    computed: {
    ...mapGetters(['datasets'])
    },
    methods: {
        async startRun() {
            if (!(this.validateDatasetInput())) {
                this.displaySnackbar("Please select a dataset!");
            } else if (!(this.formValid)) {
                this.displaySnackbar("Please validate your parameter inputs!");
            } else if (!(this.persist) && !(this.dataset_persist)){
                this.displaySnackbar("Please select a dataset and/or annotation creation!");
            } else if ((this.persist) && (this.new_annotation_name === "") || (this.dataset_persist) && (this.new_dataset_name === "")){
                this.displaySnackbar("Please enter a creation name!");
            }
            else {
                this.loading = true;
                axios.post(POST_START_RELEVANCE_CLASSIFICATION_ENDPOINT, this.getFormData()
                ).then(response => {
                    console.log("relevance classifier response: ", response)
                    if (response.status > 200 || response.status < 300) {
                        this.displaySnackbar(response.data.message);
                        this.reloadFields();
                        this.resetForm();
                        this.loading = false;
                    } else {
                        this.displaySnackbar("Error starting creation!");
                        this.loading = false;
                    }
                }).catch(() => {
                    this.displaySnackbar("Could not contact backend!");
                    this.loading = false;
                    console.log(this.getFormData());
                });
                
                //if (((this.persist) && !(this.dataset_persist))) {
                //    this.$router.push("/annotation");
                //} else if ((!(this.persist) && (this.dataset_persist)) || ((this.persist) && (this.dataset_persist))) {
                //    this.$router.push("/dataset");
                //}
            }
        },
        reloadFields(){
                this.$store.dispatch("actionGetAllRelationships")
                this.$store.dispatch("actionGetAllTores")
                this.$store.dispatch("actionLoadResults")
                this.$store.dispatch("actionGetAllAnnotations")
                loadDatasets(this.$store);
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
            if (this.persist && !this.dataset_persist) {
                this.relevance_classification_conf = "OnlyAnnotation"
            } else if (!this.persist && this.dataset_persist) {
                this.relevance_classification_conf = "OnlyDataset"
            } else if (this.persist && this.dataset_persist) {
                this.relevance_classification_conf = "AnnotationAndDataset"
            }
            
            let params = {
                run_name: this.run_name,
                method: this.method,
                original_dataset_name: this.$props.dataset,
                persist: this.persist,
                dataset_persist: this.dataset_persist,
                new_annotation_name: this.new_annotation_name,
                new_dataset_name: this.new_dataset_name,
                relevance_classification_conf: this.relevance_classification_conf,
            };
            return JSON.stringify(params);
        },
        validateDatasetInput() {
            return this.$props.dataset !== "";
        },
        resetForm() {
            this.run_name = "",
            this.persist = false;
            this.dataset_persist = false;
            this.new_annotation_name = "";
            this.new_dataset_name = "";
        },
    },
}
</script>

<style scoped></style>