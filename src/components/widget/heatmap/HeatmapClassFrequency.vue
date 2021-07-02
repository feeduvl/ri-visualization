<template>
  <v-layout>
    <v-card class="echarts">
      <ECharts class="chart" :options="option" auto-resize />
      <v-select
        class="configuration"
        label="Configuration (show)"
        :items="configurationItems"
        v-model="configuration"
        multiple
        chips
      >
        <template v-slot:selection="{ item, index }">
          <v-chip small color="black" outline>
            <span>show:{{ item }}</span>
          </v-chip>
        </template>
      </v-select>
      <!-- <v-layout row align-center>
        <v-flex xs2 offset-xs1>
          <v-switch class="action-item" :label="`bug reports`" v-model="modelShowBugReports"></v-switch>
        </v-flex>
        <v-flex xs2>
          <v-switch class="action-item" :label="`inquries`" v-model="modelShowInquries"></v-switch>
        </v-flex>
        <v-flex xs2>
          <v-switch class="action-item" :label="`show Tweet counts`" v-model="modelShowNumbers"></v-switch>
        </v-flex>
      </v-layout>-->
    </v-card>
  </v-layout>
</template>

<script>
import ECharts from "vue-echarts";
import "echarts";
import { BLUE_LIGHT, BLUE_DARK, BLACK } from "../../../colors.js";

const CONF_SHOW_PROBLEMS = "problems";
const CONF_SHOW_INQUIRIES = "inquries";
const CONF_SHOW_OTHERS = "other";
const CONF_SHOW_VALUES = "values";

export default {
  name: "ChartHeatmapClassFrequency",
  components: {
    ECharts
  },
  props: {},
  data: () => ({
    modelShowBugReports: true,
    modelShowInquries: true,
    modelShowOthers: false,
    modelShowNumbers: true,
    loading: true,
    configurationItems: [
      CONF_SHOW_PROBLEMS,
      CONF_SHOW_INQUIRIES,
      CONF_SHOW_OTHERS,
      CONF_SHOW_VALUES
    ],
    configuration: [CONF_SHOW_PROBLEMS, CONF_SHOW_INQUIRIES, CONF_SHOW_VALUES],
    option: {
      title: {
        text: "Tweet Frequency per Day and Hour",
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
        max: 10,
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
          name: "Time: Percentage",
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
    loadChartData(tweets) {
      if (tweets) {
        let chartDict = {};
        // init charDict
        for (let day = 0; day < 7; day++) {
          chartDict[day] = chartDict[day] || {};
          for (let hour = 0; hour < 24; hour++) {
            chartDict[day][hour] = 0;
          }
        }

        // count absolute numbers
        tweets.forEach(tweet => {
          if (tweet.created_at_full) {
            let date = new Date(tweet.created_at_full);
            let day = this.convertJSDayToChartDay(date.getDay());
            let hour = date.getHours();
            if (
              (tweet.tweet_class == "problem_report" &&
                this.modelShowBugReports) ||
              (tweet.tweet_class == "inquiry" && this.modelShowInquries) ||
              (tweet.tweet_class != "inquiry" &&
                tweet.tweet_class != "problem_report" &&
                this.modelShowOthers)
            ) {
              chartDict[day][hour] = ++chartDict[day][hour];
            }
          }
        });

        // calculate relative numbers per hour
        // Object.keys(chartDict).forEach(function(day) {
        //   let absoluteNumberPerDay = Object.values(chartDict[day]).reduce(
        //     (accumulator, currentValue) => accumulator + currentValue
        //   );
        //   Object.keys(chartDict[day]).forEach(function(hour) {
        //     chartDict[day][hour] = parseInt(
        //       (chartDict[day][hour] / absoluteNumberPerDay) * 100
        //     );
        //   });
        // });

        let data = [];
        let max = 0;
        Object.keys(chartDict).forEach(function(day) {
          Object.keys(chartDict[day]).forEach(function(hour) {
            let val = chartDict[day][hour];
            data.push([parseInt(day), parseInt(hour), val]);
            if (val > max) {
              max = val;
            }
          });
        });

        data = data.map(function(item) {
          return [item[1], item[0], item[2] || "-"];
        });

        console.log("HeatmapClassFrequency:");
        console.log(chartDict);
        console.log("-------");
        console.log(data);

        this.option.series[0].data = data;
        this.option.visualMap.max = max;
        this.loading = false;
      }
    },
    convertJSDayToChartDay(day) {
      switch (day) {
        case 0:
          return 0;
        case 1:
          return 6;
        case 2:
          return 5;
        case 3:
          return 4;
        case 4:
          return 3;
        case 5:
          return 2;
        case 6:
          return 1;
      }
    }
  },
  mounted() {
    this.loadChartData([...this.$store.state.filteredTweets]);
    this.$store.watch(
      (state, getters) => getters.filteredTweets,
      (newValue, oldValue) => {
        this.loadChartData([...newValue]);
      }
    );
  },
  watch: {
    configuration() {
      this.modelShowBugReports = this.configuration.includes(
        CONF_SHOW_PROBLEMS
      );
      this.modelShowInquries = this.configuration.includes(CONF_SHOW_INQUIRIES);
      this.modelShowOthers = this.configuration.includes(CONF_SHOW_OTHERS);
      this.modelShowNumbers = this.configuration.includes(CONF_SHOW_VALUES);

      this.loadChartData([...this.$store.state.filteredTweets]);
    },
    modelShowNumbers() {
      this.option.series[0].label.normal.show = this.modelShowNumbers;
    }
  }
};
</script>

<style lang="scss" scoped>
.echarts {
  min-height: 250px;
  max-height: 300px;
  height: 100%;
  width: 100%;
  .chart {
    width: 100%;
    height: 85%;
  }
}
.action-item {
  margin: 5px 0px 0px 0px;
}
.divider {
  height: 40px;
}
.configuration {
  padding: 0px 0px 0px 30px;
  margin: 0px 0px 0px 0px;
  max-width: 50%;
}
</style>
