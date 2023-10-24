<template>
  <div class="container">

    <v-card class="table-header">
      <v-card-title>
        <h2>Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="getFeedbackForFilter"
      >
        <template v-slot:items="props">
          <tr @click="showDetails(props.item)">
            <td>{{ props.item.text }}</td>
            <td>{{ limitDescriptionText(props.item.id, 10) }}</td>
            <td>
              <v-btn @click.stop="deleteFeedback(props.item)">
                <i class="material-icons delete-icon" >delete</i>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>


import FeedbackService from "@/jiraDashboardServices/feedbackService";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Feedback",
  data() {
    return {
      excelData: [],
      tableHeaders: [
        {text: "Text", value: "text"},
        {text: "ID", value: "id"}
      ],
      feedback: [],
      tempFeedbackForFilter: [],
      search: "",
    }
  },
  methods: {
    limitDescriptionText(text, limit) {
      if (text.length > limit) {
        return text.substring(0, limit);
      } else {
        return text;
      }
    },
    getFeedback(){
      FeedbackService.getFeedback().then((response) => {
        console.log(response.data)
        this.feedback = response.data
        this.tempFeedbackForFilter = response.data
      })
    },
    deleteFeedback(item) {
      FeedbackService.deleteFeedback(item.id)
          .then((response) => {
            console.log(response.data);
            this.getFeedback()
          })
          .catch((error) => {
            console.error(error);
          });
    },
    showDetails(item) {
      this.$router.push({ name: 'tore_feedback', params: { item: item } });
    },
  },
  computed: {
    getFeedbackForFilter() {
      if (this.search !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.feedback = this.tempFeedbackForFilter
        return this.filterFeedback
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.feedback = this.tempFeedbackForFilter
        return this.feedback
      }
    },
    filterFeedback() {
      return this.feedback.filter(item => {
        return item.id.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  created() {
    this.getFeedback();
  },
}
</script>

<style scoped>
.table-header{
  margin-top: 20px;
}

.container{
  width: 90%;
  margin-top: 20px;
}

</style>