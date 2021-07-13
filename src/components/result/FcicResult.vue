<template>

    <v-container>
        <cloud :data="itemsList" :padding="padding" :fontSizeMapper="fontSizeMapper" :onWordClick="onWordClick" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ECharts class="chart" :options="this.getHeatmapConfig()" auto-resize></ECharts>
        <v-btn v-if="!showingDecisionTree"
                elevation="2"
                @click="showingDecisionTree=!showingDecisionTree"
        >Show Decision Tree</v-btn>
        <v-btn v-if="showingDecisionTree"
                                          elevation="2"
                                          @click="showingDecisionTree=!showingDecisionTree"
    >Hide Decision Tree</v-btn>
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Information gain on split',
            items:itemsList }"></ranked-list-result>
        <decision-tree v-if="showingDecisionTree" :tree ="this.selectedResult.topics.tree"></decision-tree>
    </v-container>
</template>

<script>
    import ECharts from "vue-echarts";
    import "echarts";
    import Cloud from 'vue-d3-cloud'
    import {BLACK, BLUE_DARK, BLUE_LIGHT, CLOUD} from "../../colors";
    import {mapGetters} from "vuex";
    import {selectedResult} from "../../store/getters";
    import {getOccurenceDesc, onWordCloudWordClicked} from "./frequency_result_methods"

    export default {
        name: "FcicResult",
        components: {
            "ranked-list-result": () => import("./RankedListResult"),
            "decision-tree": () => import("./DecisionTree"),
            Cloud,
            ECharts
        },
        data(){
            return {
                fontSizeMapper: word => 15 + (30*(word.score/this.maxValue)),
                rotate: 0,
                coloring: "random",
                colors: CLOUD,
                padding: 5,
                onWordClick: onWordCloudWordClicked,
                maxSeriesData: 0,
                showingDecisionTree: false
            }
        },
        methods: {

            getHeatmapConfig(){

                let concepts = [];
                let text_ids = [];

                if(this.isValidResult){
                    concepts = this.selectedResult.topics.concepts;
                    text_ids = this.selectedResult.topics.text_ids;
                }

                return {

                    title: {
                        text: "Concept Occurences in Input",
                        top: "0",
                        left: "center",
                        right: "center"
                    },
                    tooltip: {
                        position: "top"
                    },
                    animation: true,
                    grid: {
                        top: "40",
                        height: "70%",
                        left: "90",
                        right: "25",
                        y: "10%"
                    },
                    xAxis: {
                        type: "category",
                        data: concepts,
                        splitArea: {
                            show: true
                        }
                    },
                    yAxis: {
                        type: "category",
                        data: text_ids,
                        splitArea: {
                            show: true
                        }
                    },
                    visualMap: {
                        min: 0,
                        max: this.maxSeriesData,
                        calculable: true,
                        orient: "horizontal",
                        left: "center",
                        bottom: "0%",
                        inRange: {
                            color: [BLUE_LIGHT, BLUE_DARK] //From smaller to bigger value ->
                        }
                    },
                    series: [
                        {
                            name: "Occurences:",
                            type: "heatmap",
                            data: this.seriesData(),
                            label: {
                                normal: {
                                    show: false
                                }
                            },
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowColor: BLACK
                                }
                            }
                        }]
                }
            },

            seriesData(){

                let sd = []
                let concepts = [];
                let text_ids = [];
                if(this.isValidResult){
                    concepts = this.selectedResult.topics.concepts;
                    text_ids = this.selectedResult.topics.text_ids;
                    let text_occurences = this.selectedResult.topics.text_occurences;

                    for (let doc = 0; doc < text_ids.length; doc++){
                        for (let c = 0; c < concepts.length; c++){
                            let occs = text_occurences[doc][c];
                            sd.push([c, doc, occs]);
                            if(occs > this.maxSeriesData){
                                this.maxSeriesData = occs;
                            }
                        }
                    }
                    return sd;
                } else {
                    return []
                }
            },
        },
        computed: {
            ...mapGetters({
                selectedResult: 'selectedResult'
            }),

            isValidResult(){
                return this.selectedResult && this.selectedResult.topics && this.selectedResult.topics.information_gain;
            },

            maxValue(){
                if(!this.isValidResult){
                    return 0;
                }
                return Math.max(...this.selectedResult.topics.information_gain);
            },
            itemsList(){
                if(!this.isValidResult){
                    return [];
                }
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

    .chart{
        width: 100%;
        height: 600px;
    }

</style>