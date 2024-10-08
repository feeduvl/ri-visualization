<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h3 class="feedback-heading">Add Feedback</h3>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="fixed-header">
          <h3>Requirement Summary: <span>{{ issue.summary }}</span></h3>
          <h3>Requirement Description: <span>{{ issue.description }}</span></h3>
        </div>
        <div class="scrollable-content">
          <v-data-table
              v-model="selectedFeedback"
              :headers="headerDialog"
              :items="getFilteredFeedback"
              item-key="id"
              select-all
              class="elevation-1"
              :total-items="$store.state.totalUnassignedFeedbackItems"
              rows-per-page-text="Feedback per page"
              :rows-per-page-items="pagination.rowsPerPageItems"
              :pagination.sync="pagination"
              @update:pagination.self="getUnassignedFeedback()"
              :no-data-text="warning"
          >
            <template v-slot:items="props">
              <td>
                <v-checkbox v-model="props.selected" />
              </td>
              <td>{{ props.item.id }}</td>
              <td>{{ props.item.text }}</td>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addSelectedFeedback" class="success">
          Add Selected Feedback to list
        </v-btn>
        <v-btn @click="toggleFeedback()" color="red">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: ['openFeedbackDialog', 'issue'],
  data(){
    return {
      selectedIssue: this.issue,
      selectedFeedback: [],
      search: "",
      headerDialog: [
        {text: "Id", value: "id", sortable: false},
        {text: "Text", value: "text", sortable: false},
      ],
      pagination: {
        sortBy: "id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      warning: "No Feedback available",
    }
  },
  watch: {
    openFeedbackDialog() {
      this.selectedIssue = this.issue
      this.getUnassignedFeedback()
    },
  },
  computed:{
    openDialog(){
      return this.openFeedbackDialog
    },
    getFilteredFeedback() {
      if (this.search !== "") {
        return this.filterFeedback
      } else {
        return this.$store.state.unassignedFeedback
      }
    },
    filterFeedback() {
      return this.$store.state.unassignedFeedback.filter(item => {
        return item.id.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  methods: {
    toggleFeedback() {
      this.selectedFeedback = []
      this.$emit('toggleFeedback', !this.openFeedbackDialog);
    },
    async addSelectedFeedback() {
      const projectName = this.selectedIssue.projectName
      const issueKey = this.selectedIssue.key
      const selectedFeedback = this.selectedFeedback
      await this.$store.dispatch("actionAddFeedbackToIssue", {projectName, issueKey, selectedFeedback})
      this.toggleFeedback();
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
    },
    getUnassignedFeedback(){
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      let issueKey = this.selectedIssue.key
      let selectedFeedback = this.$store.state.selectedFeedback
      this.$store.dispatch("actionGetUnassignedFeedback", {issueKey, page, size, selectedFeedback})
    },
  },
};
</script>

<style scoped>
.add-feedback{
  margin-left: 50%
}
.fixed-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}
.scrollable-content {
  overflow-y: auto;
  max-height: 400px;
}
span{
  font-weight: normal;
}
.feedback-heading{
  padding-right: 20px;
}
</style>