<template>

    <v-container>
        <cloud :data="fromSelectedResult()" :padding="padding" :fontSizeMapper="fontSizeMapper" :onWordClick="onWordClick" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Relevancy Score',
            fromSelectedResult }"></ranked-list-result>
    </v-container>
</template>

<script>
    import Cloud from 'vue-d3-cloud'
    import {CLOUD} from "../../colors";
    import {mapGetters} from "vuex";
    import {getOccurenceDesc, onWordCloudWordClicked} from "./frequency_result_methods";

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
                padding: 5,
                onWordClick: onWordCloudWordClicked
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
                const {concepts, scores, text_ids, text_occurences} = sr.topics;
                let occs = getOccurenceDesc(text_ids, concepts, text_occurences);

                let arr = []
                for(let i = 0; i < concepts.length; i++){
                    arr.push({text: concepts[i], score: scores[i], occurences: occs[i]})
                }
                return arr
            }
        }
    }
</script>

<style scoped>

</style>