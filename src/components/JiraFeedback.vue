<template>
  <div>
    <v-toolbar class="banner">
      <router-link :to="{ path: ROUTE_JIRA() }">Issues</router-link>
    </v-toolbar>
    <div>
      <v-select
          v-model="selectedFeedbackFileName"
          :items="feedbackFileNames"
          label="Select Feedback"
          @change="sendSelectedFeedbackName()"
      ></v-select>
      <v-select
          v-model="selectedAnnotationFileName"
          :items="annotationFileNames"
          label="Select Annotations"
          @change="sendSelectedAnnotationName()"
      ></v-select>
    </div>
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
  </div>
</template>

<script>

import FeedbackService from "@/feedback-service";
import {ROUTE_FEEDBACK, ROUTE_JIRA} from "@/routes";

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
    ROUTE_FEEDBACK() {
      return ROUTE_FEEDBACK
    },
    ROUTE_JIRA() {
      return ROUTE_JIRA
    },
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
      this.$router.push({ name: 'tore-feedback', params: { item: item } });
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


</style>