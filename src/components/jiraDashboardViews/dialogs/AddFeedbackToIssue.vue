<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h2>Add Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <v-data-table
            v-model="selectedFeedback"
            :headers="headerDialog"
            :items="getFilteredFeedback"
            item-key="id"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" />
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.text }}</td>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addSelectedFeedback" dark color="blue" class="add-feedback">
          Add Selected Feedback to list
        </v-btn>
        <v-btn @click="toggleFeedback()" dark color="black">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>


import IssueFeedbackRelationService from "@/jiraDashboardServices/issueFeedbackRelationService";
import FeedbackService from "@/jiraDashboardServices/feedbackService";

export default {
  props: ['openFeedbackDialog', 'issue', 'listWithTore'],
  data(){
    return {
      selectedIssue: this.issue,
      selectedFeedback: [],
      allFeedback: [],
      tempFeedback: [],
      search: "",
      headerDialog: [
        {text: "", sort: false},
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
    }
  },
  watch: {
    openFeedbackDialog() {
      this.getFeedback()
    },
  },
  computed:{
    openDialog(){
      return this.openFeedbackDialog
    },
    getFilteredFeedback() {
      if (this.search !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.allFeedback = this.tempFeedback
        return this.filterFeedback
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.allFeedback = this.tempFeedback
        return this.allFeedback
      }
    },
    filterFeedback() {
      return this.allFeedback.filter(item => {
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
    addSelectedFeedback() {
      if (!this.listWithTore){
        IssueFeedbackRelationService.addFeedbackToIssue(this.selectedIssue.projectName, this.selectedIssue.key, this.selectedFeedback)
            .then((response) => {
              console.log(response.data);
              this.getFeedback()
              // this.selectedIssue = response.data
              this.toggleFeedback();
            })
            .catch((error) => {
              console.error(error);
            });
      }else{
        IssueFeedbackRelationService.addToreFeedbackToIssue(this.selectedIssue.projectName, this.selectedIssue.key, this.selectedFeedback)
            .then((response) => {
              console.log(response.data);
              this.getFeedback()
              // this.selectedIssue.assigned_feedback = response.data.updated_feedback
              this.toggleFeedback();
            })
            .catch((error) => {
              console.error(error);
            });
      }
    },
    getFeedback(){
      if (!this.listWithTore){
        FeedbackService.getUnassignedFeedback(this.selectedIssue.key).then((response) => {
          console.log(response.data)
          this.allFeedback = response.data
          this.tempFeedback = response.data
        })
      }else{
        FeedbackService.getUnassignedToreFeedback(this.selectedIssue.key).then((response) => {
          console.log("unassigned_feedback_tore")
          console.log(response.data)
          this.allFeedback = response.data
          this.tempFeedback = response.data
        })
      }
    },
  },
};
</script>

<style scoped>
.add-feedback{
  margin-left: 50%
}
</style>