<template>

    <v-container>
        <cloud :data="itemsList" :padding="padding" :fontSizeMapper="fontSizeMapper" :onWordClick="onWordClick" :rotate="rotate" :coloring="coloring" :colors="colors" />
        <ECharts class="chart" :options="heatmapConfig" auto-resize></ECharts>
        <ranked-list-result v-bind="{nameTitle: 'Concept',
            scoreTitle: 'Information gain on split',
            items:itemsList }"></ranked-list-result>
        <decision-tree :tree ="selectedResult.topics.tree"></decision-tree>
    </v-container>
</template>

<script>
    import ECharts from "vue-echarts";
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
            Cloud,
            ECharts
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
            heatmapConfig(){
                let seriesdata = []
                const {concepts, text_ids, text_occurences} = this.selectedResult.topics;
                for (let doc = 0; doc < text_ids.length; doc++){
                    for (let c = 0; c < concepts.length; c++){
                        seriesdata.push([c, doc, text_occurences[doc][c]]);
                    }
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
                        data: this.selectedResult.topics.concepts,
                        splitArea: {
                            show: true
                        }
                    },
                    yAxis: {
                        type: "category",
                        data: this.selectedResult.topics.text_ids,
                        splitArea: {
                            show: true
                        }
                    },
                    visualMap: {
                        min: 0,
                        max: 100,
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
                            data: seriesdata,
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