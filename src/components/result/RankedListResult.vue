<template>
    <v-data-table
            :headers="[{'text': nameTitle, 'value': 'text' },
            {'text': scoreTitle, 'value': 'score'},
            {'text': 'Occurences (total)', 'value': 'occs_total'},
            {'text': 'Occurences (number of documents)', 'value':'occ_doc_count'}]"
            :items="items"
    >

        <template v-slot:items="props">

            <td class="text-xs-right">{{ props.item.text }}</td>
            <td class="text-xs-right">{{ props.item.score }}</td>
            <td class="text-xs-right">{{ props.item.occs_total}}</td>
            <td class="text-xs-right">{{ props.item.occ_doc_count}}</td>

        </template>
    </v-data-table>
</template>

<script>
    export default {
        name: "RankedListResult",
        props : {
            nameTitle : String,
            scoreTitle: String,
            items: Array
        }
    }
</script>

<style scoped>

</style>