<template>
  <v-layout>
    <v-card class="echarts">
      <ECharts class="chart" :options="option" auto-resize />
    </v-card>
  </v-layout>
</template>

<script>
import ECharts from "vue-echarts";
import "echarts";
import { BLUE_LIGHT, BLUE_DARK, BLACK } from "@/colors";
import {mapGetters} from "vuex";

export default {
  name: "ChartHeatmapWordDocument",
  components: {
    ECharts
  },
  computed: {
    ...mapGetters({
      selectedResult: 'selectedResult',
    }),
    selectedDataset () {
      return this.$store.state.selectedDataset;
    }
  },
  props: {},
  data: () => ({
    loading: true,
    option: {
      title: {
        text: "Word in Document Count",
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
        data: [
          "00:00",
          "01:00",
          "02:00",
          "03:00",
          "04:00",
          "05:00",
          "06:00",
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
          "23:00"
        ],
        splitArea: {
          show: true
        },
        axisLabel: {
          rotate: 90
        },
      },
      yAxis: {
        type: "category",
        data: [
          "Sunday",
          "Saturday",
          "Friday",
          "Thursday",
          "Wednesday",
          "Tuesday",
          "Monday"
        ],
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
          name: "Word Count:",
          type: "heatmap",
          data: [],
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
        }
      ]
    }
  }),
  methods: {
    topicWords() {
      if (this.selectedDataset.hasOwnProperty("documents")) {
        let list = []
        for (let topic in this.selectedResult.topics) {
          for (let index in this.selectedResult.topics[topic]) {
            let word = this.selectedResult.topics[topic][index];
            if (!(list.indexOf(word) > -1)) {
              list.push(word);
            }
          }
        }
        return list.sort();
      } else {
        return [];
      }
    },
    loadChartData() {

      if (this.selectedDataset.hasOwnProperty("documents")) {

        // xAxis = words
        // yAxis = topics

        // Data has form:
        // [document_index, word_index, value]
        // Heatmap starts filling from bottom left

        let data = [];
        let max = 0;

        let xAxis = this.topicWords();
        let yAxis = [];

        for (const doc of this.selectedDataset["documents"]) {
          yAxis.push(doc.id);
        }

        console.log("axis");
        console.log(xAxis);
        console.log(yAxis);

        // Iterate over documents
        for (let index in this.selectedDataset["documents"]) {
          let doc = this.selectedDataset["documents"][index].text;
          console.log("Iterate document");
          console.log(index);
          console.log(doc);
          // Iterate over words
          for (let index2 in xAxis) {
            console.log("Iterate words");
            console.log(index2);
            let word = xAxis[index2];
            console.log(word);
            let re = new RegExp(' ' + word, 'g');
            let count = (doc.toLowerCase().match(re) || []).length;
            console.log(count);
            if (count === 0) {
              count = '-';
            }
            data.push([index, index2, count]);
            console.log([index, index2, count]);
            if (count > max) {
              max = count;
            }
          }
        }

        this.option.yAxis.data = yAxis;
        this.option.xAxis.data = xAxis;
        this.option.series[0].data = data;
        this.option.visualMap.max = max;
        this.loading = false;

      } else {
        return [];
      }
    },
  },
  mounted() {
    this.loadChartData();
  },
  watch: {
    selectedResult: function () {
      this.loadChartData();
    },
  }
};
</script>

<style lang="scss" scoped>
.echarts {
  min-height: 450px;
  max-height: 2000px;
  height: 100%;
  width: 100%;
  padding-top: 5px;
  padding-bottom: 5px;
  .chart {
    width: 100%;
    height: 85%;
  }
}
.action-item {
  margin: 5px 0 0 0;
}
.divider {
  height: 40px;
}
.configuration {
  padding: 0 0 0 30px;
  margin: 0 0 0 0;
  max-width: 50%;
}
</style>
