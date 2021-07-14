<template>
  <v-layout>
    <v-date-picker
      v-if="customFromDateActive"
      v-model="datePickerFrom"
      no-title
      @change="datePicker()"
    ></v-date-picker>
    <v-date-picker v-if="customToDateActive" v-model="datePickerTo" no-title @change="datePicker()"></v-date-picker>
    <v-spacer/>
    <v-card class="echarts">
      <ECharts class="chart" :options="line" auto-resize/>
      <v-layout row align-center>
        <v-flex xs3>
          <v-select class="timeframe" :items="timeframes" v-model="selectedTimeFrame"></v-select>
        </v-flex>
        <v-flex xs5 offset-xs4>
          <v-switch class="switch" :label="`Ignore neutral tweets`" v-model="ignoreNeutralTweets"></v-switch>
        </v-flex>
      </v-layout>
    </v-card>
  </v-layout>
</template>
<script>
import ECharts from "vue-echarts";
import "echarts";
import moment from "moment";
import "moment/locale/de";
import {
  FILTER_NEUTRAL_SENTIMENT,
  FILTER_TIMEFRAME
} from "./../../../dataFilter";

moment.locale("en");
export default {
  name: "SentimentPerformanceMultiline",
  components: {
    ECharts
  },
  props: {},
  data: () => ({
    startDate: 0,
    endDate: 0,
    customFromDateActive: false,
    customToDateActive: false,
    datePickerFrom: null,
    datePickerTo: null,
    ignoreNeutralTweets: false,
    timeframes: [
      "7 days",
      "30 days",
      "90 days",
      "this year",
      "all time",
      "from",
      "to"
    ],
    selectedTimeFrame: "7 days",
    line: {}
  }),
  methods: {
    resetChart() {
      this.line = {
        title: {
          text: "Sentiment Trend (-5 very negative, +5 very positive)",
          left: "center",
          right: "center"
        },
        tooltip: {
          trigger: "axis"
        },
        grid: {
          top: "20%",
          bottom: "10%",
          left: "5%",
          right: "5%",
          containLabel: true
        },
        legend: {
          type: "scroll",
          show: true,
          top: 25,
          selectedMode: false,
          data: []
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: []
        },
        yAxis: {
          name: "Average Sentiment",
          min: -5,
          max: 5,
          type: "value",
          boundaryGap: true,
          alignWithLabel: true,
          nameLocation: "center",
          nameTextStyle: {
            padding: 10,
            fontSize: 15
          }
        },
        series: [
          {
            name: "sentiment score",
            type: "line",
            symbolSize: 5,
            data: []
          }
        ]
      };
    },
    datePicker() {
      if (this.customFromDateActive) {
        this.startDate = moment(this.datePickerFrom, "YYYY.MM.DD").format(
          "YYYYMMDD"
        );
      } else {
        this.endDate = moment(this.datePickerTo, "YYYY.MM.DD").format(
          "YYYYMMDD"
        );
      }
      this.customFromDateActive = false;
      this.customToDateActive = false;
      if (
        moment(this.startDate, "YYYYMMDD").isBefore(
          moment(this.endDate, "YYYYMMDD")
        ) ||
        moment(this.startDate, "YYYYMMDD").isSame(
          moment(this.endDate, "YYYYMMDD")
        )
      ) {
        this.loadData(this.$store.state.filteredTweets);
      } else {
        // reset timeframe to the default value if the user selects an illegal time range
        this.selectedTimeFrame = "default";
      }
    },
    loadData(tweets) {
      tweets = tweets.filter(FILTER_TIMEFRAME(this.startDate, this.endDate));
      if (this.ignoreNeutralTweets) {
        tweets = tweets.filter(FILTER_NEUTRAL_SENTIMENT);
      }
      this.resetChart();
      this.loadChartData(tweets);
    },
    loadChartData(tweets) {
      let self = this;

      let accounts = new Set();
      tweets.forEach(tweet => {
        accounts.add(tweet.in_reply_to_screen_name);
      });

      this.line.legend.data = Array.from(accounts);

      let chartData = [];
      Array.from(accounts).forEach(function(account, index) {
        // initialize vars
        let dictTweetSentimentPerDay = {};
        let now = moment(self.startDate, "YYYYMMDD");
        let until = moment(self.endDate, "YYYYMMDD");
        for (now; now.isBefore(until); now.add(1, "days")) {
          dictTweetSentimentPerDay[now.format("YYYYMMDD")] = {
            count: 0,
            senitmentSum: 0,
            sentimentAvg: 0
          };
        }
        tweets.forEach(tweet => {
          if (tweet.in_reply_to_screen_name !== account) {
            return;
          }
          let date = tweet.created_at;
          dictTweetSentimentPerDay[date] = {
            count:
              date in dictTweetSentimentPerDay
                ? ++dictTweetSentimentPerDay[date].count
                : 0,
            senitmentSum:
              date in dictTweetSentimentPerDay
                ? dictTweetSentimentPerDay[date].senitmentSum +
                  tweet.sentiment_score
                : tweet.sentiment_score,
            sentimentAvg:
              date in dictTweetSentimentPerDay
                ? dictTweetSentimentPerDay[date].senitmentSum /
                  dictTweetSentimentPerDay[date].count
                : 0
          };
        });

        chartData.push({
          name: account,
          type: "line",
          rawData: dictTweetSentimentPerDay,
          data: []
        });
      });

      this.fillChartWithData(chartData);
    },
    fillChartWithData(chartData) {
      let self = this;
      if (chartData.length > 0) {
        // dynamically create the xAxis labels
        let xAxisLabels = [];
        let dateRange = [];
        chartData.forEach(o => {
          dateRange = dateRange.concat(Object.keys(o.rawData));
        });
        dateRange = [...new Set(dateRange)];
        dateRange.sort((a, b) => a - b);
        dateRange.forEach(date => {
          xAxisLabels.push(moment(date, "YYYYMMDD").format("DD.MM"));
        });

        this.line.xAxis.data = xAxisLabels;

        chartData.forEach(function(o, index) {
          let sentimentAvgPerDay = [];
          Object.keys(o.rawData).forEach(function(date) {
            sentimentAvgPerDay.push(o.rawData[date].sentimentAvg);
          });
          self.line.series[index] = {
            name: o.name,
            type: o.type,
            smooth: true,
            data: sentimentAvgPerDay
          };
        });
      }
    },
    getEarliestTweetDate(tweets) {
      let earliestDate = Number.MAX_SAFE_INTEGER;
      tweets.forEach(tweet => {
        earliestDate =
          tweet.created_at < earliestDate ? tweet.created_at : earliestDate;
      });

      return earliestDate;
    },
    getFormattedDate(amount, unit) {
      return moment()
        .subtract(amount, unit)
        .format("YYYYMMDD");
    }
  },
  mounted() {
    this.startDate = moment()
      .subtract(7, "days")
      .format("YYYYMMDD");
    this.endDate = moment()
      .subtract(1, "days")
      .format("YYYYMMDD");

    this.loadData([...this.$store.getters.filteredTweets]);
    this.$store.watch(
      (state, getters) => getters.filteredTweets,
      (newValue, oldValue) => {
        this.loadData([...newValue]);
      }
    );
  },
  watch: {
    selectedTimeFrame() {
      switch (this.selectedTimeFrame) {
        case this.timeframes[0]:
          this.startDate = this.getFormattedDate(7, "days");
          this.endDate = this.getFormattedDate(1, "days");
          break;
        case this.timeframes[1]:
          this.startDate = this.getFormattedDate(30, "days");
          this.endDate = this.getFormattedDate(1, "days");
          break;
        case this.timeframes[2]:
          this.startDate = this.getFormattedDate(90, "days");
          this.endDate = this.getFormattedDate(1, "days");
          break;
        case this.timeframes[3]:
          this.startDate = this.getFormattedDate(
            moment().dayOfYear() - 1,
            "days"
          );
          this.endDate = this.getFormattedDate(1, "days");
          break;
        case this.timeframes[4]:
          this.startDate = this.getEarliestTweetDate();
          this.endDate = this.getFormattedDate(1, "days");
          break;
        case this.timeframes[5]:
          this.customFromDateActive = true;
          break;
        case this.timeframes[6]:
          this.customToDateActive = true;
          break;
        default:
          this.selectedTimeFrame = this.timeframes[0];
          this.endDate = this.getFormattedDate(7, "days");
          this.endDate = this.getFormattedDate(1, "days");
      }

      this.loadData([...this.$store.state.filteredTweets]);
    },
    ignoreNeutralTweets() {
      this.loadData([...this.$store.state.filteredTweets]);
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
.timeframe {
  padding: 0 0 20px 30px;
  margin: 0 0 0 0;
}
.switch {
  padding: 0 0 20px 0;
  margin: 0 0 0 0;
}
</style>
