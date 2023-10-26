<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>
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
import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

export default {
  props: ['item'],
  data() {
    return {
      header: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
        {text: "Similarity", value: "similarity"},
      ],
      headerDialog: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
      issue: this.item,
      listWithTore: false,
      openFeedbackDialog: false,
      searchFeedback: "",
      searchToreFeedback: "",
    }
  },
  components:{
    AddFeedbackToIssue,
    LoadingView,
  },
  computed:{
    isLoadingData(){
      return this.$store.state.isLoadingData
    },
    getAssignedFeedbackFilter() {
      if (this.searchFeedback !== "") {
        return this.filterFeedbackFromIssue
      } else {
        return this.$store.state.assignedFeedback
      }
    },
    getAssignedToreFeedbackFilter() {
      if (this.searchToreFeedback !== "") {
        return this.filterToreFeedbackFromIssue
      } else {
        return this.$store.state.toreAssignedFeedback
      }
    },
    filterFeedbackFromIssue() {
      return this.$store.state.assignedFeedback.filter(item => {
        const similarityString = item.similarity.toString();
        return item.id.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchFeedback.toLowerCase()) > -1
      })
    },
    filterToreFeedbackFromIssue() {
      return this.$store.state.toreAssignedFeedback.filter(item => {
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
      this.$store.dispatch("actionGetAssignedFeedback", this.issue.key)
    },
    getAssignedToreFeedback(){
      this.$store.dispatch("actionGetToreAssignedFeedback", this.issue.key)
    },
    async deleteFeedback(item) {
      const feedbackId = item.id
      const issueKey = this.issue.key
      await this.$store.dispatch("actionDeleteIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedFeedback()
    },
    async deleteToreFeedback(item) {
      const feedbackId = item.id
      const issueKey = this.issue.key
      await this.$store.dispatch("actionDeleteToreIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedToreFeedback()
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