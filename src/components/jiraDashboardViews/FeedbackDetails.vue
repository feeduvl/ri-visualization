<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <h2>Feedback: {{feedback.id}}</h2>
    <v-card class="table-header">
      <v-card-title>
        <h3>Assigned Issues</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchIssues" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn class="add-button" @click="openAddDialog" small>
          <i class="material-icons add-icon" >add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="getIssues"
      >
        <template v-slot:items="props">
          <td>{{ props.item.key }}</td>
          <td>{{ props.item.summary }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteIssue(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-card-title>
        <h3>Assigned Issues with TORE classification</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchToreIssues" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <v-btn class="add-button" @click="openAddDialogWithTore">
          <i class="material-icons add-icon">add</i>
        </v-btn>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="getToreIssues"
      >
        <template v-slot:items="props">
          <td>{{ props.item.key }}</td>
          <td>{{ props.item.summary }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="deleteToreIssue(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <AddIssuesToFeedback :listWithTore="listWithTore" :openIssuesDialog="openIssuesDialog" :feedback="feedback" @toggleIssues="toggleIssues"/>
  </div>
</template>

<script>



import AddIssuesToFeedback from "@/components/jiraDashboardViews/dialogs/AddIssuesToFeedback.vue";
import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

export default {
  components: {
    AddIssuesToFeedback,
    LoadingView
  },
  props: ['item'],
  data(){
    return{
      headers: [
        {text: "Issue Name", value: "key"},
        {text: "Summary", value: "summary"},
        // {text: "Description", value: "description"},
        // {text: "Issue Type", value: "issueType"},
        {text: "Similarity", value: "similarity"},
      ],
      openIssuesDialog: false,
      listWithTore: false,
      feedback: this.item,
      searchIssues: "",
      searchToreIssues: "",
    }
  },
  watch: {
    item(newItem, oldItem) {
      if (newItem !== oldItem) {
        console.log("new item");
        this.feedback = newItem;
        this.getAssignedIssues();
        this.getAssignedToreIssues();
      }
    }
  },
  computed: {
    isLoadingData(){
      return this.$store.state.isLoadingData
    },
    getIssues() {
      if (this.search !== "") {
        return this.filterIssues
      } else {
        return this.$store.state.assignedIssues
      }
    },
    getToreIssues() {
      if (this.search !== "") {
        return this.filterToreIssues
      } else {
        return this.$store.state.toreAssignedIssues
      }
    },
    filterIssues() {
      return this.$store.state.assignedIssues.filter(item => {
        const similarityString = item.similarity.toString();
        return item.summary.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
        // || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
    filterToreIssues() {
      return this.$store.state.toreAssignedIssues.filter(item => {
        const similarityString = item.similarity.toString();
        return item.summary.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
        // || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        // || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  methods: {
    getAssignedIssues(){
      this.$store.dispatch("actionGetAssignedIssuesFromFeedback", this.feedback.id)
    },
    getAssignedToreIssues(){
      this.$store.dispatch("actionGetToreAssignedIssuesFromFeedback", this.feedback.id)
    },
    openAddDialogWithTore() {
      this.listWithTore = true
      this.openIssuesDialog = true;
    },
    openAddDialog(){
      this.listWithTore = false
      this.openIssuesDialog = true
    },
    toggleIssues(value) {
      this.openIssuesDialog = value;
      this.getAssignedIssues()
      this.getAssignedToreIssues()
    },
    goBack() {
      this.$router.go(-1);
    },
    async deleteIssue(item) {
      const feedbackId = this.feedback.id
      const issueKey = item.key
      await this.$store.dispatch("actionDeleteIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedIssues()
    },
    async deleteToreIssue(item) {
      const feedbackId = this.feedback.id
      const issueKey = item.key
      await this.$store.dispatch("actionDeleteToreIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedToreIssues()
    },
  },
  mounted() {
    this.getAssignedIssues()
    this.getAssignedToreIssues()
  }
};

</script>

<style scoped>
h2{
  text-align: center;
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
  padding: 10px 20px;
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

</style>