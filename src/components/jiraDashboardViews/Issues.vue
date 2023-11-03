<template>
  <div class="container">
    <v-dialog v-model="isLoadingData">
      <LoadingView/>
    </v-dialog>

    <div>
      <div class="import-elements">
        <LoadFeedbackFromDB class="element1"></LoadFeedbackFromDB>
        <v-btn dark color="blue" class="element2" @click="openImportDialog()"> Import Issues
        </v-btn>
        <v-dialog v-model="importDialog">
          <ImportJiraProject class="import-dialog" @toggleImport="toggleImport" :importDialog="importDialog"/>
          <v-btn dark color="black" @click="closeImportDialog()"
          >CLOSE
          </v-btn>
        </v-dialog>
      </div>

      <div>
        <v-btn dark color="blue" @click="assignFeedbackToIssues()"> Assign Feedback to Issues
        </v-btn>
        <v-btn dark color="blue" @click="assignFeedbackToIssueWithTore()"> Assign Feedback to Issues with TORE classification
        </v-btn>
      </div>

      <p v-if="!isProjectSelected" class="warning">{{ warning }}</p>
    </div>

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
                  <v-checkbox
                      :input-value="item.selectedToAssign"
                      @input="onSelect(!selectedProjects.includes(item))"
                  ></v-checkbox>
                  {{ item.projectName }}
                  <i class="material-icons delete-icon" @click.stop="deleteProject(item)">delete</i>
                </div>
              </template>
            </v-select>
          </div>
          <div class="search-in-table">
            <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
          </div>
          <div class="service-button">
            <v-btn  @click="deleteAllIssues()" small>
              <i class="material-icons delete-icon">delete_sweep</i>
            </v-btn>
          </div>
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="getIssues"
            item-key="key"
            class="elevation-1"
            :total-items="$store.state.totalIssueItems"
            rows-per-page-text="Issues per page"
            :rows-per-page-items="pagination.rowsPerPageItems"
            :pagination.sync="pagination"
            @update:pagination.self="getAllIssues()"
            :no-data-text="warning"
        >
          <template v-slot:items="props">
            <tr @click="showDetails(props.item)">
              <td>{{ props.item.key }}</td>
              <td>{{ props.item.summary }}</td>
              <td>{{ props.item.description }}</td>
              <td>{{ props.item.issueType }}</td>
              <td>{{ props.item.projectName }}</td>
              <td>
                <i class="material-icons delete-icon"  @click.stop="deleteIssue(props.item)">delete</i>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </div>

  </div>
</template>

<script>


import LoadFeedbackFromDB from "@/components/jiraDashboardViews/LoadFeedbackFromDB.vue";
import ImportJiraProject from "@/components/jiraDashboardViews/ImportJiraProject.vue";
import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

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
      pagination: {
        sortBy: "key",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      search: "",
      selectedProjects: [],
      warning: "Select or import a project",
      isProjectSelected: true,
      importDialog: false,
    }
  },
  components:{
    LoadFeedbackFromDB,
    ImportJiraProject,
    LoadingView
  },
  methods: {
    toggleImport(value) {
      this.importDialog = value;
      this.getAllIssues()
      this.getProjectNames()
    },
    async deleteAllIssues() {
      await this.$store.dispatch("actionDeleteAllIssues")
      this.getAllIssues()
      this.getProjectNames()
    },
    closeImportDialog(){
      this.importDialog = false
      this.getProjectNames()
      this.getAllIssues()
    },
    openImportDialog(){
      this.importDialog = true
    },
    async deleteIssue(item){
      try {
        const projectName = item.projectName
        const issueKey = item.key
        await this.$store.dispatch("actionDeleteIssue", {projectName, issueKey});
        this.getAllIssues();
        this.getProjectNames();
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async deleteProject(item) {
      try {
        await this.$store.dispatch("actionDeleteProject", item.projectName);
        this.getAllIssues();
        this.getProjectNames();
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async assignFeedbackToIssues(){
      if (this.$store.state.issues.length < 1){
        this.isProjectSelected = false
      }else{
        this.isProjectSelected = true
        await this.$store.dispatch("actionAssignIssuesToFeedback")
        this.getAllIssues()
      }
    },
    async assignFeedbackToIssueWithTore(){
      if (this.$store.state.issues.length < 1){
        this.isProjectSelected = false
      }else {
        this.isProjectSelected = true
        await this.$store.dispatch("actionToreAssignIssuesToFeedback")
        this.getAllIssues()
      }
    },
    showDetails(item) {
      this.$router.push({ name: 'assigned_feedback', params: { item: item } });
    },
    getAllIssues() {
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      this.$store.dispatch("actionGetAllIssues", {page, size})
    },
    getProjectNames() {
      this.$store.dispatch("actionGetImportedJiraProjects")
    },
    async filterIssuesByProjectName() {
      console.log("selectedProjects")
      console.log(this.selectedProjects)
      let selectedProjects = this.selectedProjects
      const selectedProjectsArray = selectedProjects.map(item => {
        return item;
      });
      await this.$store.dispatch("actionFilterIssuesToAssign", {selectedProjectsArray})
      this.getProjectNames()
      this.getAllIssues()
    },
  },
  computed: {
    isLoadingData(){
      return this.$store.state.isLoadingData
    },
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
        return this.filterIssues
      } else {
        return this.$store.state.issues
      }
    },
    filterIssues() {
      return this.$store.state.issues.filter(issue => {
        const summary = issue.summary || "";
        const key = issue.key || "";
        const description = issue.description || "";
        const issueType = issue.issueType || "";
        const projectName = issue.projectName || "";
        return summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || description.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      });
    },
  },
  activated() {
    this.getAllIssues()
    this.getProjectNames()
  },

}
</script>

<style>
.service-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
.import-dialog{
  background-color: white;
}
.import-elements {
  display: flex;
  justify-content: space-between;
}
.element1 {
  flex: 0.7;
}
.element2 {
  flex: 0.1;
}
.select-projects{
  display: flex;
  align-items: center;
  justify-content: space-between;
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
p {
  font-weight: bold;
}
.delete-icon {
  color: red;
}
.import-dialog {
  background-color: white;
  height: 300px;
}
</style>