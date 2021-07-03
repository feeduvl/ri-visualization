<template>

    <v-container>
        <cloud :data="fromSelectedResult(selectedResult)" :padding="padding" :fontSizeMapper="fontSizeMapper" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Information gain on split',
            fromSelectedResult }"></ranked-list-result>
        <decision-tree :tree ="selectedResult.topics.tree"></decision-tree>
    </v-container>
</template>

<script>
    import Cloud from 'vue-d3-cloud'
    import {CLOUD} from "../../colors";
    import {mapGetters} from "vuex";
    import {selectedResult} from "../../store/getters";
    export default {
        name: "FcicResult",
        components: {
            "ranked-list-result": () => import("./RankedListResult"),
            "decision-tree": () => import("./DecisionTree"),
            Cloud
        },
        data(){
            return {
                fontSizeMapper: word => 15 + (15*(word.score/this.maxValue)),
                rotate: 0,
                coloring: "random",
                width: 1152,
                height: 400,
                colors: CLOUD,
                padding: 5
            }
        },
        computed: {
            ...mapGetters({
                selectedResult: 'selectedResult'
            }),
            maxValue(){
                return Math.max(...this.selectedResult.topics.information_gain);
            }
        },
        props: {
            fromSelectedResult: Function
        }
    }
</script>

<style scoped>

</style>