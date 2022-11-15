<template>
    <v-layout row wrap>
        <v-flex xs12>
            <v-card id="parameter_holder">
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
                    <template>
                        <v-card v-for="(item, key) in selectedResult.params" :key="key" elevation="0"
                            class="param_holder">
                            <v-card-title class="param_header">
                                <span class="grey--text text-uppercase">{{ key }}</span>
                            </v-card-title>
                            <v-card-text class="param_content">
                                {{ item }}
                            </v-card-text>
                        </v-card>
                    </template>
                    <template>
                        <v-card v-for="(item, key) in selectedResult.metrics" :key="key" elevation="0"
                            class="param_holder">
                            <v-card-title class="param_header">
                                <span class="grey--text text-uppercase">{{ key }}</span>
                            </v-card-title>
                            <v-card-text class="param_content">
                                {{ item }}
                            </v-card-text>
                        </v-card>
                    </template>
                </v-layout>
            </v-card>
        </v-flex>
        <v-flex>
            <v-card>
                <v-layout row wrap>
                    <v-flex xs3>
                        <v-text-field v-model="comparisonThreshold" hint="Float between 0 and 1"
                            label="Threshold to calculate performance" clearable :rules="thresholdRulesFloat"
                            persistent-hint></v-text-field>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>
        <v-flex xs12 id="similar-us-groundtruth-comparison-holder">
            <groundtruth-comparison-ac-completeness v-bind:comparisonThreshold="comparisonThreshold" v-bind:result="tableResults" v-bind:groundtruth="groundtruth" />
        </v-flex>
        <v-flex xs12>
            <v-card id="ac-completeness-result-table">
                <v-card-title>
                    <h3>Similarity Results</h3>
                </v-card-title>
                <v-data-table :headers="tableHeaders" :items="tableResults" class="elevation-1" id="resultTable"
                    :rowsPerPageItems="[5, 10, 25, 50, 100, { 'text': '$vuetify.dataIterator.rowsPerPageAll', 'value': -1 }]"
                    :pagination.sync="pagination" :loading="loadingResults">
                    <template slot="items" slot-scope="props">
                        <tr>
                            <td>{{ props.item.id }}</td>
                            <td>{{ props.item.user_story_text }}</td>
                            <td>{{ props.item.acceptance_criteria_text }}</td>
                            <td>{{ props.item.user_story_topics }}</td>
                            <td>{{ props.item.acceptance_criteria_topics }}</td>
                            <td>{{ props.item.mapping }}</td>
                            <td>{{ props.item.completeness }}</td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card>
        </v-flex>
        <v-flex xs12>
            <v-card id="Download_Data">
                <v-card-title>
                    <h2>Download Result</h2>
                    <v-spacer />
                    <v-btn small color="primary" @click="downloadResult" class="btnAlign">
                        Download
                    </v-btn>
                </v-card-title>
                <v-layout row wrap id="parameter_layout">
                </v-layout>
            </v-card>
        </v-flex>
    </v-layout>
</template>
  
<script>
import { mapGetters } from "vuex";

export default {
    name: "UserStorySimilarityResult",
    watch: {},
    computed: {
        ...mapGetters({
            loadingResults: 'loadingResults',
            selectedResult: 'selectedResult',
            selectedDataset: 'selectedDataset',
        }),
        tableResults() {
            if (this.selectedResult.topics) {
                return this.selectedResult.topics.completeness_results;
            }
            return []
        },
        comparisonThreshold() {
            if (!this.comparisonThreshold) {
                return 0.1;
            }
            return this.comparisonThreshold;
        },
        groundtruth() {
            if (!this.selectedDataset.ground_truth) {
                return []
            }
            return this.selectedDataset.ground_truth;
        },
    },
    components: { "groundtruth-comparison-ac-completeness": () => import("@/components/widget/table/GroundtruthComparisonACCompleteness"), },
    data: function () {
        return {
            errors: [],
            comparisonThreshold: 0.1,
            tableHeaders: [
                {
                    text: "ID",
                    align: "left",
                    sortable: true,
                    value: "id"
                },
                {
                    text: "User Story",
                    align: "left",
                    sortable: false,
                    value: "user_story_text"
                },
                {
                    text: "Acceptance Criteria",
                    align: "left",
                    sortable: false,
                    value: "acceptance_criteria_text"
                },
                {
                    text: "User Story Concepts",
                    align: "left",
                    sortable: true,
                    value: "user_story_topics"
                },
                {
                    text: "AC Concepts",
                    align: "left",
                    sortable: false,
                    value: "acceptance_criteria_topics"
                },
                {
                    text: "Mapping",
                    align: "left",
                    sortable: false,
                    value: "mapping"
                },
                {
                    text: "Completeness",
                    align: "left",
                    sortable: true,
                    value: "completeness",
                },
            ],
            pagination: {
                descending: false,
                rowsPerPage: 25
            },
            thresholdRulesFloat: [
                v => !!v || 'Threshold is required',
                v => (v && v < 1 && v > 0) || 'Must be greater than 0 and smaller than 1',
            ],
        }
    },
    methods: {
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
        downloadResult() {
            if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
                const data = JSON.stringify(this.selectedResult);
                const blob = new Blob([data], { type: 'text/plain' });
                const e = document.createEvent('MouseEvents'),
                    a = document.createElement('a');
                a.download = this.getNameForFile();
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
            } else {
            }
        },
        getNameForFile() {
            let name = "";
            if (this.selectedResult.name === "") {
                name = this.selectedResult.method;
            } else {
                name = this.selectedResult.name;
            }
            return name + "–" + this.selectedResult.started_at.replace(":", "-") + ".json";
        },
        displayRunDate() {
            if (JSON.stringify(this.selectedResult) !== JSON.stringify({})) {
                return this.selectedResult.started_at.replace("Z", "").replace("T", " ").substring(0, 19);
            } else {
                return "–";
            }
        },
    },
    mounted() { },
}
</script>
  
<style scoped>
#ac-completeness-result-table {
    margin-bottom: 20px;
}

#resultTable tr td {
    white-space: pre-line;
}

.param_header {
    padding-bottom: 5px;
}

.param_holder {
    min-width: 360px;
}

#parameter_layout {
    padding-left: 20px;
    padding-bottom: 20px;
}

.btnAlign {
    float: right;
}
</style>
  