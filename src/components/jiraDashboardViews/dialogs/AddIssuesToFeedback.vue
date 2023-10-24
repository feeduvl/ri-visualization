<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h2>Add Issues</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <v-data-table
            v-model="selectedIssues"
            :headers="headers"
            :items="getIssues"
            item-key="key"
            :total-items="totalItems" rows-per-page-text="Issues per page"
            :rows-per-page-items="pagination.rowsPerPageItems"
            :pagination.sync="pagination"
            @update:pagination.self="getAllIssues()"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" />
            </td>
            <td>{{ props.item.key }}</td>
            <td>{{ props.item.summary }}</td>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addSelectedIssues" dark color="blue" class="add-issue">
          Add Selected Issues to list
        </v-btn>
        <v-btn @click="toggleIssues()" dark color="black">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script >


import IssueFeedbackRelationService from "@/jiraDashboardServices/issueFeedbackRelationService";
import IssueService from "@/jiraDashboardServices/issueService";

export default {
  props: ['openIssuesDialog', 'feedback', 'listWithTore'],
  data() {
    return {
      headers: [
        {text: "", sort: false},
        {text: "Issue Name", value: "key"},
        {text: "Summary", value: "summary"},
        // {text: "Description", value: "description"},
        // {text: "Issue Type", value: "issueType"},
        // {text: "Project Name", value: "projectName"},
      ],
      selectedFeedback: this.feedback,
      selectedIssues: [],
      allIssues: [],
      totalItems: 0,
      search: "",
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
    }
  },
  computed:{
    openDialog(){
      return this.openIssuesDialog
    },
    getIssues() {
      if (this.search !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.allIssues = this.tempIssueForFilter
        return this.filterIssues
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.allIssues = this.tempIssueForFilter
        return this.allIssues
      }
    },
    filterIssues() {
      return this.allIssues.filter(item => {
        return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  watch: {
    openIssuesDialog() {
      this.getAllIssues();
    }
  },
  methods:{
    toggleIssues() {
      this.selectedIssues = []
      this.$emit('toggleIssues', !this.openIssuesDialog);
    },
    addSelectedIssues() {
      if (!this.listWithTore){
        IssueFeedbackRelationService.addIssueToFeedback(this.selectedFeedback.id, this.selectedIssues)
            .then((response) => {
              console.log(response.data);
              // this.selectedIssue = response.data
              this.toggleIssues();
            })
            .catch((error) => {
              console.error(error);
            });
      }else{
        IssueFeedbackRelationService.addIssueToToreFeedback(this.selectedFeedback.id, this.selectedIssues)
            .then((response) => {
              console.log(response.data);
              // this.selectedIssue.assigned_feedback = response.data.updated_feedback
              this.toggleIssues();
            })
            .catch((error) => {
              console.error(error);
            });
      }
    },
    getAllIssues() {
      console.log(this.listWithTore)
      if (!this.listWithTore){
        IssueService.getUnassignedIssues(this.selectedFeedback.id).then((response) => {
          const issues = response.data;
          this.allIssues = issues.missing_issues
          this.tempIssueForFilter = issues.missing_issues
          // this.totalItems = totalItems
        })
      }else{
        IssueService.getUnassignedToreIssues(this.selectedFeedback.id).then((response) => {
          const issues = response.data;
          console.log(issues.missing_issues)
          this.allIssues = issues.missing_issues
          this.tempIssueForFilter = issues.missing_issues
          // this.totalItems = totalItems
        })
      }
    },
  },
}
</script>

<style scoped>
.add-issue {
  margin-left: 50%
}
</style>