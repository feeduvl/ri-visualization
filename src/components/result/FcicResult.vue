<template>

    <v-container>
        <cloud :data="itemsList" :padding="padding" :fontSizeMapper="fontSizeMapper" :onWordClick="onWordClick" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Information gain on split',
            items:itemsList }"></ranked-list-result>
        <decision-tree :tree ="selectedResult.topics.tree"></decision-tree>
    </v-container>
</template>

<script>
    import Cloud from 'vue-d3-cloud'
    import {CLOUD} from "../../colors";
    import {mapGetters} from "vuex";
    import {selectedResult} from "../../store/getters";
    import {getOccurenceDesc, onWordCloudWordClicked} from "./frequency_result_methods"

    export default {
        name: "FcicResult",
        components: {
            "ranked-list-result": () => import("./RankedListResult"),
            "decision-tree": () => import("./DecisionTree"),
            Cloud
        },
        data(){
            return {
                fontSizeMapper: word => 15 + (30*(word.score/this.maxValue)),
                rotate: 0,
                coloring: "random",
                width: 1152,
                height: 400,
                colors: CLOUD,
                padding: 5,
                onWordClick: onWordCloudWordClicked
            }
        },
        computed: {
            ...mapGetters({
                selectedResult: 'selectedResult'
            }),
            maxValue(){
                return Math.max(...this.selectedResult.topics.information_gain);
            },
            itemsList(){
                let sr = this.selectedResult;
                const {concepts, information_gain, text_ids, text_occurences} = sr.topics;
                let occs = getOccurenceDesc(text_ids, concepts, text_occurences);

                let arr = []
                for(let i = 0; i < concepts.length; i++){
                    arr.push({text: concepts[i], score: information_gain[i], occurences: occs[i]})
                }
                return arr
            }
        }
    }
</script>

<style scoped>

</style>