<template>
  <div class="container">
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


import IssueFeedbackRelationService from "@/jiraDashboardServices/issueFeedbackRelationService";
import AddIssuesToFeedback from "@/components/jiraDashboardViews/dialogs/AddIssuesToFeedback.vue";
import IssueService from "@/jiraDashboardServices/issueService";

export default {
  components: {AddIssuesToFeedback},
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
      // issues: this.item,
      openIssuesDialog: false,
      listWithTore: false,
      feedback: this.item,
      searchIssues: "",
      searchToreIssues: "",
      assignedIssues: [],
      assignedToreIssues: [],
      tempIssues: [],
      tempIssuesTore: [],
    }
  },
  computed: {
    getIssues() {
      if (this.search !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedIssues = this.tempIssues
        return this.filterIssues
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedIssues = this.tempIssues
        return this.assignedIssues
      }
    },
    getToreIssues() {
      if (this.search !== "") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedToreIssues = this.tempIssuesTore
        return this.filterToreIssues
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.assignedToreIssues = this.tempIssuesTore
        return this.assignedToreIssues
      }
    },
    filterIssues() {
      return this.assignedIssues.filter(item => {
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
      return this.assignedToreIssues.filter(item => {
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
      IssueService.getAssignedIssues(this.feedback.id).then((response) => {
        console.log("response.data")
        console.log(response.data)
        this.assignedIssues = response.data
        this.tempIssues = response.data
      })
    },
    getAssignedToreIssues(){
      IssueService.getToreAssignedIssues(this.feedback.id).then((response) => {
        console.log("response.data")
        console.log(response.data)
        this.assignedToreIssues = response.data
        this.tempIssuesTore = response.data
      })
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
    deleteIssue(item) {
      IssueFeedbackRelationService.deleteIssueFeedbackRelation(item.key, this.feedback.id)
          .then((response) => {
            console.log(response.data);
            this.getAssignedIssues()
          })
          .catch((error) => {
            console.error(error);
          });
    },
    deleteToreIssue(item) {
      IssueFeedbackRelationService.deleteToreIssueFeedbackRelation(item.key, this.feedback.id)
          .then((response) => {
            console.log(response.data);
            this.getAssignedToreIssues()
          })
          .catch((error) => {
            console.error(error);
          });
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
  top: 220px;
  left: 120px;
}

.back-button:hover {
  color: blue;
}

</style>