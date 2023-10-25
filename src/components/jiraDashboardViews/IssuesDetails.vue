<template>
  <div class="container">
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <h2>Issue Key: {{ issue.key }}</h2>
    <v-card class="table-header">
      <v-card-title>
        <h3>Assigned Feedback</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchFeedback" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn class="add-button" @click="openAddDialog" small>
          <i class="material-icons add-icon" >add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="getAssignedFeedbackFilter"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteFeedback(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-card-title>
        <h3>Assigned Feedback with TORE classification</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchToreFeedback" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn class="add-button" @click="openAddDialogWithTore">
          <i class="material-icons add-icon">add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="getAssignedToreFeedbackFilter"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteToreFeedback(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <AddFeedbackToIssue :listWithTore="listWithTore" :openFeedbackDialog="openFeedbackDialog" :issue="issue" @toggleFeedback="toggleFeedback"/>
  </div>
</template>

<script>


import AddFeedbackToIssue from "@/components/jiraDashboardViews/dialogs/AddFeedbackToIssue.vue";
import FeedbackService from "@/jiraDashboardServices/feedbackService";
import IssueFeedbackRelationService from "@/jiraDashboardServices/issueFeedbackRelationService";

export default {
  props: ['item'],
  data() {
    return {
      issue: this.item,
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
      searchFeedback: "",
      searchToreFeedback: "",
      assignedFeedback: [],
      assignedToreFeedback: [],
      tempFeedback: [],
      tempFeedbackTore: []
    }
  },
  components:{
    AddFeedbackToIssue,
  },
  computed:{
    getAssignedFeedbackFilter() {
      if (this.searchFeedback !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedFeedback = this.tempFeedback
        return this.filterFeedbackFromIssue
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedFeedback = this.tempFeedback
        return this.assignedFeedback
      }
    },
    getAssignedToreFeedbackFilter() {
      if (this.searchToreFeedback !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedToreFeedback = this.tempFeedbackTore
        return this.filterToreFeedbackFromIssue
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedToreFeedback = this.tempFeedbackTore
        return this.assignedToreFeedback
      }
    },
    filterFeedbackFromIssue() {
      return this.assignedFeedback.filter(item => {
        const similarityString = item.similarity.toString();
        return item.id.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
      })
    },
    filterToreFeedbackFromIssue() {
      return this.assignedToreFeedback.filter(item => {
        const similarityString = item.similarity.toString();
        return item.id.toLowerCase().indexOf(this.searchToreFeedback.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.searchToreFeedback.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchToreFeedback.toLowerCase()) > -1
      })
    },
  },
  methods:{
    goBack() {
      this.$router.go(-1);
    },
    getAssignedFeedback(){
      FeedbackService.getAssignedFeedback(this.issue.key).then((response) => {
        console.log(response.data)
        this.assignedFeedback = response.data
        this.tempFeedback = response.data
      })
    },
    getAssignedToreFeedback(){
      FeedbackService.getAssignedToreFeedback(this.issue.key).then((response) => {
        console.log(response.data)
        this.assignedToreFeedback = response.data
        this.tempFeedbackTore = response.data
      })
    },
    deleteFeedback(item) {
      IssueFeedbackRelationService.deleteIssueFeedbackRelation(this.issue.key, item.id)
          .then((response) => {
            console.log(response.data);
            // this.issue = response.data
            this.getAssignedFeedback()
          })
          .catch((error) => {
            console.error(error);
          });
    },
    deleteToreFeedback(item) {
      IssueFeedbackRelationService.deleteToreIssueFeedbackRelation(this.issue.key, item.id)
          .then((response) => {
            console.log(response.data);
            this.getAssignedToreFeedback()
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
      this.getAssignedFeedback()
      this.getAssignedToreFeedback()
    },
  },
  mounted() {
    this.getAssignedFeedback()
    this.getAssignedToreFeedback()
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
  top: 220px;
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