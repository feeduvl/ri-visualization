<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <div>
      <v-dialog v-model="deleteOneRequirementDialog" :max-width="300" class="delete-all-feedback">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteIssue()">
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
      <v-dialog v-model="deleteOneTORERequirementDialog" :max-width="300" class="delete-all-feedback">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteToreIssue()">
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
      <v-dialog v-model="deleteAllRequirementsDialog" :max-width="300" class="delete-all-feedback">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteAssignedIssuesForFeedback()">
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
      <v-dialog v-model="deleteAllTORERequirementsDialog" :max-width="300" class="delete-all-feedback">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteToreAssignedIssuesForFeedback()">
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
    <div class="description-feedback-detail">
      <h3>Feedback: <span>{{feedback.id}}</span></h3>
      <h3>Feedback Text: <span>{{feedback.text}}</span></h3>
    </div>
    <v-card class="table-header">
      <v-card-title>
        <h3>Related Requirements</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchIssues" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="service-button">
          <v-btn  @click="openDeleteAllAssignmentsDialog()" small>
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
          rows-per-page-text="Requirements per page"
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
            <i class="material-icons delete-icon" @click="openDeleteOneAssignmentDialog(props.item)">delete</i>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-card>
      <v-card-title>
        <h3>Related Requirements with TORE</h3>
        <div class="search-in-table">
          <v-text-field v-model="searchToreIssues" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="service-button">
          <v-btn  @click="openDeleteAllTOREAssignmentsDialog()" small>
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
          rows-per-page-text="Requirements per page"
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
            <i class="material-icons delete-icon" @click="openDeleteOneTOREAssignmentDialog(props.item)">delete</i>
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
        {text: "Requirement Name", value: "key", sortable: false},
        {text: "Summary", value: "summary", sortable: false},
        {text: "Description", value: "description", sortable: false},
        {text: "Similarity", value: "similarity", sortable: false},
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
      warning: "No requirements assigned",
      openIssuesDialog: false,
      listWithTore: false,
      feedback: this.item,
      searchIssues: "",
      searchToreIssues: "",
      deleteOneRequirementDialog: false,
      requirementToDelete: [],
      deleteOneTORERequirementDialog: false,
      requirementToDeleteTore: [],
      deleteAllRequirementsDialog: false,
      deleteAllTORERequirementsDialog: false,
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
        const summary = item.summary || "";
        const key = item.key || "";
        const description = item.description || "";
        const similarity = item.similarity || "";
        return summary.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
            || key.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
            || description.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
            || similarity.toLowerCase().indexOf(this.searchIssues.toLowerCase()) > -1
      })
    },
    filterToreIssues() {
      return this.$store.state.toreAssignedIssues.filter(item => {
        const summary = item.summary || "";
        const key = item.key || "";
        const description = item.description || "";
        const similarity = item.similarity || "";
        return summary.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || key.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || description.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
            || similarity.toLowerCase().indexOf(this.searchToreIssues.toLowerCase()) > -1
      })
    },
  },
  methods: {
    dontDelete(){
      this.deleteOneRequirementDialog = false
      this.deleteOneTORERequirementDialog = false
      this.deleteAllRequirementsDialog = false
      this.deleteAllTORERequirementsDialog = false
    },
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
      this.deleteAllRequirementsDialog = false
    },
    openDeleteAllAssignmentsDialog() {
      this.deleteAllRequirementsDialog = true
    },
    openDeleteAllTOREAssignmentsDialog() {
      this.deleteAllTORERequirementsDialog = true
    },
    async deleteToreAssignedIssuesForFeedback() {
      await this.$store.dispatch("actionDeleteToreAssignedIssuesForFeedback", this.feedback.id)
      this.getAssignedToreIssues()
      this.deleteAllTORERequirementsDialog = false
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
    async deleteIssue() {
      const feedbackId = this.feedback.id
      const issueKey = this.requirementToDelete.key
      await this.$store.dispatch("actionDeleteIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedIssues()
      this.deleteOneRequirementDialog = false
      this.requirementToDelete = []
    },
    openDeleteOneAssignmentDialog(item) {
      this.deleteOneRequirementDialog = true
      this.requirementToDelete = item
    },
    openDeleteOneTOREAssignmentDialog(item) {
      this.deleteOneTORERequirementDialog = true
      this.requirementToDeleteTore = item
    },
    async deleteToreIssue() {
      const feedbackId = this.feedback.id
      const issueKey = this.requirementToDeleteTore.key
      await this.$store.dispatch("actionDeleteToreIssueFeedbackRelation", {issueKey, feedbackId})
      this.getAssignedToreIssues()
      this.deleteOneTORERequirementDialog = false
      this.requirementToDeleteTore = []
    },
  },
};

</script>

<style scoped>
.description-feedback-detail{
  text-align: center;
}
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