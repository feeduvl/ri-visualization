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
                    <v-card :key="key" elevation="0" class="param_holder">
                        <v-card-title class="param_header">
                        <span class="grey--text text-uppercase">{{ key }}</span>
                    </v-card-title>
                        <v-card-text class="param_content">
                            {{ item }}
                        </v-card-text>
                    </v-card>
                </template>
        </v-layout>


        <!-- Summary -->
        <v-container>
            <v-data-table
                :headers="headersSummary"
                :items="getSummary"
                :items-per-page="10"
            >
                <template v-slot:items="props">
                    <td>{{ props.item.code }}</td>
                    <td>{{ props.item.count }}</td>
                </template>
            </v-data-table>
       </v-container>
       <!--- Display Table that contains all codees -->
        <v-container>
            <v-card-title>
                <h2>Detection Results</h2>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="selectedResult.codes"
                :items-per-page="10"
            >
                <template v-slot:items="props">
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.tore }}</td>
                    <td>{{ props.item.index }}</td>
                </template>
            </v-data-table>
      </v-container>
    </v-card>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "ClassifierTOREResult",

    computed: {
        ...mapGetters({
            selectedResult: 'selectedResult'
        }),

        getSummary() {
            var array = [];
            var summary = [];

            console.log(this.selectedResult.codes)

            for (let index in this.selectedResult.codes) {
                array.push(this.selectedResult.codes[index].tore);
            }

            console.log(array)

            const counts = {};
            for (const num of array) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }

            for(const code of [...new Set(array)]) {
                summary.push({"code": code, "count":counts[code]});
            }

            return summary;
        }
    },

    data: () => ({
        headers: [
            {
                text: 'Token',
                align: 'start',
                value: 'token',
            },
            {
                text: 'Code',
                align: 'start',
                value: 'code',
            },        
            {
                text: 'Index',
                align: 'start',
                value: 'index',
            },        
        ],
        headersSummary: [
            {
                text: 'Code',
                align: 'start',
                value: 'count',
            },
            {
                text: 'Occurrences',
                align: 'start',
                value: 'count',
            },        
        ],
    }),

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