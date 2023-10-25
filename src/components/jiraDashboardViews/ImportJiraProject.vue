<template>
  <div class="container">
    <p class="headline-select-jira-project">
      Select already used projects or search for new:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="projectName" :items="allAvailableJiraIssues"
                label="Select project" item-text="name"
      ></v-select>
      <v-btn dark color="blue" @click="getIssueTypesByProjectName()"> SEARCH
      </v-btn>
      <v-btn dark color="red" @click="deleteAllIssues()">Remove all Issues</v-btn>
    </div>
    <p v-if="!isProjectSelected" class="warning">{{ warning }}</p>

    <v-dialog v-model="openDialog" width="70%">
      <div class="overlay" v-if="isLoadingData">
        <v-progress-circular indeterminate size="64">
          Loading...
        </v-progress-circular>
        <v-btn dark color="black" @click="closeDialogIssues()"
        >CLOSE
        </v-btn>
      </div>
      <div v-if="!isLoadingData">
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
      issueTypes: [],
      isProjectSelected: true,
      warning: "",
      projectName: "",
      dialogIssueTypes: false,
      dialogIssues: false,
      openDialog: false,
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
    },
    getIssuesByTypes() {
      this.dialogIssueTypes = false
      this.dialogIssues = true
      console.log(this.selectedIssuesTypes)
      let projectName = this.projectName
      let issueTypes = this.selectedIssuesTypes
      const selectedIssuesTypesArray = issueTypes.map(item => {
        return item;
      });
      this.$store.dispatch('actionGetIssuesByProjectNameFromJira', {projectName, selectedIssuesTypesArray});

    },
    deleteAllIssues() {
      this.dialogIssues = false
      this.openDialog = false
      this.$store.dispatch("actionDeleteAllIssues")
      // IssueService.importIssues(this.selectedIssues).then((response) => {
      // IssueService.deleteAllIssues().then((response) => {
      //   console.log(response.data)
      this.selectedIssues = []
      // })
    },
    addSelectedIssues() {
      this.dialogIssues = false
      this.openDialog = false
      let selectedIssues = this.selectedIssues
      const selectedIssuesArray = selectedIssues.map(item => {
        return item;
      });
      this.$store.dispatch("actionAddSelectedIssues", {selectedIssuesArray})
      // IssueService.addIssues(this.selectedIssues).then((response) => {
      //   console.log(response.data)
      this.selectedIssues = []
      // })
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
      if (this.projectName === "") {
        this.warning = "No project selected. Please select a project"
        return this.isProjectSelected = false
      } else {
        this.isProjectSelected = true
        this.openDialog = true
        this.dialogIssueTypes = true
        this.$store.dispatch("actionGetIssueTypesByProjectNameFromJira", this.projectName)
      }
    },
  },
  computed:{
    isLoadingData() {
      return this.$store.state.isLoadingData
    },
    allAvailableJiraIssues() {
      return this.$store.state.availableJiraProjects
    },
    getIssueTypes() {
      if (this.$store.state.issueTypes.length === 0) {
        // eslint-disable-next-line
        this.dialogIssueTypes = false
        // eslint-disable-next-line
        this.isProjectSelected = false
        // eslint-disable-next-line
        return this.warning = "No project or issues in project found"
      }else{
        return this.$store.state.issueTypes.map(item => ({
          item
        }));
      }
    },
    getIssuesToSelect() {
      return this.$store.state.issuesToImport
    },
  },
  mounted() {
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
