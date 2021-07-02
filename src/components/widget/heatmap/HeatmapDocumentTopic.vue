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
              show: false
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

      let data = [];
      let max = 0;

      let xAxis = Object.keys(doc_topic);
      let yAxis = [];
      for (let index=1; index <= doc_topic["0"].length; index++) {
        yAxis.push("Concept " + index);
      }

      // Iterate over topics
      for (let index=0; index < doc_topic["0"].length; index++) {
        // Iterate over documents
        Object.keys(doc_topic).forEach(function(document) {
          const isTopic = (element) => element[0] === index;
          let val = 0;
          for (const tup of doc_topic[document]) {
            if (tup[0] === index) {
              if (val === 1e-20 || val === 0) {
                val = "-";
              } else {
                val = tup[1].toFixed(3);
              }
              break;
            }
          }
          data.push([index, parseInt(document), val]);
          if (val > max) {
            max = val;
          }
        })
      }

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
