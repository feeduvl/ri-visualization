<template>
    <v-data-table
            :headers="[{'text': nameTitle, 'value': 'text' },
            {'text': scoreTitle, 'value': 'score'},
            {'text': 'Occurences', 'value': 'occurences'}]"
            :items="fromSelectedResult(selectedResult)"
    >

        <template v-slot:items="props">

            <td class="text-xs-right">{{ props.item.text }}</td>
            <td class="text-xs-right">{{ props.item.score }}</td>
            <td class="text-xs-right">{{ props.item.occurences }}</td>

        </template>
    </v-data-table>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        name: "RankedListResult",
        computed: {
            ...mapGetters({
                selectedResult: 'selectedResult'
            }),
        },
        props : {
            nameTitle : String,
            scoreTitle: String,
            fromSelectedResult: Function
        }
    }
</script>

<style scoped>

</style>