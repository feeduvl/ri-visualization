<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <v-dialog v-model="typeNameToSaveData" :max-width="300">
      <v-card>
        <v-card-text>
          <v-text-field
              v-model="savedDataName"
              label="Enter Name"
              outlined
              solo-inverted
          ></v-text-field>
          <p v-if="warningMessage" style="color: red">{{warningMessage}}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="saveData" color="blue">Save</v-btn>
          <v-btn @click="closeSaveDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="checkRestoreData" :max-width="400" >
      <v-card class="restore-data">
        <v-card-title class="restore-data">
          <h3>If you choose to display this data, your current data will be deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
        </v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="restoreData()">
            Show
          </v-btn>
          <v-btn dark color="black" @click="closeRestoreDataDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div>
      <v-dialog v-model="deleteAllIs" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported requirements?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteAllIssues()">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteIssues()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <v-dialog v-model="deleteOneRequirement" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this requirement?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteIssue">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteIssues()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div>
      <v-dialog v-model="deleteAllRequirementsByProjectName" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all requirement of this project?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteProject">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteIssues()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div>
      <v-dialog v-model="deleteSavedRelations" :max-width="300" class="delete-all-issues">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete this saved relations?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteSavedData">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteIssues()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-card>
      <v-card-title>
        <div class="import-elements">
          <div class="import-buttons">
            <LoadFeedbackFromDB class="element1"></LoadFeedbackFromDB>
            <v-btn dark :style="{ backgroundColor: blueDark }" class="element2" @click="openImportDialog()"> Import Requirements
            </v-btn>
            <v-dialog class="custom-dialog" v-model="importDialog">
              <ImportJiraProject class="import-dialog" @toggleImport="toggleImport" :importDialog="importDialog"/>
            </v-dialog>
          </div>
        </div>
        <div class="export-elements">
          <div class="save-buttons">
            <v-subheader>Choose saved data or save current data</v-subheader>
            <v-select class="select-saved-data"
                      v-model="selectedData"
                      :items="getSelectedData"
                      label="Select Data"
                      dense
            >
              <template v-slot:item="{ item }" >
                <div>
                  {{ item }}
                  <i class="material-icons delete-icon" @click.stop="openDeleteSavedData(item)">delete</i>
                </div>
              </template>
            </v-select>
            <v-btn :style="{ backgroundColor: blueFill }" @click="openRestoreDataDialog()">Show Data</v-btn>
            <v-btn :style="{ backgroundColor: blueFill }" @click="setNameToSave()"> Save all relations
            </v-btn>
            <p v-if="warningMessage1" style="color: red">{{warningMessage1}}</p>
          </div>
          <div class="export-buttons">
            <v-subheader>Exporting Data</v-subheader>
            <v-btn :style="{ backgroundColor: blueFill }" :class="{'assign_tore_not_allowed': !feedbackAndProjectIsSelected}" @click="getAssignedDataToExport()"> Export relations Data to CSV </v-btn>
            <v-btn :style="{ backgroundColor: blueFill }" :class="{'assign_tore_not_allowed': !annotationAndProjectIsSelected}" @click="getToreAssignedDataToExport()"> Export TORE relations Data To CSV </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-title>
        <div class="container-similarity">
          <div class="button-row">
            <v-btn :style="{ backgroundColor: blueLight }" :class="{'assign_tore_not_allowed': !feedbackAndProjectIsSelected}"
                   @click="assignFeedbackToIssues()"> Relate Feedback to Requirements
            </v-btn>
            <v-btn :style="{ backgroundColor: blueLight }" :class="{'assign_tore_not_allowed': !annotationAndProjectIsSelected}"
                   @click="assignFeedbackToIssueWithTore()"> Relate Feedback to Requirements with TORE
            </v-btn>
          </div>
          <div class="input-container">
            <label for="maxSimilarity">Threshold:</label>
            <input id="maxSimilarity" class="chooseSimilarity" type="number" v-model="maxSimilarity" />
          </div>
        </div>
      </v-card-title>
    </v-card>

    <div class="main-issue-table">
      <v-card class="v-card">
        <v-card-title>
          <h2>Jira Requirements</h2>
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
                  <i class="material-icons delete-icon" @click.stop="openDeleteProject(item)">delete</i>
                </div>
              </template>
            </v-select>
          </div>
          <div class="search-in-table">
            <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
          </div>
          <div class="service-button">
            <v-btn  @click="dialogDeleteAllIssues()" small>
              <i class="material-icons delete-icon">delete_sweep</i>
            </v-btn>
          </div>

          <div class="switch-container">
            <div class="label-container">
              <label for="showUnassigned" class="label-text">Show requirements without assigned feedback:</label>
            </div>
            <div class="switch-content">
              <v-switch id="showUnassigned" v-model="showUnassigned" @change="getUnassignedIssues"></v-switch>
            </div>
          </div>
        </v-card-title>
        <v-data-table :headers="headers"
                      :items="getIssues"
                      item-key="key"
                      class="elevation-1"
                      :total-items="$store.state.totalIssueItems"
                      rows-per-page-text="Requirements per page"
                      :rows-per-page-items="pagination.rowsPerPageItems"
                      :pagination.sync="pagination"
                      @update:pagination.self="getAllIssues()"
                      :no-data-text="warning">
          <template v-slot:items="props">
            <tr @click="showDetails(props.item)">
              <td>{{ props.item.key }}</td>
              <td>{{ props.item.summary }}</td>
              <td>{{ props.item.description }}</td>
              <td>{{ props.item.issueType }}</td>
              <td>{{ props.item.projectName }}</td>
              <td>
                <i class="material-icons delete-icon"  @click.stop="openDeleteOneRequirementDialog(props.item)">delete</i>
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
import { BLUE_BORDER, BLUE_LIGHT, BLUE_FILL, BLUE_DARK } from "@/colors";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Issues",
  data() {
    return {
      blueBorder: BLUE_BORDER,
      blueLight: BLUE_LIGHT,
      blueFill: BLUE_FILL,
      blueDark: BLUE_DARK,
      headers: [
        {text: "Requirement Name", value: "key", sortable: false},
        {text: "Summary", value: "summary", sortable: false},
        {text: "Description", value: "description", sortable: false},
        {text: "Requirement Type", value: "issueType", sortable: false},
        {text: "Project Name", value: "projectName", sortable: false},
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
      warning: "Select/import a project or feedback",
      isProjectSelected: true,
      importDialog: false,
      maxSimilarity: 0,
      deleteAllIs: false,
      selectedData: "",
      showUnassigned: false,
      typeNameToSaveData: false,
      savedDataName: "",
      warningMessage: "",
      warningMessage1: "",
      checkRestoreData: false,
      deleteOneRequirement: false,
      itemToDelete: [],
      deleteAllRequirementsByProjectName: false,
      projectToDelete: [],
      deleteSavedRelations: false,
      savedDataToDelete: [],
    }
  },
  components:{
    LoadFeedbackFromDB,
    ImportJiraProject,
    LoadingView
  },
  methods: {
    getSavedDataNames() {
      this.$store.dispatch("actionGetSavedDataNames")
    },
    async getUnassignedIssues() {
      if(this.showUnassigned){
        let page = this.pagination.page
        let size = this.pagination.rowsPerPage
        await this.$store.dispatch("actionGetIssuesWithoutAssignment", {page, size})
      }else{
        this.getAllIssues()
      }
    },
    exportAssignedDataToCSV() {
      const csvContent = [];
      const dataToExport = this.$store.state.dataToExport;

      if (dataToExport.length === 0) {
        return;
      }
      const issueKeys = [];
      const issueSummaries = [];
      const issueDescriptions = [];

      for (const data of dataToExport) {
        issueKeys.push(data.issue_key);
        issueSummaries.push(data.issue_summary);
        issueDescriptions.push(data.issue_description);
      }
      csvContent.push('issue_key#' + issueKeys.join('##'));
      csvContent.push('issue_summary#' + issueSummaries.join('##'));
      csvContent.push('issue_description#' + issueDescriptions.join('##'));

      const maxFeedbackCount = Math.max(...dataToExport.map(data => data.feedback_data.length));

      for (let i = 0; i < maxFeedbackCount; i++) {
        const feedbackIdRow = [];
        const feedbackTextRow = [];

        for (const data of dataToExport) {
          if (i < data.feedback_data.length) {
            const feedback = data.feedback_data[i];
            feedbackIdRow.push(feedback.feedback_id);
            feedbackTextRow.push(feedback.feedback_text);
          } else {
            feedbackIdRow.push('');
            feedbackTextRow.push('');
          }
        }
        csvContent.push('feedback_id' + (i + 1) + '#' + feedbackIdRow.join('##'));
        csvContent.push('feedback_text' + (i + 1) + '#' + feedbackTextRow.join('##'));
      }
      const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assigned_feedback-issues.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    exportAssignedToreDataToCSV() {
      const csvContent = [];
      const dataToExport = this.$store.state.toreDataToExport;

      if (dataToExport.length === 0) {
        return;
      }
      const issueKeys = [];
      const issueSummaries = [];
      const issueDescriptions = [];

      for (const data of dataToExport) {
        issueKeys.push(data.issue_key);
        issueSummaries.push(data.issue_summary);
        issueDescriptions.push(data.issue_description);
      }
      csvContent.push('issue_key#' + issueKeys.join('##'));
      csvContent.push('issue_summary#' + issueSummaries.join('##'));
      csvContent.push('issue_description#' + issueDescriptions.join('##'));

      const maxFeedbackCount = Math.max(...dataToExport.map(data => data.feedback_data.length));

      for (let i = 0; i < maxFeedbackCount; i++) {
        const feedbackIdRow = [];
        const feedbackTextRow = [];

        for (const data of dataToExport) {
          if (i < data.feedback_data.length) {
            const feedback = data.feedback_data[i];
            feedbackIdRow.push(feedback.feedback_id);
            feedbackTextRow.push(feedback.feedback_text);
          } else {
            feedbackIdRow.push('');
            feedbackTextRow.push('');
          }
        }
        csvContent.push('feedback_id' + (i + 1) + '#' + feedbackIdRow.join('##'));
        csvContent.push('feedback_text' + (i + 1) + '#' + feedbackTextRow.join('##'));
      }
      const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tore_assigned_feedback-issues.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    async getAssignedDataToExport() {
      let selectedFeedback
      if(this.$store.state.selectedFeedback === ""){
        selectedFeedback = "None"
      }else{
        selectedFeedback = this.$store.state.selectedFeedback
      }
      await this.$store.dispatch("actionGetAssignedDataToExport", selectedFeedback)
      this.exportAssignedDataToCSV()
    },
    async getToreAssignedDataToExport() {
      let selectedFeedback
      if(this.$store.state.selectedFeedback === ""){
        selectedFeedback = "None"
      }else{
        selectedFeedback = this.$store.state.selectedFeedback
      }
      await this.$store.dispatch("actionGetToreAssignedDataToExport", selectedFeedback)
      this.exportAssignedToreDataToCSV()
    },
    setNameToSave(){
      this.typeNameToSaveData = true
    },
    openRestoreDataDialog(){
      if(this.selectedData === ""){
        this.warningMessage1 = "Error: No name selected. Please select a name"
      }else {
        this.warningMessage1 = ""
        this.checkRestoreData = true
      }
    },
    closeRestoreDataDialog(){
      this.checkRestoreData = false
    },
    async restoreData(){
      await this.$store.dispatch("actionGetSelectedData", this.selectedData);
      this.getSavedDataNames()
      this.getAllIssues()
      this.getProjectNames()
      this.checkRestoreData = false
    },
    async deleteSavedData(){
      let item = this.savedDataToDelete
      await this.$store.dispatch("actionDeleteSavedData", item);
      this.getSavedDataNames()
      this.deleteSavedRelations = false
      this.savedDataToDelete = []
    },
    openDeleteSavedData(item) {
      this.deleteSavedRelations = true
      this.savedDataToDelete = item
    },
    async saveData() {
      try {
        await this.$store.dispatch("actionSaveData", this.savedDataName);
        this.typeNameToSaveData = false;
        this.warningMessage = "";
        this.getSavedDataNames()
      } catch (error) {
        this.warningMessage = "Please enter a name";
      }
    },
    closeSaveDialog(){
      this.typeNameToSaveData = false
    },
    toggleImport(value) {
      this.importDialog = value;
      this.getAllIssues()
      this.getProjectNames()
    },
    dialogDeleteAllIssues(){
      this.deleteAllIs = true
    },
    dontDeleteIssues(){
      this.deleteAllIs = false
      this.deleteOneRequirement = false
      this.deleteAllRequirementsByProjectName = false
      this.deleteSavedRelations = false
    },
    async deleteAllIssues() {
      await this.$store.dispatch("actionDeleteAllIssues")
      this.getAllIssues()
      this.getProjectNames()
      this.deleteAllIs = false
    },
    openImportDialog(){
      this.importDialog = true
    },
    openDeleteOneRequirementDialog(item) {
      this.deleteOneRequirement = true
      this.itemToDelete = item
    },
    async deleteIssue(){
      try {
        const projectName = this.itemToDelete.projectName
        const issueKey = this.itemToDelete.key
        await this.$store.dispatch("actionDeleteIssue", {projectName, issueKey});
        this.getAllIssues();
        this.getProjectNames();
        this.itemToDelete = []
        this.deleteOneRequirement = false
      } catch (error) {
        console.error("Error:", error);
      }
    },
    openDeleteProject(item) {
      this.deleteAllRequirementsByProjectName = true
      this.projectToDelete = item
    },
    async deleteProject() {
      let item = this.projectToDelete
      try {
        await this.$store.dispatch("actionDeleteProject", item.projectName);
        this.getAllIssues();
        this.getProjectNames();
        this.deleteAllRequirementsByProjectName = false
        this.projectToDelete = []
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async assignFeedbackToIssues(){
      let selectedFeedback = this.$store.state.selectedFeedback
      let maxSimilarity = 0
      if (this.maxSimilarity !== ""){
        maxSimilarity = this.maxSimilarity
      }
      await this.$store.dispatch("actionAssignIssuesToFeedback", {selectedFeedback, maxSimilarity})
      this.getAllIssues()
    },
    async assignFeedbackToIssueWithTore(){
      let selectedFeedback = this.$store.state.selectedFeedback
      let maxSimilarity = 0
      if (this.maxSimilarity !== ""){
        maxSimilarity = this.maxSimilarity
      }
      await this.$store.dispatch("actionToreAssignIssuesToFeedback", {selectedFeedback, maxSimilarity})
      this.getAllIssues()
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
    getSelectedData() {
      return this.$store.state.selectedData
    },
    annotationAndProjectIsSelected() {
      return this.$store.state.selectedAnnotation !== "" && this.$store.state.issues.length > 0;
    },
    feedbackAndProjectIsSelected() {
      return this.$store.state.selectedFeedback !== "" && this.$store.state.issues.length > 0;
    },
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
      }else{
        if (this.showUnassigned) {
          return this.$store.state.issuesWithoutAssignment
        }else{
          return this.$store.state.issues
        }
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
    this.getSavedDataNames()
    this.getAllIssues()
    this.getProjectNames()
  },

}
</script>

<style>
.save-buttons {
  float: left;
  margin-right: 30px;
  border-right: 1px solid #ccc;
  padding-right: 80px;
}
.input-container{
  margin-left: 10px;
}
.export-buttons {
  float: left;
  margin-left: 20px;
}
.select-saved-data {
  width: 70%;
  margin-left: 10px;
}
.service-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
.switch-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.label-container {
  margin-right: 16px; /* oder einen anderen Wert für den gewünschten Abstand */
}

.label-text {
  margin-bottom: 0; /* optional: um den unteren Abstand zu entfernen */
}

.switch-content {
  margin-top: 8px; /* oder einen anderen Wert für den gewünschten Abstand zur nächsten Zeile */
}
.import-buttons {
  display: flex;
  justify-content: space-between;
  margin-left: 10px;
}
.import-elements, .export-elements{
  width: 100%;
  border-bottom: 1px solid grey;
}
.element1 {
  flex: 0.8;
}
.element2 {
  flex-shrink: 0;
}
.select-projects{
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.assign_tore_not_allowed {
  background-color: #ccc !important;
  pointer-events: none !important;
  color: #777 !important;
}
.chooseSimilarity{
  width: 70px;
  border: 2px solid #ccc;
  padding: 5px;
  margin-left: 5px;
}
.delete-all-issues, .restore-data{
  text-align: center;
}
</style>