<template>
  <div class="container">
    <p class="headline-select-jira-project">
      Select already used projects or search for new:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="projectNameBySelect" :items="allAvailableJiraIssues"
                label="Select project" item-text="name"
      ></v-select>
      <v-btn dark color="blue" @click="getIssueTypesByProjectName()"> SEARCH
      </v-btn>
      <v-btn dark color="red" @click="deleteAllIssues()">Remove all Issues</v-btn>
    </div>
    <!--    <v-radio-group v-model="searchForProject">-->
    <!--      <div class="project-import">-->
    <!--        <v-select class="select-issueTypes" v-model="projectNameBySelect" :items="projectNames"-->
    <!--                  label="Select project" item-text="name" style="margin-left: 15px"-->
    <!--                  :disabled="searchForProject === '1'"></v-select>-->
    <!--        <v-radio value="0"></v-radio>-->
    <!--        <v-text-field v-model="projectNameBySearch" append-icon="mdi-magnify" label="type project key ..."-->
    <!--                      style="margin-left: 30px; width: 30%" :disabled="searchForProject === '0'">-->
    <!--        </v-text-field>-->
    <!--        <v-radio value="1"></v-radio>-->
    <!--        <v-btn dark color="blue" @click="getIssueTypesByProjectName()" style="margin-left: 40px"> SEARCH-->
    <!--        </v-btn>-->
    <!--      </div>-->
    <!--    </v-radio-group>-->
    <p v-if="!isProjectSelected" class="warning">{{ warning }}</p>

    <v-dialog v-model="openDialog" width="70%">
      <div class="overlay" v-if="loading">
        <v-progress-circular indeterminate size="64">
          Loading...
        </v-progress-circular>
        <v-btn dark color="black" @click="closeDialogIssues()"
        >CLOSE
        </v-btn>
      </div>
      <div v-if="!loading">
        <div v-if="dialogIssues">
          <v-card>
            <v-card-title>
              <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
            </v-card-title>
            <v-data-table v-model="selectedIssues" :headers="headers" :items="getIssuesToSelect" select-all
                          item-key="key" class="elevation-1" rows-per-page-text="Issues per page"
            >
              <template v-slot:items="props">
                <td>
                  <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                </td>
                <td>{{ props.item.key }}</td>
                <td>{{ props.item.summary }}</td>
                <td>{{ props.item.description }}</td>
                <td>{{ props.item.issueType }}</td>
                <td>{{ props.item.projectName }}</td>
              </template>
            </v-data-table>
          </v-card>
          <!--          <v-btn dark color="blue" @click="importSelectedIssues()" style="margin-left: 55%">Import Issues</v-btn>-->
          <v-btn dark color="blue" @click="addSelectedIssues()">Add Issues</v-btn>
          <v-btn dark color="black" @click="closeDialogIssues()">Close</v-btn>
        </div>
        <div v-if="dialogIssueTypes">
          <v-card>
            <v-card-title>
              choose the issue-types you want to show of project: {{ projectName }}
            </v-card-title>
            <v-data-table v-model="selectedIssuesTypes" :headers="headersIssueTypes" :items="getIssueTypes"
                          item-key="item" select-all class="elevation-1" rows-per-page-text="IssueTypes per page"
            >
              <template v-slot:items="props">
                <td>
                  <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                </td>
                <td>{{ props.item.item }}</td>
              </template>
            </v-data-table>
            <v-btn dark color="blue" @click="getIssuesByTypes()">Search</v-btn>
            <v-btn dark color="black" @click="closeDialogIssueTypes()">Close</v-btn>
          </v-card>
        </div>
      </div>

    </v-dialog>
  </div>
</template>

<script>


import IssueService from "@/jiraDashboardServices/issueService";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  data() {
    return {
      no_results_text: "test message",
      searchForProject: "0",
      projectNameBySelect: "",
      projectNames: [],
      issueTypes: [],
      issuesToImportOrAdd: [],
      projectNameBySearch: "",
      isProjectSelected: true,
      warning: "",
      projectName: "",
      dialogIssueTypes: false,
      dialogIssues: false,
      openDialog: false,
      loading: false,
      search: "",
      selectedIssuesTypes: [],
      selectedIssues: [],
      allJiraProjects: [],
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
    }
  },
  methods:{
    getAllJiraProjects() {
      this.$store.dispatch("actionGetAllJiraProjects")
      // IssueService.getAllJiraProjects().then(response => {
      //   this.allJiraProjects = response.data
      // })
    },
    getIssuesByTypes() {
      this.dialogIssueTypes = false
      this.dialogIssues = true
      this.loading = true
      IssueService.getIssuesByTypes(this.projectName, this.selectedIssuesTypes).then((response) => {
        this.issuesToImportOrAdd = response.data
        this.loading = false
      })
    },
    deleteAllIssues() {
      this.dialogIssues = false
      this.openDialog = false
      // IssueService.importIssues(this.selectedIssues).then((response) => {
      IssueService.deleteAllIssues().then((response) => {
        console.log(response.data)
        this.selectedIssues = []
      })
    },
    addSelectedIssues() {
      this.dialogIssues = false
      this.openDialog = false
      IssueService.addIssues(this.selectedIssues).then((response) => {
        console.log(response.data)
        this.selectedIssues = []
      })
    },
    closeDialogIssueTypes() {
      this.openDialog = false
      this.dialogIssueTypes = false;
    },
    closeDialogIssues() {
      this.openDialog = false
      this.dialogIssues = false;
    },
    getIssueTypesByProjectName() {
      if (this.searchForProject === "0") {
        this.projectName = this.projectNameBySelect
      } else if (this.searchForProject === "1") {
        this.projectName = this.projectNameBySearch
      }
      if (this.projectName === "" || this.projectName === "-") {
        this.warning = "No project selected. Please select a project"
        return this.isProjectSelected = false
      } else {
        this.isProjectSelected = true
        this.openDialog = true
        this.dialogIssueTypes = true
        this.loading = true
        IssueService.getIssueTypesByProjectName(this.projectName).then((response) => {
          this.issueTypes = response.data
          this.loading = false
          if (this.issueTypes.length === 0) {
            this.dialogIssueTypes = false
            this.isProjectSelected = false
            this.warning = "No project or issues in project found"
          }
          this.getProjectNames()
        })
      }
    },
    getProjectNames() {
      IssueService.getProjectNames().then((response) => {
        var data = response.data
        data.forEach(project => {
          this.projectNames.push(project.projectName)
        })
      })
    },
  },
  computed:{
    allAvailableJiraIssues() {
      return this.$store.state.availableJiraProjects
    },
    getIssueTypes() {
      return this.issueTypes.map(item => ({
        item
      }));
    },
    getIssuesToSelect() {
      if (this.search === "") {
        return this.issuesToImportOrAdd
      } else {
        return this.filterIssuesToSelect
      }
    },
  },
  mounted() {
    this.getProjectNames()
    this.getAllJiraProjects()
  },
}
</script>

<style scoped>
.container {
  margin-top: 50px;
}
.headline-select-jira-project{
  font-size: 18px;
}
</style>
