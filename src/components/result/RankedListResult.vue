<template>
    <v-data-table
            :headers="[nameTitle, scoreTitle]"
            :items="fromSelectedResult(selectedResult)"
    >
        <template slot="items" slot-scope="props">
            <tr>
                <td style="text-align:center">{{ props.item.name}}</td>
                <td>{{ props.item.score }}</td>
            </tr>
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