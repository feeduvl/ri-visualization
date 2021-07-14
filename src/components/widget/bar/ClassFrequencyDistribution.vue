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
      <ECharts class="chart" :options="bar" auto-resize/>
      <v-select class="timeframe" :items="timeframes" v-model="selectedTimeFrame"></v-select>
    </v-card>
  </v-layout>
</template>

<script>
import ECharts from "vue-echarts";
import "echarts";
import moment from "moment";
import "moment/locale/de";
import { ITEM_STYLE_BAR_BLUE } from "../../../colors.js";
import { FILTER_TIMEFRAME } from "../../../dataFilter.js";

export default {
  name: "ClassFrequencyDistribution",
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
    bar: {
      title: {
        text: "Number of Tweets per Category",
        left: "center",
        right: "center"
      },
      grid: {
        top: "25%",
        bottom: "15%",
        left: "5%",
        right: "5%",
        containLabel: true
      },
      xAxis: {
        data: ["problem report", "inquiry", "irrelevant"]
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          name: "Sales",
          type: "bar",
          data: ["problem report", "inquiry", "irrelevant"],
          itemStyle: ITEM_STYLE_BAR_BLUE,
          label: {
            normal: {
              show: true
            }
          }
        }
      ]
    }
  }),
  methods: {
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
        this.loadData([...this.$store.state.filteredTweets]);
      } else {
        // reset timeframe to the default value if the user selects an illegal time range
        this.selectedTimeFrame = "default";
      }
    },
    loadData(tweets) {
      tweets = tweets.filter(FILTER_TIMEFRAME(this.startDate, this.endDate));
      this.loadChartData(tweets);
    },
    loadChartData(tweets) {
      if (tweets) {
        let dataProblemReports = 0;
        let dataInquiries = 0;
        let dataIrrelevant = 0;

        tweets.forEach(function(tweet) {
          switch (tweet.tweet_class) {
            case "problem_report":
              dataProblemReports++;
              break;
            case "inquiry":
              dataInquiries++;
              break;
            case "irrelevant":
              dataIrrelevant++;
              break;
          }
        });
        this.bar.series[0].data = [
          dataProblemReports,
          dataInquiries,
          dataIrrelevant
        ];
      }
    }
  },
  mounted() {
    this.startDate = moment()
      .subtract(7, "days")
      .format("YYYYMMDD");
    this.endDate = moment()
      .subtract(1, "days")
      .format("YYYYMMDD");

    this.loadData([...this.$store.state.filteredTweets]);
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
          this.startDate = moment()
            .subtract(7, "days")
            .format("YYYYMMDD");
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
          break;
        case this.timeframes[1]:
          this.startDate = moment()
            .subtract(30, "days")
            .format("YYYYMMDD");
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
          break;
        case this.timeframes[2]:
          this.startDate = moment()
            .subtract(90, "days")
            .format("YYYYMMDD");
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
          break;
        case this.timeframes[3]:
          this.startDate = moment()
            .subtract(moment().dayOfYear() - 1, "days")
            .format("YYYYMMDD");
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
          break;
        case this.timeframes[4]:
          this.startDate = 0;
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
          break;
        case this.timeframes[5]:
          this.customFromDateActive = true;
          break;
        case this.timeframes[6]:
          this.customToDateActive = true;
          break;
        default:
          this.selectedTimeFrame = this.timeframes[0];
          this.startDate = moment()
            .subtract(7, "days")
            .format("YYYYMMDD");
          this.endDate = moment()
            .subtract(1, "days")
            .format("YYYYMMDD");
      }

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
    // height: 70%;
    height: 85%;
  }
}
.timeframe {
  padding: 0 0 0 30px;
  margin: 0 0 0 0;
  width: 25%;
}
</style>
