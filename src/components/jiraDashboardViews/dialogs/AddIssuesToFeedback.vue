<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h2>Add Requirements</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="fixed-header">
          <h3>Feedback Text: <span>{{feedback.text}}</span></h3>
        </div>
        <div class="scrollable-content">
          <v-data-table
              v-model="selectedIssues"
              :headers="headers"
              :items="getIssues"
              item-key="key"
              select-all
              class="elevation-1"
              :total-items="$store.state.totalUnassignedIssueItems"
              rows-per-page-text="Requirements per page"
              :rows-per-page-items="pagination.rowsPerPageItems"
              :pagination.sync="pagination"
              @update:pagination.self="getUnassignedIssues()"
              :no-data-text="warning"
          >
            <template v-slot:items="props">
              <td>
                <v-checkbox v-model="props.selected" />
              </td>
              <td>{{ props.item.key }}</td>
              <td>{{ props.item.summary }}</td>
              <td>{{ props.item.description }}</td>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addSelectedIssues" dark color="blue" class="add-issue">
          Add Selected Requirements to list
        </v-btn>
        <v-btn @click="toggleIssues()" dark color="black">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script >


export default {
  props: ['openIssuesDialog', 'feedback', 'listWithTore'],
  data() {
    return {
      headers: [
        {text: "Requirement Name", value: "key", sortable: false},
        {text: "Summary", value: "summary", sortable: false},
        {text: "Description", value: "description", sortable: false},
      ],
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      warning: "No requirements assigned",
      selectedFeedback: this.feedback,
      selectedIssues: [],
      totalItems: 0,
      search: "",
    }
  },
  computed:{
    openDialog(){
      return this.openIssuesDialog
    },
    getIssues() {
      if (this.search !== "") {
        return this.filterIssues
      } else {
        return this.$store.state.unassignedIssues
      }
    },
    filterIssues() {
      return this.$store.state.unassignedIssues.filter(item => {
        return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  watch: {
    openIssuesDialog() {
      this.selectedFeedback = this.feedback
      this.getUnassignedIssues();
    }
  },
  methods:{
    toggleIssues() {
      this.selectedIssues = []
      this.$emit('toggleIssues', !this.openIssuesDialog);
    },
    async addSelectedIssues() {
      const feedbackId = this.selectedFeedback.id
      const selectedIssues = this.selectedIssues
      if (!this.listWithTore){
        await this.$store.dispatch("actionAddIssueToFeedback", {feedbackId, selectedIssues})
        this.toggleIssues();
      }else{
        await this.$store.dispatch("actionAddIssueToToreFeedback", {feedbackId, selectedIssues})
        this.toggleIssues();
      }
    },
    getUnassignedIssues() {
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      let feedbackId = this.selectedFeedback.id
      console.log(this.listWithTore)
      if (!this.listWithTore){
        this.$store.dispatch("actionGetUnassignedIssues", {feedbackId, page, size})
      }else{
        this.$store.dispatch("actionGetUnassignedToreIssues", {feedbackId, page, size})
      }
    },
  },
}
</script>

<style scoped>
.add-issue {
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
</style>