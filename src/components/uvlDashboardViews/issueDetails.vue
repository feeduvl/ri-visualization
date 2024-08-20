<template>
  <div class="container">
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
          <i class="material-icons delete-icon pointer-cursor" @click="openDeleteOneAssignmentDialog(props.item)">delete</i>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import { GREEN_FILL, RED_FILL, GRAY, PRIMARY } from "@/colors";
import { DELETE_RESULT_ENDPOINT, GET_SERVICE_STATUS_ENDPOINT, POST_UPDATE_RESULT_NAME_ENDPOINT } from "@/RESTconf";
import { mapGetters } from 'vuex'
import { getMethodObj, getMethodOrChainedObj, METHODS } from "@/methods";
import {
  ACTION_DELETE_RESULT,
  ACTION_EDIT_RESULT_NAME,
  // mutations
  MUTATE_SELECTED_RESULT,
  MUTATE_SELECTED_METHOD
} from "@/store/types";
import { setTheme, SNACKBAR_DISPLAY_TIME, THEME_UVL } from "@/theme";
import { loadDataset, reloadResults } from "@/RESTcalls";

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

    };
  },
  methods: {
    fetchData() {
      this.getAssignedFeedback(); // Fetch assigned feedback for the current item
      //this.updateTotalItems(); // Update the total items count
    },
    updateTotalItems() {
      // Fetch the updated total items count based on the current item
      let issueKey = this.item.key;
      this.$store.dispatch("actionGetTotalAssignedFeedbackItems", issueKey).then(total => {
        this.totalItems = total;
      });
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
    },
    dontDelete(){
      this.deleteAllFeedbackDialog = false
      this.deleteOneFeedbackDialog = false
    },
  },
  mounted() {

  }
}

</script>

<style scoped>

</style>