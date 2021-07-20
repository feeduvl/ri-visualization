<template>

    <v-container>
        <cloud :data="itemsList" :padding="padding" :fontSizeMapper="fontSizeMapper" :onWordClick="onWordClick" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ECharts class="chart" :options="this.getHeatmapConfig()" auto-resize></ECharts>
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                        color="primary"
                        dark
                        v-bind="attrs"
                        v-on="on"
                        elevation="2"
                        @click="showingDecisionTree=!showingDecisionTree"
                >
                    <span v-if="!showingDecisionTree">Show Decision Tree</span>
                    <span v-else>Hide Decision Tree</span>
                </v-btn>
            </template>
            <span>{{toolTipDecisionTree}}</span>
        </v-tooltip>

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
    import {getOccurenceDesc, getOccurenceStats, onWordCloudWordClicked} from "./frequency_result_methods"

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
                showingDecisionTree: false,
                toolTipDecisionTree: "Interpretation: Starting at the root node, check for the presence of a concept in an input sentence. If the concept represented by this node is present, move to the left child. If the concept is not present, move to the right child. Leaf nodes represent the final classification of the input text."

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
                        },
                        axisLabel: {
                            rotate: 90,
                            margin: 4,
                            fontSize: 10,
                        },
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
                                    show: true
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
                let occs_stats = getOccurenceStats(text_ids, concepts, text_occurences);
                let arr = []
                for(let i = 0; i < concepts.length; i++){
                    arr.push({text: concepts[i],
                        score: information_gain[i],
                        occurence_desc: occs[i],
                        occ_doc_count: occs_stats[i][0],
                        occs_total: occs_stats[i][1]})
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