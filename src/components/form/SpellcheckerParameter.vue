<template>
    <v-container>
        <v-form ref="form" v-model="formValid">
            <v-layout row wrap>
                <v-flex xs3>
                    <v-checkbox 
                    v-model="dataset_persist" 
                    :label="`Create new spellchecked dataset based on: ${this.$props.dataset}`">
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
            <v-flex xs3>
                    <v-text-field v-model="run_name" hint="Optional string to name this run." label="Run Name"
                        persistent-hint></v-text-field>
                </v-flex>
            <v-layout row wrap>
                <v-flex xs9 />
                <v-btn small color="primary" @click="resetForm">Reset</v-btn>
                <v-btn small color="primary" :loading="loading" :disabled="loading" @click="startRun">Check</v-btn>
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
import { POST_START_SPELLCHECKER_ENDPOINT } from "@/RESTconf";
import { SNACKBAR_DISPLAY_TIME } from "@/theme";
import { mapGetters } from 'vuex';
import {loadDatasets} from "@/RESTcalls";

export default {
    name: "SpellcheckerParameter",
    props: {
        dataset: String,
    },
    data: () => ({
        method: "spellchecker",
        snackbarVisible: false,
        loading: false,
        snackbarText: "",
        snackbarTimeout: SNACKBAR_DISPLAY_TIME,
        formValid: true,
        dataset_persist: false,
        new_annotation_name: "",
        new_dataset_name: "",
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
            } else if (!(this.dataset_persist)){
                this.displaySnackbar("Please select dataset creation!");
            } else if ((this.dataset_persist) && (this.new_dataset_name === "")){
                this.displaySnackbar("Please enter a dataset creation name!");
            }
            else {
                this.loading = true;
                console.log(this.getFormData());
                axios.post(POST_START_SPELLCHECKER_ENDPOINT, this.getFormData()
                ).then(response => {
                    console.log("Spellchecker response: ", response)
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
            }
        },
        reloadFields(){
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
            let params = {
                run_name: this.run_name,
                method: this.method,
                original_dataset_name: this.$props.dataset,
                new_dataset_name: this.new_dataset_name,
            };
            return JSON.stringify(params);
        },
        validateDatasetInput() {
            return this.$props.dataset !== "";
        },
        resetForm() {
            this.run_name = "",
            this.dataset_persist = false;
            this.new_dataset_name = "";
        },
    },
}
</script>

<style scoped></style>