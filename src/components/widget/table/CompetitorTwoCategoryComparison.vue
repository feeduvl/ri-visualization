<template>
  <v-card>
    <v-data-table class="ma-0 pa-0" :headers="headersTop" :items="data" hide-actions>
      <template slot="headerCell" slot-scope="props">
        <div slot="activator" class="subheading black--text">{{ props.header.text }}</div>
      </template>
      <template class="ma-0 pa-0" slot="items" slot-scope="props">
        <td class="ma-0 pa-0">
          <v-data-table
            :headers="tableHeadersProblemReports"
            :items="props.item.problem_reports"
            :custom-sort="customTableSort"
            hide-actions
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">
                <b>{{ props.item.account }}</b>
              </td>
              <td class="text-xs-right">{{ props.item.yesterday }}</td>
              <td class="text-xs-right">{{ props.item.week }}</td>
              <td class="text-xs-right">{{ props.item.month }}</td>
            </template>
          </v-data-table>
        </td>
        <td class="ma-0 pa-0">
          <v-data-table
            :headers="tableHeadersInquiries"
            :items="props.item.inquiries"
            :custom-sort="customTableSort"
            hide-actions
          >
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">
                <b>{{ props.item.account }}</b>
              </td>
              <td class="text-xs-right">{{ props.item.yesterday }}</td>
              <td class="text-xs-right">{{ props.item.week }}</td>
              <td class="text-xs-right">{{ props.item.month }}</td>
            </template>
          </v-data-table>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import moment from "moment";
import "moment/locale/de";
import { FILTER_FOR_TOPIC } from "./../../../dataFilter";

const PROBLEM_REPORTS = "problem_reports";
const INQUIRIES = "inquiries";
const ACCOUNT = "account";
const TOTAL = "total";
const YESTERDAY = "yesterday";
const WEEK = "week";
const MONTH = "month";

export default {
  name: "CompetitorTwoCategoryComparison",
  props: {
    topic: {
      type: String,
      default: "",
      required: false
    }
  },
  data() {
    return {
      title: "Overall",
      headersTop: [
        {
          text: "Problem Reports (since)",
          value: "problem_reports",
          sortable: false
        },
        {
          text: "Inquiries (since)",
          value: "inquiries",
          sortable: false
        }
      ],
      tableHeadersProblemReports: [
        {
          text: "Account",
          align: "left",
          sortable: true,
          value: "account"
        },
        {
          text: "Yesterday",
          align: "center",
          sortable: true,
          value: "yesterday"
        },
        {
          text: "Last Week",
          align: "center",
          sortable: true,
          value: "week"
        },
        {
          text: "Last Month",
          align: "center",
          sortable: true,
          value: "month"
        }
      ],
      tableHeadersInquiries: [
        {
          text: "Account",
          align: "left",
          sortable: true,
          value: "account"
        },
        {
          text: "Yesterday",
          align: "center",
          sortable: true,
          value: "yesterday"
        },
        {
          text: "Last Week",
          align: "center",
          sortable: true,
          value: "week"
        },
        {
          text: "Last Month",
          align: "center",
          sortable: true,
          value: "month"
        }
      ],
      errors: [],
      topBarTitle: "Competitor Comparison",
      tweets: [],
      data: [],
      dataTopics: {},
      topics: this.$store.getters.accessKeyConfiguration.topics,
      dateYesterday: parseInt(
        moment()
          .subtract(1, "day")
          .format("YYYYMMDD")
      ),
      dateLastWeek: parseInt(
        moment()
          .subtract(1, "week")
          .format("YYYYMMDD")
      ),
      dateLastMonth: parseInt(
        moment()
          .subtract(1, "month")
          .format("YYYYMMDD")
      )
    };
  },
  methods: {
    setup() {
      this.data = [];
      let accounts = this.$store.state.selectedTwitterAccounts;

      if (this.topic !== "") {
        this.title = this.topic;
        this.tweets = this.tweets.filter(FILTER_FOR_TOPIC(this.topic));
      }

      let tmpData = [];
      // create sub objects for each account and init values
      Array.from(accounts).forEach(account => {
        // add companies to the problem report data
        tmpData.push({
          [ACCOUNT]: account,
          [PROBLEM_REPORTS]: {
            [TOTAL]: 0,
            [YESTERDAY]: 0,
            [WEEK]: 0,
            [MONTH]: 0
          },
          [INQUIRIES]: {
            [TOTAL]: 0,
            [YESTERDAY]: 0,
            [WEEK]: 0,
            [MONTH]: 0
          }
        });
      });

      return tmpData;
    },
    loadData() {
      let tmpData = this.setup();
      this.tweets.forEach(tweet => {
        if (tweet.tweet_class === "problem_report") {
          this.addToData(tmpData, PROBLEM_REPORTS, tweet);
        } else if (tweet.tweet_class === "inquiry") {
          this.addToData(tmpData, INQUIRIES, tweet);
        }
      });
      this.calculateTrends(tmpData, PROBLEM_REPORTS);
      this.calculateTrends(tmpData, INQUIRIES);
      this.prepareDataObject(tmpData);
    },
    addToData(source, target, tweet) {
      var account = tweet.in_reply_to_screen_name;
      for (let i of source.keys()) {
        if (source[i][ACCOUNT] == account) {
          source[i][target][TOTAL] += 1;

          if (tweet.created_at < this.dateYesterday) {
            source[i][target][YESTERDAY] += 1;
          }
          if (tweet.created_at < this.dateLastWeek) {
            source[i][target][WEEK] += 1;
          }
          if (tweet.created_at < this.dateLastMonth) {
            source[i][target][MONTH] += 1;
          }
        }
      }
    },
    calculateTrends(source, target) {
      for (let i of source.keys()) {
        source[i][target][YESTERDAY] =
          source[i][target][TOTAL] - source[i][target][YESTERDAY];
        source[i][target][WEEK] =
          source[i][target][TOTAL] - source[i][target][WEEK];
        source[i][target][MONTH] =
          source[i][target][TOTAL] - source[i][target][MONTH];
      }
    },
    flattenDataObject() {
      let flattenedDataArr = [];
      for (let i of this.data.keys()) {
        let flattenedData = {
          account: this.data[i][ACCOUNT],
          total_prob: this.data[i][PROBLEM_REPORTS][TOTAL],
          yesterday_prob: this.data[i][PROBLEM_REPORTS][YESTERDAY],
          week_prob: this.data[i][PROBLEM_REPORTS][WEEK],
          month_prob: this.data[i][PROBLEM_REPORTS][MONTH],
          total_inq: this.data[i][INQUIRIES][TOTAL],
          yesterday_inq: this.data[i][INQUIRIES][YESTERDAY],
          week_inq: this.data[i][INQUIRIES][WEEK],
          month_inq: this.data[i][INQUIRIES][MONTH]
        };
        flattenedDataArr.push(flattenedData);
      }
      this.data = flattenedDataArr;
    },
    prepareDataObject(tmpData) {
      let problemReportsData = [];
      let inquiriesData = [];
      for (let i of tmpData.keys()) {
        problemReportsData.push({
          account: tmpData[i][ACCOUNT],
          total: tmpData[i][PROBLEM_REPORTS][TOTAL],
          yesterday: tmpData[i][PROBLEM_REPORTS][YESTERDAY],
          week: tmpData[i][PROBLEM_REPORTS][WEEK],
          month: tmpData[i][PROBLEM_REPORTS][MONTH]
        });
        inquiriesData.push({
          account: tmpData[i][ACCOUNT],
          total: tmpData[i][INQUIRIES][TOTAL],
          yesterday: tmpData[i][INQUIRIES][YESTERDAY],
          week: tmpData[i][INQUIRIES][WEEK],
          month: tmpData[i][INQUIRIES][MONTH]
        });
      }
      this.data = [
        {
          [PROBLEM_REPORTS]: problemReportsData,
          [INQUIRIES]: inquiriesData
        }
      ];
    },
    filterForTopic(tweet) {
      let firstTopic = tweet.topics.first_class;
      let secondTopic = tweet.topics.second_class;
      return (
        (firstTopic.label == this.topic && firstTopic.score > 0.5) ||
        (secondTopic.label == this.topic && secondTopic.score > 0.5)
      );
    },
    customTableSort(items, index, isDescending) {
      items.sort((a, b) => {
        if (index === "account") {
          if (isDescending) {
            return b.account < a.account ? 1 : -1;
          } else {
            return a.account > b.account ? 1 : -1;
          }
        } else if (index === "yesterday") {
          if (isDescending) {
            return b.yesterday - a.yesterday;
          } else {
            return a.yesterday - b.yesterday;
          }
        } else if (index === "week") {
          if (isDescending) {
            return b.week - a.week;
          } else {
            return a.week - b.week;
          }
        } else if (index === "month") {
          if (isDescending) {
            return b.month - a.month;
          } else {
            return a.month - b.month;
          }
        }
      });

      return items;
    }
  },
  mounted() {
    this.tweets = [...this.$store.getters.filteredTweets];
    this.loadData();
    this.$store.watch(
      (state, getters) => getters.filteredTweets,
      (newValue, oldValue) => {
        this.tweets = [...newValue];
        this.loadData();
      }
    );
  }
};
</script>

<style scoped>
table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}
.row {
  margin-top: 20px;
  margin-bottom: 10px;
}
.header {
  background-color: rgba(0, 189, 187, 0.35);
}
</style>