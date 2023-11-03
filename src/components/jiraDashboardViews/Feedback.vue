<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>
    <div>
      <button @click="getAssignedDataToExport">Export CSV</button>
    </div>
    <v-card class="table-header">
      <v-card-title>
        <h2>Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn class="delete-button" @click="deleteAllFeedback()" small>
          <i class="material-icons delete-icon">delete_sweep</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="getFeedbackForFilter"
          item-key="id"
          class="elevation-1"
          :total-items="$store.state.totalFeedbackItems"
          rows-per-page-text="Feedback per page"
          :rows-per-page-items="pagination.rowsPerPageItems"
          :pagination.sync="pagination"
          @update:pagination.self="getFeedback()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <tr @click="showDetails(props.item)">
            <td>{{ props.item.text }}</td>
            <td>{{ limitDescriptionText(props.item.id, 10) }}</td>
            <td>
              <i class="material-icons delete-icon" @click.stop="deleteFeedback(props.item)">delete</i>
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
      pagination: {
        sortBy: "id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      search: "",
      warning: "Select Feedback Dataset",
    }
  },
  methods: {
    exportToCSV() {
      const csvHeader = ['feedback_id', 'feedback_text', 'issue_key', 'issue_summary', 'issue_description'];
      const csvContent = [csvHeader];

      for (const data of this.$store.state.dataToExport) {
        const row = [
          `"${data.feedback_id}"`,
          `"${data.feedback_text}"`,
          `"${data.issue_key}"`,
          `"${data.issue_summary}"`,
          `"${data.issue_description}"`
        ];
        csvContent.push(row);
      }
      const csvBlob = new Blob([csvContent.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_data.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    limitDescriptionText(text, limit) {
      if (text.length > limit) {
        return text.substring(0, limit);
      } else {
        return text;
      }
    },
    getFeedback(){
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      this.$store.dispatch("actionGetFeedback", {page, size})
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
    async getAssignedDataToExport() {
      await this.$store.dispatch("actionGetAssignedDataToExport")
      this.exportToCSV()
    },
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
.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>