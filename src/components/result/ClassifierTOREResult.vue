<template>
    <v-card>
        <v-container>
            <v-data-table
                :headers="headersSummary"
                :items="getSummary()"
                :items-per-page="10"
            >
                <template v-slot:items="props">
                    <td>{{ props.item.code }}</td>
                    <td>{{ props.item.count }}</td>
                </template>
            </v-data-table>
       </v-container>
        <v-container>
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
        getSummary() {
            var array = [];
            var evluation = [];

            for (let index in selectedResult.codes) {
                array.push(codes[index].code);
            }

            const counts = {};
            for (const num of array) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }

            for(const code of [...new Set(array)]) {
                evluation.push({"code": code, "count":counts[code]});
            }

            return evluation;
        }
    }

}
</script>

<style scoped>

</style>