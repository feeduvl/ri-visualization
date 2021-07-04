<template>

    <v-container>
        <cloud :data="fromSelectedResult()" :padding="padding" :fontSizeMapper="fontSizeMapper" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Relevancy Score',
            fromSelectedResult }"></ranked-list-result>
    </v-container>
</template>

<script>
    import Cloud from 'vue-d3-cloud'
    import {CLOUD} from "../../colors";
    import {mapGetters} from "vuex";

    export default {
        name: "RbaiResult",

        components: {
            "ranked-list-result": () => import("./RankedListResult"),
            Cloud
        },

        data(){
            return {
                fontSizeMapper: word => 15 + (30*(word.score/this.maxValue)),
                rotate: 0,
                coloring: "random",
                colors: CLOUD,
                padding: 5
            }
        },

        computed: {
            maxValue(){
                return Math.max(...this.selectedResult.topics.scores);
            },
            ...mapGetters({
                selectedResult: 'selectedResult'
            }),
        },

        methods:{
            fromSelectedResult(){
                let sr = this.selectedResult;
                const {concepts, scores} = sr.topics;
                let arr = []
                for(let i = 0; i < concepts.length; i++){
                    arr.push({text: concepts[i], score: scores[i]})
                }
                return arr
            }
        }
    }
</script>

<style scoped>

</style>