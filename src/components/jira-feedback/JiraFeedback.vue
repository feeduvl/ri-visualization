<template>
  <div class="container">
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
            label="Select Annotations"
            @change="sendSelectedAnnotationName()"
        ></v-select>
      </div>
    </div>
    <v-card class="table-header">
      <v-card-title>
        <h2>Feedback</h2>
      </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="feedback"
      >
        <template v-slot:items="props">
          <tr @click="showDetails(props.item)">
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.text }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>


import FeedbackService from "@/feedback-service";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Feedback",
  data() {
    return {
      excelData: [],
      tableHeaders: [
        {text: "ID", value: "id"},
        {text: "Text", value: "text"}
      ],
      feedback: [],
      feedbackFileNames:[],
      selectedFeedbackFileName: '',
      annotationFileNames:[],
      selectedAnnotationFileName: '',
    }
  },
  methods: {
    sendSelectedFeedbackName(){
      FeedbackService.saveSelectedFeedback(this.selectedFeedbackFileName).then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    sendSelectedAnnotationName(){
      FeedbackService.assignToreCategoriesToFeedback(this.selectedAnnotationFileName).then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    getFeedback(){
      FeedbackService.getFeedback().then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    fetchFeedbackFileNames(){
      FeedbackService.getFeedbackNames().then((response) => {
        console.log(response.data)
        this.feedbackFileNames = response.data
      });
    },
    fetchAnnotationFileNames(){
      FeedbackService.getAnnotationsNames().then((response) => {
        console.log(response.data)
        this.annotationFileNames = response.data
      });
    },
    showDetails(item) {
      this.$router.push({ name: 'tore_feedback', params: { item: item } });
    },
  },
  created() {
    this.fetchFeedbackFileNames();
    this.fetchAnnotationFileNames();
    this.getFeedback();
  },
}
</script>

<style scoped>
.table-header{
  margin-top: 20px;
}

.select-container{
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.select-annotation,
.select-feedback {
  width: 48%; /* Oder eine andere Breite, um Platz für den Abstand zu lassen */
}
.container{
  width: 90%;
  margin-top: 20px;
}

</style>