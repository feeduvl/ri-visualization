<template>
    <v-data-table
            :headers="[{'text': nameTitle, 'value': 'name' }, {'text': scoreTitle, 'value': 'score'}]"
            :items="fromSelectedResult(selectedResult)"
    >
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