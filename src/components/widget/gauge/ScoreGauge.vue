<template>
  <ECharts class="gauge" :options="option" autoresize/>
</template>

<script>
import ECharts from "vue-echarts";
import "echarts";

export default {
  name: "ScoreGauge",
  components: {
    ECharts
  },
  props: {
    value: Number,
  },
  watch: {
    value: function(val) {
      this.option.series[0].data[0].value = val;
    },
  },
  data: () => ({
    option: {
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 1,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, 'rgba(255, 89, 0, 1)'],
              [0.7, 'rgb(25,118,210)'],
              [1, 'rgb(51, 204, 89, 1)']
            ]
          }
        },
        pointer: {
          width: 4,
          length: '70%',
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 4,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 10,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          color: 'auto',
          distance: 4,
          fontSize: 10
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: 'auto'
        },
        data: [{
          value: 0
        }]
      }]
    },
  }),
}
</script>

<style scoped>
.echarts {
  width: 250px;
  height: 250px;
  margin-left: 30px;
}
</style>