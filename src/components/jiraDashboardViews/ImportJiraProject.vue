<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <p class="headline-select-jira-project">
      Select Project to import:
    </p>
    <div>
      <v-select class="select-issueTypes" v-model="projectName" :items="allAvailableJiraIssues"
                label="Select project" item-text="name"
      ></v-select>
      <v-btn dark color="blue" @click="getIssueTypesByProjectName()"> SEARCH
      </v-btn>
      <v-btn dark color="black" @click="toggleImport()">CANCEL</v-btn>
    </div>
    <p v-if="!isProjectSelected" class="warning" style="color: red">{{ warning }}</p>

    <v-dialog v-model="openDialog" width="70%">
      <div v-if="!isLoadingData">
        <div v-if="dialogIssues">
          <v-card>
            <v-card-title>
              <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
            </v-card-title>
            <v-data-table v-model="selectedIssues" :headers="headers" :items="getIssuesToSelect" select-all
                          item-key="key" class="elevation-1" rows-per-page-text="Requirements per page"
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
          <v-btn dark color="black" @click="closeDialogIssues()">Cancel</v-btn>
        </div>
        <div v-if="dialogIssueTypes">
          <v-card>
            <v-card-title>
              Choose the requirement types you want to show of project: {{ projectName }}
            </v-card-title>
            <v-data-table v-model="selectedIssuesTypes"
                          :headers="headersIssueTypes"
                          :items="getIssueTypes"
                          item-key="item"
                          select-all
                          class="elevation-1"
                          rows-per-page-text="Requirement Types per page"
            >
              <template v-slot:items="props">
                <td>
                  <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                </td>
                <td>{{ props.item.item }}</td>
              </template>
            </v-data-table>
            <v-btn dark color="blue" @click="getIssuesByTypes()">Search</v-btn>
            <v-btn dark color="black" @click="closeDialogIssueTypes()">Cancel</v-btn>
          </v-card>
        </div>
      </div>

    </v-dialog>
  </div>
</template>

<script>


import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "SearchForJiraProject",
  props: ['importDialog'],
  components: {LoadingView},
  data() {
    return {
      headersIssueTypes: [
        {text: "Requirement Type", value: "issueType"},
      ],
      headers: [
        {text: "Requirement Name", value: "key"},
        {text: "Summary", value: "summary"},
        {text: "Description", value: "description"},
        {text: "Requirement Type", value: "issueType"},
        {text: "Project Name", value: "projectName"},
      ],
      isProjectSelected: true,
      warning: "",
      projectName: "",
      dialogIssueTypes: false,
      dialogIssues: false,
      openDialog: false,
      search: "",
      selectedIssuesTypes: [],
      selectedIssues: [],
    }
  },
  methods:{
    toggleImport() {
      console.log(this.importDialog)
      this.$emit('toggleImport', !this.importDialog);
    },
    getAllJiraProjects() {
      this.$store.dispatch("actionGetAllJiraProjects")
    },
    getIssuesByTypes() {
      this.dialogIssueTypes = false
      this.dialogIssues = true
      let projectName = this.projectName
      let issueTypes = this.selectedIssuesTypes
      const selectedIssuesTypesArray = issueTypes.map(item => {
        return item;
      });
      this.$store.dispatch('actionGetIssuesByProjectNameFromJira', {projectName, selectedIssuesTypesArray});
    },
    async addSelectedIssues() {
      this.dialogIssues = false
      this.openDialog = false
      let selectedIssues = this.selectedIssues
      const selectedIssuesArray = selectedIssues.map(item => {
        return item;
      });
      await this.$store.dispatch("actionAddSelectedIssues", {selectedIssuesArray})
      this.selectedIssues = []
      this.toggleImport()
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
      // eslint-disable-next-line
      this.selectedIssuesTypes = []
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
      if (this.search !== "") {
        return this.filterImportedIssues
      } else {
        return this.$store.state.issuesToImport
      }
    },
    filterImportedIssues() {
      return this.$store.state.issuesToImport.filter(issue => {
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
