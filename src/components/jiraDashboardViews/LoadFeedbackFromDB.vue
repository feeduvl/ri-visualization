<template>
  <div class="select-container">
    <div class="select-feedback">
      <v-select
          v-model="selectedFeedbackFileName"
          :items="feedbackFileNames"
          label="Select Feedback"
          @change="sendSelectedFeedbackName()"
      ></v-select>
    </div>
    <div class="select-annotation">
      <v-select
          v-model="selectedAnnotationFileName"
          :items="annotationFileNames"
          label="Select Annotation"
          @change="sendSelectedAnnotationName()"
      ></v-select>
    </div>
  </div>
</template>

<script>


import FeedbackService from "@/jiraDashboardServices/feedbackService";

export default {
  name: "LoadFeedbackFromDB",
  data() {
    return {
      selectedFeedbackFileName: '',
      feedbackFileNames:[],
      selectedAnnotationFileName: '',
      annotationFileNames:[],
    }
  },
  methods: {
    //am ende noch eine Bestätigung senden
    sendSelectedAnnotationName(){
      this.loadData = true
      FeedbackService.assignToreCategoriesToFeedback(this.selectedAnnotationFileName).then((response) => {
        this.feedback = response.data
        this.loadData = false
      })
    },
    sendSelectedFeedbackName(){
      this.loadData = true
      FeedbackService.saveSelectedFeedback(this.selectedFeedbackFileName).then((response) => {
        this.feedback = response.data
        this.loadData = false
      })
    },
    fetchFeedbackFileNames(){
      FeedbackService.getFeedbackNames().then((response) => {
        this.feedbackFileNames = response.data
      });
    },
    fetchAnnotationFileNames(){
      FeedbackService.getAnnotationsNames().then((response) => {
        this.annotationFileNames = response.data
      });
    },
  },
  created() {
    this.fetchFeedbackFileNames();
    this.fetchAnnotationFileNames();
  }
}


</script>

<style scoped>

</style>