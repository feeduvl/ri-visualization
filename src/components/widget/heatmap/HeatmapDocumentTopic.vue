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
  name: "ChartHeatmapDocumentTopic",
  components: {
    ECharts
  },
  computed: {
    ...mapGetters({
      selectedResult: 'selectedResult',
    }),
  },
  props: {},
  data: () => ({
    loading: true,
    option: {
      title: {
        text: "Document-Topic Relation",
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
        height: "60%",
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
        }
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
        max: 5,
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
          name: "Relation Value:",
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
    loadChartData() {

      let doc_topic = {}

      if (this.selectedResult.hasOwnProperty("doc_topic")) {
        doc_topic = this.selectedResult.doc_topic;
      } else {
        return;
      }

      console.log("HeatmapDocumentTopic::loadChartData");

      let data = [];
      let max = 0;

      let xAxis = Object.keys(doc_topic);
      let yAxis = [];
      for (let index=1; index <= doc_topic["0"].length; index++) {
        yAxis.push("Concept " + index);
      }
      console.log(xAxis);
      console.log(yAxis);

      // Iterate over topics
      for (let index=0; index < doc_topic["0"].length; index++) {
        // Iterate over documents
        Object.keys(doc_topic).forEach(function(document) {
          console.log("document: " + document);
          const isTopic = (element) => element[0] === index;
          console.log(doc_topic[document]);
          let val = doc_topic[document][doc_topic[document].findIndex(isTopic())];
          data.push([index, parseInt(document), val]);
          console.log([index, parseInt(document), val]);
          if (val > max) {
            max = val;
          }
        })
      }

      console.log(max);

      this.option.yAxis.data = yAxis;
      this.option.xAxis.data = xAxis;
      this.option.series[0].data = data;
      this.option.visualMap.max = max;
      this.loading = false;
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
  min-height: 250px;
  max-height: 300px;
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
