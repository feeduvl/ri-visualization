<template>
    <v-card>
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
        })
    },

    data: () => ({
        headers: [
            {
                text: 'Token',
                align: 'start',
                sortable: true,
                value: 'token',
            },
            {
                text: 'Code',
                align: 'start',
                sortable: true,
                value: 'code',
            },        
            {
                text: 'Index',
                align: 'start',
                sortable: true,
                value: 'index',
            },        
        ],
    }),

}
</script>

<style scoped>

</style>