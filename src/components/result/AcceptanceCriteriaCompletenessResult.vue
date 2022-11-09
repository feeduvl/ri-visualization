<template>
    <v-layout row wrap>
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
    },
    data: function () {
        return {
            errors: [],
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
  