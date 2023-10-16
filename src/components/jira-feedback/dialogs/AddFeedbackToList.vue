<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>Add Feedback</v-card-title>
      <v-card-text>
        <v-data-table
            v-model="selectedFeedback"
            :headers="headerDialog"
            :items="allFeedback"
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
        <v-btn @click="addSelectedToreFeedback" dark color="blue" style="margin-left: 50%">
          Add Selected Feedback to list
        </v-btn>
        <v-btn @click="toggleFeedback()" dark color="black">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>


import FeedbackService from "@/feedback-service";

export default {
  props: ['openFeedbackDialog', 'feedback', 'listWithTore'],
  data(){
    return {
      feedbackData: this.feedback,
      selectedFeedback: [],
      allFeedback: [],
      headerDialog: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
    }
  },
  computed:{
    openDialog(){
      return this.openFeedbackDialog
    },
  },
  methods: {
    toggleFeedback() {
      this.$emit('toggleFeedback', !this.openFeedbackDialog);
    },
    addSelectedToreFeedback() {
      if (this.listWithTore){
        FeedbackService.addToreFeedback(this.feedbackData.key, this.selectedFeedback)
            .then((response) => {
              console.log(response.data.updated_feedback);
              this.feedbackData.assigned_feedback_with_tore = response.data.updated_feedback
              this.toggleFeedback();
            })
            .catch((error) => {
              console.error(error);
            });
      }else{
        FeedbackService.addFeedback(this.feedbackData.key, this.selectedFeedback)
            .then((response) => {
              console.log(response.data.updated_feedback);
              this.feedbackData.assigned_feedback = response.data.updated_feedback
              this.toggleFeedback();
            })
            .catch((error) => {
              console.error(error);
            });
      }

    },
    getFeedback(){
      FeedbackService.getFeedback().then((response) => {
        console.log(response.data)
        this.allFeedback = response.data
      })
    },
  },
  created() {
    this.getFeedback()
  },
};
</script>

<style scoped>

</style>