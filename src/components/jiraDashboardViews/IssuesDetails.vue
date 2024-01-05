<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <div>
      <v-dialog v-model="deleteAllFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteAssignedFeedbackForIssue">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="deleteAllTOREFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all TORE related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteToreAssignedFeedbackForIssue">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="deleteOneFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteFeedback()">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="deleteOneTOREFeedbackDialog" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this TORE related feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteToreFeedback()">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDelete()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <div class="description-issue-detail">
      <h3>Requirement Key: <span>{{ issue.key }}</span></h3>
      <h3>Requirement Summary: <span>{{ issue.summary }}</span></h3>
      <h3>Requirement Description: <span>{{ issue.description }}</span></h3>
    </div>
    <v-card class="table-header">
      <v-card-title>
        <h3>Related Feedback</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchFeedback" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="service-button">
          <v-btn  @click="openDeleteAllAssignmentsDialog()" small>
            <i class="material-icons delete-icon">delete_sweep</i>
          </v-btn>
          <v-btn  @click="openAddDialog" small>
            <i class="material-icons add-icon" >add</i>
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="getAssignedFeedbackFilter"
          item-key="id"
          class="elevation-1"
          :total-items="$store.state.totalAssignedFeedbackItems"
          rows-per-page-text="Feedback per page"
          :rows-per-page-items="pagination.rowsPerPageItems"
          :pagination.sync="pagination"
          @update:pagination.self="getAssignedFeedback()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="openDeleteOneAssignmentDialog(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-card-title>
        <h3>Related Feedback with TORE</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchToreFeedback" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="service-button" >
          <v-btn  @click="openDeleteAllTOREAssignmentsDialog()" small>
            <i class="material-icons delete-icon">delete_sweep</i>
          </v-btn>
          <v-btn  @click="openAddDialogWithTore" small>
            <i class="material-icons add-icon">add</i>
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table
          :headers="header"
          :items="getAssignedToreFeedbackFilter"
          item-key="id"
          class="elevation-1"
          :total-items="$store.state.totalToreAssignedFeedbackItems"
          rows-per-page-text="Feedback per page"
          :rows-per-page-items="paginationTore.rowsPerPageItems"
          :pagination.sync="paginationTore"
          @update:pagination.self="getAssignedToreFeedback()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
          <td>{{ props.item.similarity }}</td>
          <td>
            <i class="material-icons delete-icon" @click="openDeleteOneTOREAssignmentDialog(props.item)">delete</i>
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
  activated() {
    this.getAssignedFeedback()
    this.getAssignedToreFeedback()
  },
  props: ['item'],
  data() {
    return {
      header: [
        { text: "Id", value: "id", sortable: false },
        { text: "Text", value: "text", sortable: false },
        { text: "Similarity", value: "similarity", sortable: false },
      ],
      pagination: {
        sortBy: "id",
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
      warning: "No Feedback assigned",
      issue: this.item,
      listWithTore: false,
      openFeedbackDialog: false,
      searchFeedback: "",
      searchToreFeedback: "",
      deleteOneFeedbackDialog: false,
      itemToDelete: [],
      deleteOneTOREFeedbackDialog: false,
      itemToDeleteTore: [],
      deleteAllFeedbackDialog: false,
      deleteAllTOREFeedbackDialog: false,
    }
  },
  components:{
    AddFeedbackToIssue,
    LoadingView,
  },
  watch: {
    item() {
      this.issue = this.item;
    }
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
    dontDelete(){
      this.deleteAllFeedbackDialog = false
      this.deleteAllTOREFeedbackDialog = false
      this.deleteOneTOREFeedbackDialog = false
      this.deleteOneFeedbackDialog = false
    },
    async deleteAssignedFeedbackForIssue() {
      await this.$store.dispatch("actionDeleteAssignedFeedbackForIssue", this.issue.key)
      this.getAssignedFeedback()
      this.deleteAllFeedbackDialog = false
    },
    openDeleteAllAssignmentsDialog() {
      this.deleteAllFeedbackDialog = true
    },
    openDeleteAllTOREAssignmentsDialog() {
      this.deleteAllTOREFeedbackDialog = true
    },
    async deleteToreAssignedFeedbackForIssue() {
      await this.$store.dispatch("actionDeleteToreAssignedFeedbackForIssue", this.issue.key)
      this.getAssignedToreFeedback()
      this.deleteAllTOREFeedbackDialog = false
    },
    goBack() {
      this.$router.go(-1);
    },
    getAssignedFeedback(){
      let issueKey = this.issue.key
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      this.$store.dispatch("actionGetAssignedFeedback", {issueKey, page, size})
    },
    getAssignedToreFeedback(){
      let issueKey = this.issue.key
      let page = this.paginationTore.page
      let size = this.paginationTore.rowsPerPage
      this.$store.dispatch("actionGetToreAssignedFeedback", {issueKey, page, size})
    },
    openDeleteOneAssignmentDialog(item) {
      this.deleteOneFeedbackDialog = true
      this.itemToDelete = item
    },
    async deleteFeedback() {
      const feedbackId = this.itemToDelete.id
      const issueKey = this.issue.key
      await this.$store.dispatch("actionDeleteIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedFeedback()
      this.deleteOneFeedbackDialog = false
      this.itemToDelete = []
    },
    openDeleteOneTOREAssignmentDialog(item) {
      this.deleteOneTOREFeedbackDialog = true
      this.itemToDeleteTore = item
    },
    async deleteToreFeedback() {
      const feedbackId = this.itemToDeleteTore.id
      const issueKey = this.issue.key
      await this.$store.dispatch("actionDeleteToreIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedToreFeedback()
      this.deleteOneTOREFeedbackDialog = false
      this.itemToDeleteTore = []
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
  top: 120px;
  left: 120px;
}
.back-button:hover {
  color: blue;
}
.service-button {
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
span{
  font-weight: normal;
}
.description-issue-detail{
  text-align: center;
}
</style>