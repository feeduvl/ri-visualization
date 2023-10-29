<template>
  <div class="select-container">
    <div class="select-feedback">
      <v-select
          v-model="selectedFeedbackFileName"
          :items="getFeedbackFileNames"
          label="Select Feedback"
          @change="sendSelectedFeedbackName()"
      ></v-select>
    </div>
    <div class="select-annotation">
      <v-select
          v-model="selectedAnnotationFileName"
          :items="getAnnotationFileNames"
          label="Select Annotation"
          @change="sendSelectedAnnotationName()"
          :disabled="!selectedFeedbackFileName"
      ></v-select>
    </div>
  </div>
</template>

<script>

export default {
  name: "LoadFeedbackFromDB",
  data() {
    return {
      selectedFeedbackFileName: '',
      selectedAnnotationFileName: '',
    }
  },
  computed: {
    getFeedbackFileNames(){
      return this.$store.state.feedbackFileNames
    },
    getAnnotationFileNames(){
      return this.$store.state.annotationFileNames
    },
  },
  methods: {
    sendSelectedAnnotationName(){
      this.$store.dispatch("actionAssignToreCategoriesToFeedback", this.selectedAnnotationFileName)
    },
    sendSelectedFeedbackName(){
      this.$store.dispatch("actionSaveSelectedFeedback", this.selectedFeedbackFileName)
    },
    fetchFeedbackFileNames(){
      this.$store.dispatch("actionGetFeedbackNames")
    },
    fetchAnnotationFileNames(){
      this.$store.dispatch("actionGetAnnotationNames")
    },
  },
  mounted() {
    this.fetchFeedbackFileNames();
    this.fetchAnnotationFileNames();
  }
}


</script>

<style scoped>
.select-container{
  display: flex;
  justify-content: space-between;
  width: 60%;
}
.select-annotation,
.select-feedback {
  width: 48%;
}
</style>