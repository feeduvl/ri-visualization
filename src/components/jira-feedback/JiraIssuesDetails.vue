<template>
  <div>
    <button class="back-button" @click="goBack">&lt; Back</button>
    <p>Issue Key: {{ item.key }}</p>
    <v-card>
      <v-card-title>
        <p>Assigned Feedback</p>
        <v-btn class="add-button" @click="openAddDialog" fab dark small right top>
          <v-icon>mdi-plus</v-icon>
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
            <v-btn @click="deleteItem(props.item)" icon>
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="openFeedback" max-width="800">
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
          <v-btn @click="addSelectedFeedback" color="primary">
            Add Selected Tore Feedback
          </v-btn>
          <v-btn @click="openFeedback = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title>
        <p>Assigned Feedback with TORE classification</p>
        <v-btn class="add-button" @click="openAddDialogWithTore" fab dark small top>
          <v-icon>mdi-plus</v-icon>
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
            <v-btn @click="deleteItemWithTore(props.item)" icon>
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="openFeedbackWithTore" max-width="800">
      <v-card>
        <v-card-title>Add Tore Feedback</v-card-title>
        <v-card-text>
          <v-data-table
              v-model="selectedToreFeedback"
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
          <v-btn @click="addSelectedToreFeedback" color="primary">
            Add Selected Feedback
          </v-btn>
          <v-btn @click="openFeedbackWithTore = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>

import FeedbackService from "@/services/FeedbackService";

export default {
  props: ['item'],
  data() {
    return {
      allFeedback: [],
      feedback: this.item,
      selectedFeedback: [],
      selectedToreFeedback: [],
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
      openFeedback: false,
      openFeedbackWithTore: false,
    }
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
      this.openFeedbackWithTore = true;
    },
    openAddDialog() {
      this.openFeedback = true;
    },
    addSelectedToreFeedback() {
      FeedbackService.addToreFeedback(this.item.key, this.selectedToreFeedback)
          .then((response) => {
            console.log(response.data.updated_feedback);
            this.feedback.assigned_feedback_with_tore = response.data.updated_feedback
            this.openFeedbackWithTore = false;
          })
          .catch((error) => {
            console.error(error);
          });
    },
    addSelectedFeedback() {
      FeedbackService.addFeedback(this.item.key, this.selectedFeedback)
          .then((response) => {
            console.log(response.data.updated_feedback);
            this.feedback.assigned_feedback = response.data.updated_feedback
            this.openFeedback = false;
          })
          .catch((error) => {
            console.error(error);
          });
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
.back-button {
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: absolute;
  top: 100px;
  left: 20px;
}

.back-button:hover {
  background-color: #0056b3;
}

.add-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>