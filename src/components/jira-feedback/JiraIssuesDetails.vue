<template>
  <div class="container">
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <h2>Issue Key: {{ item.key }}</h2>
    <v-card class="table-header">
      <v-card-title>
        <h3>Assigned Feedback</h3>
        <v-btn class="add-button" @click="openAddDialog" small>
          <i class="material-icons add-icon" >add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="item.assigned_feedback"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteItem(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-card-title>
        <h3>Assigned Feedback with TORE classification</h3>
        <v-btn class="add-button" @click="openAddDialogWithTore">
          <i class="material-icons add-icon">add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="feedback.assigned_feedback_with_tore"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteItemWithTore(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <AddFeedbackToList :listWithTore="listWithTore" :openFeedbackDialog="openFeedbackDialog" :feedback="feedback" @toggleFeedback="toggleFeedback"/>
  </div>
</template>

<script>

import AddFeedbackToList from "@/components/jira-feedback/dialogs/AddFeedbackToList.vue";
import FeedbackService from "@/feedback-service";

export default {
  props: ['item'],
  data() {
    return {
      allFeedback: [],
      feedback: this.item,
      selectedFeedback: [],
      listWithTore: false,
      header: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
        {text: "Similarity", value: "similarity"},
      ],
      headerDialog: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
      feedbackToAdd: [],
      openFeedbackDialog: false,
    }
  },
  components:{
    AddFeedbackToList,
  },
  methods:{
    goBack() {
      this.$router.go(-1);
    },
    deleteItem(item) {
      FeedbackService.deleteFeedback(this.item.key, item.id)
          .then((response) => {
            console.log(response.data.updated_feedback);
            this.feedback.assigned_feedback = response.data.updated_feedback;
            this.$forceUpdate();
          })
          .catch((error) => {
            console.error(error);
          });
    },
    deleteItemWithTore(item) {
      FeedbackService.deleteToreFeedback(this.item.key, item.id)
          .then((response) => {
            console.log(response.data.updated_feedback);
            this.feedback.assigned_feedback_with_tore = response.data.updated_feedback;
            this.$forceUpdate();
          })
          .catch((error) => {
            console.error(error);
          });
    },
    openAddDialogWithTore() {
      this.listWithTore = true
      this.openFeedbackDialog = true;
    },
    openAddDialog() {
      this.listWithTore = false
      this.openFeedbackDialog = true;
    },
    toggleFeedback(value) {
      this.openFeedbackDialog = value;
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
  }

};
</script>

<style scoped>
h2{
  text-align: center;
}
.table-header{
  margin-top: 30px;
  margin-bottom: 50px;
}
.container{
  margin-top: 20px;
}
.back-button {
  border: none;
  border-radius: 10px;
  padding: 10px 10px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: absolute;
  top: 130px;
  left: 120px;
}

.back-button:hover {
  color: blue;
}

.add-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
.delete-icon {
  color: red;
}
.add-icon {
  color: blue;
}
</style>