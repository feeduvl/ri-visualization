<template>
    <v-card>
        <!--- Display General Infos -->
        <v-card-title>
            <h2>Method Parameter</h2>
        </v-card-title>

        <v-layout row wrap id="parameter_layout">
            <v-card elevation="0" class="param_holder">
                <v-card-title class="param_header">
                    <span class="grey--text text-uppercase">Run Name</span>
                </v-card-title>
                <v-card-text class="param_content">
                    {{ displayRunName(selectedResult.name) }}
                </v-card-text>
                </v-card>
                <v-card elevation="0" class="param_holder">
                    <v-card-title class="param_header">
                        <span class="grey--text text-uppercase">Dataset</span>
                    </v-card-title>
                    <v-card-text class="param_content">
                        {{ displayDatasetName(selectedResult.dataset_name) }}
                    </v-card-text>
                </v-card>
                <v-card elevation="0" class="param_holder">
                    <v-card-title class="param_header">
                        <span class="grey--text text-uppercase">Run Date</span>
                    </v-card-title>
                    <v-card-text class="param_content">
                        {{ displayRunDate() }}
                    </v-card-text>
                </v-card>
                <template v-for="(item, key) in selectedResult.params">
                    <v-card elevation="0" class="param_holder">
                        <v-card-title class="param_header">
                        <span class="grey--text text-uppercase">{{ key }}</span>
                    </v-card-title>
                        <v-card-text class="param_content">
                            {{ item }}
                        </v-card-text>
                    </v-card>
                </template>
        </v-layout>

       <!--- Display Table that contains datasets -->
        <v-container v-if="Object.keys(selectedResult).length !== 0">
            <v-card-title>
                <h2>Dataset Comparison</h2>
            </v-card-title>
            <v-data-table
                :headers="headersDatasetComparison"
                :items="combinedData"
                :pagination.sync="pagination"
            >
            <template slot="items" slot-scope="props">
            <tr>
                <td>{{ props.item.id }}</td>
                <td style="background-color: lightgrey;"> <!--- white-space: pre-wrap; -->
                    <div v-html="props.item.originalText"></div>
                </td>
                <td style="background-color: lightyellow;"> <!--- white-space: pre-wrap; -->
                    <div v-html="props.item.adjustedText"></div>
                </td>
            </tr>
            </template>
            </v-data-table>
      </v-container>
    </v-card>
</template>

<script>
import axios from "axios";
import {mapGetters} from "vuex";
import { diffWords } from 'diff';
import {
  GET_DATASET_ENDPOINT
} from "@/RESTconf";

export default {
    name: "SpellcheckerResult",
    computed: {
        ...mapGetters({
            selectedResult: 'selectedResult'
        }),
    },

    data() {
        return {
            originalData: [],
            adjustedData: [],
            combinedData: [],
            pagination: {
                sortBy: "number",
                descending: false,
                rowsPerPage: 25,
            },
            loadingOriginalData: false,
            loadingAdjustedData: false,

            headersDatasetComparison: [
                {
                text: "ID",
                align: "center",
                sortable: true,
                value: "id",
                width: "10%"
                },
                {
                text: "Original Text",
                align: "left",
                sortable: false,
                value: "text",
                width: "45%"
                }, 

                {
                text: "Adjusted Text by Spellchecker",
                align: "left",
                sortable: false,
                value: "text",
                width: "45%"
                },  

            
            ],
        };
    },

    created() {
        if (Object.keys(this.selectedResult).length !== 0 && this.selectedResult.params) {
            this.checkSelectedResult();
        }
    },

    watch: {
    selectedResult(newValue) {
            if (Object.keys(newValue).length !== 0) {
                this.checkSelectedResult();
            }
        }
    },

    methods: {

        checkSelectedResult() {
            this.loadAndCombineDatasets();
        },

        async loadOriginalDataset() {
            console.log("datasetName: ", this.selectedResult.dataset_name)
            this.originalData = []
            this.loadingOriginalData = true;
            try {
                const response = await axios.get(GET_DATASET_ENDPOINT(this.selectedResult.dataset_name));
                console.log("response original data: ", response.data);
                this.setOriginalDataset(response.data);
            } catch (e) {
                this.errors.push(e);
            } finally {
                this.loadingOriginalData = false;
            }
        },

        async loadAdjustedDataset() {
            console.log("datasetName: ", this.selectedResult.params.new_dataset_name)
            this.adjustedData = [];
            this.loadingAdjustedData = true;
            try {
                const response = await axios.get(GET_DATASET_ENDPOINT(this.selectedResult.params.new_dataset_name));
                console.log("response adjusted data: ", response.data);
                this.setAdjustedDataset(response.data);
            } catch (e) {
                this.errors.push(e);
            } finally {
                this.loadingAdjustedData = false;
            }
        },

        setOriginalDataset(responseData) {
            let documents = []
            for (let index in responseData["documents"]) {
                let document = responseData["documents"][index];
                let t = document.text;
                let d = { originalText: t,
                    number: document.number,
                    id: document.id};
                documents.push(d);
            }
            this.originalData = documents;
            console.log("this.originalData: ", this.originalData);
            return documents
        },

        setAdjustedDataset(responseData) {
            let documents = []
            for (let index in responseData["documents"]) {
                let document = responseData["documents"][index];
                let t = document.text;
                let d = { adjustedText: t,
                    number: document.number,
                    id: document.id};
                documents.push(d);
            }
            this.adjustedData = documents;
            console.log("this.adjustedData: ", this.adjustedData);
            return documents
        },

        highlightDifferences(originalText, adjustedText) {
            const diff = diffWords(originalText, adjustedText);
            let highlightedOriginalText = '';
            let highlightedAdjustedText = '';

            diff.forEach(part => {
                if (part.added) {
                    highlightedAdjustedText += `<span style="background-color: green">${part.value}</span>`;
                } else if (part.removed) {
                    highlightedOriginalText += `<span style="background-color: red">${part.value}</span>`;
                } else {
                    highlightedOriginalText += part.value;
                    highlightedAdjustedText += part.value;
                }
            });

            return { highlightedOriginalText, highlightedAdjustedText };
        },

        combineDatasets() {
            this.combinedData = this.originalData.map(originalItem => {
                const adjustedItem = this.adjustedData.find(adjustedItem => adjustedItem.id === originalItem.id);
                if (adjustedItem) {
                    const { highlightedOriginalText, highlightedAdjustedText } = this.highlightDifferences(originalItem.originalText, adjustedItem.adjustedText);
                    return {
                        id: originalItem.id,
                        originalText: highlightedOriginalText, 
                        adjustedText: highlightedAdjustedText
                    };
                } else {
                return {
                    id: originalItem.id,
                    originalText: originalItem.originalText,
                    adjustedText: ''
                };
                }
            });
        },

        async loadAndCombineDatasets() {
            try {
                await this.loadOriginalDataset();
                await this.loadAdjustedDataset();
                if (this.loadingOriginalData === false && this.loadingAdjustedData === false){
                    this.combineDatasets();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },

        resetTable() {
        this.originalData = [];
        this.adjustedData = [];
        },

        displayRunName(name) {
            if (name === "" || name === undefined) {
                return "–";
            } else {
                return name;
            }
        },
        displayDatasetName(dataset_name) {
            if (dataset_name === "" || dataset_name === undefined) {
                return "–";
            } else {
                return dataset_name;
            }
        },
        displayRunDate() {
            if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
                return this.selectedResult.started_at.replace("Z", "").replace("T", " ").substring(0, 19);
            } else {
                return "–";
            }
        },
    },
}
</script>

<style scoped>

.param_content {
  padding-top: 0;
  padding-left: 25px;
  font-weight: 500;
  font-size: 16px;
}

.param_header {
  padding-bottom: 5px;
}

.param_holder {
  min-width: 360px;
}

</style>