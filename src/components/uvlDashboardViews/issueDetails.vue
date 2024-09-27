<template>
  <div class="container">
    <div>
      <v-dialog v-model="deleteAllFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteAssignedFeedbackForIssue">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="deleteOneFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteFeedback()">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-card-title>
      <h2 class="table-headline">Related Feedback</h2>
      <div class="search-in-table">
        <v-text-field v-model="searchFeedback" append-icon="search" label=" Search in table..."></v-text-field>
      </div>
      <div class="service-button">
        <v-btn  @click="openDeleteAllAssignmentsDialog()" small>
          <i class="material-icons delete-icon" style="color: red;">delete_sweep</i>
        </v-btn>
        <v-btn class="success"  @click="openAddDialog" small>
          <i class="material-icons add-icon" >add</i>
        </v-btn>
      </div>
    </v-card-title>
    <v-data-table
        :headers="header_details"
        :items="getAssignedFeedbackFilter"
        item-key="id"
        class="elevation-1"
        :total-items="$store.state.totalAssignedFeedbackItems"
        :page="page"
        @update:page="page => $emit('update:page', page)"
        rows-per-page-text="Feedback per page"
        :rows-per-page-items="pagination_expandable.rowsPerPageItems"
        :pagination.sync="pagination_expandable"
        @update:pagination.self="getAssignedFeedback()"
        :no-data-text="warning"
    >
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.text }}</td>
        <td>{{ props.item.similarity }}</td>
        <td>
          <i class="material-icons delete-icon pointer-cursor" @click="openDeleteOneAssignmentDialog(props.item)" style="color: red;">delete</i>
        </td>
      </template>
    </v-data-table>
    <AddFeedbackToIssue :openFeedbackDialog="openFeedbackDialog" :issue="issue" @toggleFeedback="toggleFeedback"/>

  </div>
</template>

<script>
import "moment/locale/de";
import { mapGetters } from 'vuex'
import AddFeedbackToIssue from "./dialogs/AddFeedbackToIssue.vue";

export default {
  name: "issueDetails",
  props: {
    item: {
      type: Object,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
  },
  components: {
    AddFeedbackToIssue

  },
  created() {
  },
  computed: {
    getAssignedFeedbackFilter() {
      if (this.searchFeedback !== "") {
        return this.filterFeedbackFromIssue
      } else {
        return this.$store.state.assignedFeedback
      }
    },
    filterFeedbackFromIssue() {
      return this.$store.state.assignedFeedback.filter(item => {
        const similarityString = item.similarity.toString();
        return item.id.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
      })
    },
    component() {
    },
    ...mapGetters({
      datasets: 'datasets',
      results: 'results',
      loading: "loadingResults",
      filteredResults: "resultsForSelectedMethod",
      selectedResult: "selectedResult",
    })
  },
  watch: {
    item() {
      this.issue = this.item;
      this.fetchData(); // Trigger fetch data when item changes
    },
  },
  data() {
    return {
      header_details: [
        { text: "Id", value: "id", sortable: false },
        { text: "Text", value: "text", sortable: false },
        { text: "Similarity", value: "similarity", sortable: false },
      ],
      pagination_expandable: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      searchFeedback: "",
      deleteOneFeedbackDialog: false,
      itemToDelete: [],
      issue: this.item,
      deleteAllFeedbackDialog: false,
      openFeedbackDialog: false,

    };
  },
  methods: {
    fetchData() {
      this.getAssignedFeedback(); // Fetch assigned feedback for the current item
    },
    getAssignedFeedback(){
      let issueKey = this.item.key
      let page = this.pagination_expandable.page
      let size = this.pagination_expandable.rowsPerPage
      this.$store.dispatch("actionGetAssignedFeedback", {issueKey, page, size})
    },
    openDeleteOneAssignmentDialog(item) {
      this.deleteOneFeedbackDialog = true
      this.itemToDelete = item
    },
    async deleteFeedback() {
      const feedbackId = this.itemToDelete.id
      const issueKey = this.issue.key
      await this.$store.dispatch("actionDeleteIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedFeedback()
      this.deleteOneFeedbackDialog = false
      this.itemToDelete = []
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
    },
    dontDelete(){
      this.deleteAllFeedbackDialog = false
      this.deleteOneFeedbackDialog = false
    },
    openDeleteAllAssignmentsDialog() {
      this.deleteAllFeedbackDialog = true
    },
    openAddDialog() {
      this.listWithTore = false
      this.openFeedbackDialog = true;
    },
    toggleFeedback(value) {
      this.openFeedbackDialog = value;
      this.getAssignedFeedback()
    },
    async deleteAssignedFeedbackForIssue() {
      await this.$store.dispatch("actionDeleteAssignedFeedbackForIssue", this.issue.key)
      this.getAssignedFeedback()
      this.deleteAllFeedbackDialog = false
      await this.$store.dispatch("actionSaveData", this.$store.state.currentDashboardName)
    },
  },
  mounted() {

  }
}

</script>

<style scoped>
.pointer-cursor {
  cursor: pointer; /* Makes the cursor a hand when hovering over the delete icon */
}
.table-headline{
  padding-right: 20px
}
</style>