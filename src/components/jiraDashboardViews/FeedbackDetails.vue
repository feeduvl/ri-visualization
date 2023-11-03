<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <h3>Feedback: <span>{{feedback.id}}</span></h3>
    <h3>Feedback Text: <span>{{feedback.text}}</span></h3>
    <v-card class="table-header">
      <v-card-title>
        <h3>Assigned Issues</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchIssues" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="service-button">
          <v-btn  @click="deleteAssignedIssuesForFeedback()" small>
            <i class="material-icons delete-icon">delete_sweep</i>
          </v-btn>
          <v-btn @click="openAddDialog" small>
            <i class="material-icons add-icon">add</i>
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="getIssues"
          item-key="key"
          class="elevation-1"
          :total-items="$store.state.totalAssignedIssueItems"
          rows-per-page-text="Issues per page"
          :rows-per-page-items="pagination.rowsPerPageItems"
          :pagination.sync="pagination"
          @update:pagination.self="getAssignedIssues()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <td>{{ props.item.key }}</td>
          <td>{{ props.item.summary }}</td>
          <td>{{ props.item.description }}</td>
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
        <div class="service-button">
          <v-btn  @click="deleteToreAssignedIssuesForFeedback()" small>
            <i class="material-icons delete-icon">delete_sweep</i>
          </v-btn>
          <v-btn @click="openAddDialogWithTore" small>
            <i class="material-icons add-icon">add</i>
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="getToreIssues"
          item-key="key"
          class="elevation-1"
          :total-items="$store.state.totalToreAssignedIssueItems"
          rows-per-page-text="Issues per page"
          :rows-per-page-items="paginationTore.rowsPerPageItems"
          :pagination.sync="paginationTore"
          @update:pagination.self="getAssignedToreIssues()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <td>{{ props.item.key }}</td>
          <td>{{ props.item.summary }}</td>
          <td>{{ props.item.description }}</td>
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
  activated() {
    this.getAssignedIssues()
    this.getAssignedToreIssues()
  },
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
        {text: "Description", value: "description"},
        {text: "Similarity", value: "similarity"},
      ],
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      paginationTore: {
        sortBy: "id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      warning: "No Issues assigned",
      openIssuesDialog: false,
      listWithTore: false,
      feedback: this.item,
      searchIssues: "",
      searchToreIssues: "",
    }
  },
  watch: {
    item() {
      this.feedback = this.item;
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
            || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
    filterToreIssues() {
      return this.$store.state.toreAssignedIssues.filter(item => {
        const similarityString = item.similarity.toString();
        return item.summary.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || similarityString.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  methods: {
    getAssignedIssues(){
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      let feedbackId = this.feedback.id
      this.$store.dispatch("actionGetAssignedIssuesFromFeedback", {feedbackId, page, size})
    },
    getAssignedToreIssues(){
      let page = this.paginationTore.page
      let size = this.paginationTore.rowsPerPage
      let feedbackId = this.feedback.id
      this.$store.dispatch("actionGetToreAssignedIssuesFromFeedback", {feedbackId, page, size})
    },
    async deleteAssignedIssuesForFeedback() {
      await this.$store.dispatch("actionDeleteAssignedIssuesForFeedback", this.feedback.id)
      this.getAssignedIssues()
    },
    async deleteToreAssignedIssuesForFeedback() {
      await this.$store.dispatch("actionDeleteToreAssignedIssuesForFeedback", this.feedback.id)
      this.getAssignedToreIssues()
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
};

</script>

<style scoped>
span{
  font-weight: normal;
}
.service-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
h2{
  text-align: center;
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