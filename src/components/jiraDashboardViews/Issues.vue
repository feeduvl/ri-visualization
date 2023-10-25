<template>
  <div class="container">

    <LoadFeedbackFromDB></LoadFeedbackFromDB>

    <div>
      <v-btn dark color="blue" @click="assignFeedbackToIssues()"> Assign Feedback to Issues
      </v-btn>
      <v-btn dark color="blue" @click="assignFeedbackToIssueWithTore()"> Assign Feedback to Issues with TORE classification
      </v-btn>
    </div>

    <p v-if="!isProjectSelected" class="warning">{{ warning }}</p>

    <div class="main-issue-table">
      <v-card class="v-card">
        <v-card-title>
          <h2>Jira Issues</h2>
          <div class="filter-by-project">
            <v-select
                v-model="selectedProjects"
                :items="getImportedJiraProjects"
                label="Select Projectname"
                item-text="projectName"
                multiple
                dense
                @change="filterIssuesByProjectName()"
            >
              <template v-slot:item="{ item }" >
                <div class="select-projects" >
                  <v-checkbox v-model="item.selectedToAssign"></v-checkbox>
                  {{ item.projectName }}
                  <v-btn class="delete-project">
                    <i class="material-icons delete-icon" @click.stop="deleteProject(item)">delete</i>
                  </v-btn>
                </div>
              </template>
            </v-select>
          </div>
          <div class="search-in-table">
            <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
          </div>
        </v-card-title>
        <v-data-table :headers="headers" :items="getIssues" item-key="key" class="elevation-1"
                      :total-items="totalItems" rows-per-page-text="Issues per page"
                      :rows-per-page-items="pagination.rowsPerPageItems" :pagination.sync="pagination"
                      @update:pagination.self="getAllIssues()" :no-data-text="warning">
          <template v-slot:items="props">
            <tr @click="showDetails(props.item)">
              <td>{{ props.item.key }}</td>
              <td>{{ props.item.summary }}</td>
              <td>{{ props.item.description }}</td>
              <td>{{ props.item.issueType }}</td>
              <td>{{ props.item.projectName }}</td>
              <td>
                <v-btn @click.stop="deleteIssue(props.item)">
                  <i class="material-icons delete-icon" >delete</i>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <v-dialog v-model="loadData">
      <div class="overlay">
        <v-progress-circular indeterminate size="64">
          Loading...
        </v-progress-circular>
        <v-btn dark color="black" @click="closeDialogLoadAssignment()"
        >CLOSE
        </v-btn>
      </div>
    </v-dialog>
  </div>
</template>

<script>



import LoadFeedbackFromDB from "@/components/jiraDashboardViews/LoadFeedbackFromDB.vue";
import IssueService from "@/jiraDashboardServices/issueService";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Issues",
  data() {
    return {
      headersIssueTypes: [
        {text: "Issue Type", value: "issueType"},
      ],
      headers: [
        {text: "Issue Name", value: "key"},
        {text: "Summary", value: "summary"},
        {text: "Description", value: "description"},
        {text: "Issue Type", value: "issueType"},
        {text: "Project Name", value: "projectName"},
      ],
      issues: [],
      tempIssueForFilter: [],
      search: "",
      filterProjectName: "",
      totalItems: 0,
      loadData: false,
      feedback: [],
      projectNames: [],
      selectedProjects: [],
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      warning: "Select or import a project",
      isProjectSelected: true,
    }
  },
  components:{
    LoadFeedbackFromDB,
  },
  methods: {
    deleteIssue(item){
      IssueService.deleteIssue(item.projectName, item.key)
          .then((response) => {
            console.log(response.data);
            this.getAllIssues()
          })
          .catch((error) => {
            console.error(error);
          });
    },
    deleteProject(item) {
      IssueService.deleteProject(item.projectName)
          .then((response) => {
            console.log(response.data);
            this.getAllIssues()
            this.getProjectNames()
          })
          .catch((error) => {
            console.error(error);
          });
    },
    assignFeedbackToIssues(){
      if (this.issues.length < 1){
        this.isProjectSelected = false
      }else{
        this.isProjectSelected = true
        this.$store.dispatch("actionAssignIssuesToFeedback")
        this.getAllIssues()
      }
    },
    assignFeedbackToIssueWithTore(){
      if (this.issues.length < 1){
        this.isProjectSelected = false
      }else {
        this.isProjectSelected = true
        this.loadData = true
        this.$store.dispatch("actionToreAssignIssuesToFeedback")
        this.getAllIssues()
      }
    },
    showDetails(item) {
      this.$router.push({name: 'assigned_feedback', params: {item: item}});
    },
    closeDialogLoadAssignment() {
      this.loadData = false;
    },
    getAllIssues() {
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      this.$store.dispatch("actionGetAllIssues", {page, size})
    },
    getProjectNames() {
      this.$store.dispatch("actionGetImportedJiraProjects")
    },
    filterIssuesByProjectName() {
      IssueService.filterIssuesToAssign(this.selectedProjects).then((response) => {
        console.log(response.data)
        this.getAllIssues()
        this.getProjectNames()
      })
    },
  },
  computed: {
    getImportedJiraProjects(){
      // eslint-disable-next-line
      this.selectedProjects = []
      this.$store.state.importedJiraProjects.forEach(project => {
        if (project.selectedToAssign === true){
          this.selectedProjects.push(project.projectName)
        }
      })
      return this.$store.state.importedJiraProjects
    },
    getIssues() {
      if (this.search !== "") {
        return this.$store.state.issues.filter(issue => {
          const summary = issue.summary ?? "";
          const key = issue.key ?? "";
          const description = issue.description ?? "";
          const issueType = issue.issueType ?? "";
          const projectName = issue.projectName ?? "";
          return summary.toLowerCase().includes(this.search)
              || key.toLowerCase().includes(this.search)
              || description.toLowerCase().includes(this.search)
              || issueType.toLowerCase().includes(this.search)
              || projectName.toLowerCase().includes(this.search);
        });
      } else {
        return this.$store.state.issues
      }
    },
    filterIssuesToSelect() {
      return this.issuesToImportOrAdd.filter(item => {
        return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    }
  },
  mounted() {
    this.getAllIssues()
    this.getProjectNames()
  },

}
</script>

<style>
.delete-project{
  margin-left: 100px
}
.select-projects{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.select-container{
  display: flex;
  justify-content: space-between;
  width: 60%;
}
.select-annotation,
.select-feedback {
  width: 48%;
}
.warning{
  color: red;
}
.filter-by-project, .search-in-table{
  margin-left: 30px;
}
.search-in-table{
  width: 500px;
}
.main-issue-table{
  margin-top: 10px;
}
.overlay {
  margin-top: 20px;
  margin-left: 45%;
  width: 50%;
  height: 50%;
}
p {
  font-weight: bold;
}
</style>