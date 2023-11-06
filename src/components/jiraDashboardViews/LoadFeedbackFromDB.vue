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
      selectedFeedbackFileName: this.$store.state.selectedFeedback,
      selectedAnnotationFileName: '',
    }
  },
  computed: {
    getFeedbackFileNames(){
      // eslint-disable-next-line
      this.selectedFeedbackFileName = this.$store.state.selectedFeedback
      return this.$store.state.feedbackFileNames
    },
    getAnnotationFileNames(){
      // eslint-disable-next-line
      this.selectedAnnotationFileName = this.$store.state.selectedAnnotation
      return this.$store.state.annotationFileNames
    },
  },
  methods: {
    sendSelectedAnnotationName(){
      let selectedFeedbackFileName = this.$store.state.selectedFeedback
      let selectedAnnotationFileName = this.selectedAnnotationFileName
      this.$store.dispatch("actionAssignToreCategoriesToFeedback", {selectedFeedbackFileName, selectedAnnotationFileName})
    },
    sendSelectedFeedbackName(){
      this.$store.dispatch("actionSaveSelectedFeedback", this.selectedFeedbackFileName)
    },
    fetchFeedbackFileNames(){
      this.$store.dispatch("actionGetFeedbackNames")
    },
    fetchAnnotationFileNames(){
      if(this.selectedFeedbackFileName){
        this.$store.dispatch("actionGetAnnotationNames", this.selectedFeedbackFileName)
      }else{
        return []
      }
    },
  },
  watch: {
    selectedFeedbackFileName() {
      this.fetchAnnotationFileNames();
    }
  },
  activated() {
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