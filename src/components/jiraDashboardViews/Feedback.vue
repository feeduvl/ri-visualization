<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>

    <v-card class="table-header">
      <v-card-title>
        <h2>Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn color="red" @click="deleteAllFeedback()">
          remove entire feedback
        </v-btn>
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



import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Feedback",
  components: {LoadingView},
  data() {
    return {
      tableHeaders: [
        {text: "Text", value: "text"},
        {text: "ID", value: "id"}
      ],
      search: "",
      // openDetails: false,
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
      this.$store.dispatch("actionGetFeedback")
    },
    async deleteFeedback(item) {
      await this.$store.dispatch("actionDeleteFeedback", item.id)
      this.getFeedback()
    },
    async deleteAllFeedback() {
      await this.$store.dispatch("actionDeleteAllFeedback")
      this.getFeedback()
    },
    showDetails(item) {
      this.$router.push({ name: 'tore_feedback', params: { item: item } });
    },
  },
  computed: {
    isLoadingData(){
      return this.$store.state.isLoadingData
    },
    getFeedbackForFilter() {
      if (this.search !== "") {
        return this.filterFeedback
      } else {
        return this.$store.state.feedback
      }
    },
    filterFeedback() {
      return this.$store.state.feedback.filter(item => {
        return item.id.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  mounted() {
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