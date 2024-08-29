<template>
  <div>
    <div class="save-buttons">
      <v-subheader>Choose saved dashboard or create new one</v-subheader>
      <v-select class="select-saved-data"
                v-model="selectedDashboard"
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
      <v-btn :style="{ backgroundColor: blueFill }" @click="openCreateDashboardDialog()">Create new Dashboard</v-btn>
      <p v-if="warningMessage1" style="color: red">{{warningMessage1}}</p>
    </div>
    <v-dialog v-model="checkRestoreData" :max-width="400" >
      <v-card class="restore-data">
        <v-card-title class="restore-data">
          <h3>If you choose to display this data, your current data will be deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
        </v-card-title>
        <v-card-actions>
          <v-btn color="red" @click="loadDashboard()">
            Show
          </v-btn>
          <v-btn dark color="black" @click="closeRestoreDataDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="checkCreateDashboard" :max-width="400" >
      <v-card class="create-data">
        <v-card-title class="create-data">
          <h3>If you choose to create a new dashboard, your current changes will be deleted.</h3>
          <h3>Are you sure you want to proceed?</h3>
        </v-card-title>
        <v-card-text>
          <!-- Input field for Dashboard Name -->
          <v-text-field
              v-model="dashboardName"
              label="Dashboard Name"
              outlined
              dense
              :error-messages="dashboardNameError"
              @input="validateDashboardName"
          ></v-text-field>
          <!-- Error message -->
          <v-alert
              v-if="dashboardNameError"
              type="error"
              dense
          >
            {{ dashboardNameError }}
          </v-alert>

          <v-select
              v-model="dashboardType"
              :items="dashboardTypes"
              label="Dashboard type"
              outlined
              dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="createNewDashboard()" :disabled="!dashboardType || !dashboardName || dashboardNameError !== ''">
            Create
          </v-btn>
          <v-btn dark color="black" @click="closeCreateDashboardDialog()">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div id="start" >
      <!--<div class="container">
        <v-card class="banner">
          <v-tabs
          >
            <v-tab :class="{ 'tab': true, 'tab-left': activeTab === '/uvldashboard/jira' }">
              <v-btn @click="navigateTo('/uvldashboard/jira')" >Jira Mode</v-btn>
            </v-tab>
            <v-tab :class="{ 'tab': true, 'tab-right': activeTab === '/uvldashboard/annotation' }">
              <v-btn @click="navigateTo('/uvldashboard/annotation')" >Annotation Mode</v-btn>
            </v-tab>
          </v-tabs>
        </v-card>
      </div>-->
      <router-view></router-view>
    </div>
  </div>
</template>

<script >

export default {
  data() {
    return {
      selectedDashboard: "",
      checkRestoreData: false,
      warningMessage1: "",
      checkCreateDashboard: false,
      dashboardType: null,
      dashboardTypes: ["Jira", "Annotation"],
      dashboardName: '', // Dashboard name input
      dashboardNameError: '', // Error message for invalid dashboard name
    };
  },
  mounted() {
    console.log("mounted started")
    console.log("finish mounted")
  },
  activated() {
    this.getSavedDataNames()
  },
  methods: {
    navigateTo(route) {
      this.activeTab = route.split('/').pop();
      this.$router.push(route);
    },
    openRestoreDataDialog() {
      if (this.selectedData === "") {
        this.warningMessage1 = "Error: No name selected. Please select a name"
      } else {
        this.warningMessage1 = ""
        this.checkRestoreData = true
      }
    },
    closeRestoreDataDialog() {
      this.checkRestoreData = false
    },

    openCreateDashboardDialog() {
      this.checkCreateDashboard = true
    },
    closeCreateDashboardDialog() {
      this.checkCreateDashboard = false
    },
    // Get names of the saved relations
    getSavedDataNames() {
      this.$store.dispatch("actionGetSavedDataNames")
      console.log("got saved data names")
      console.log(this.$store.state.selectedData)
    },
    openDeleteSavedData(item) {
      this.deleteSavedRelations = true
      this.savedDataToDelete = item
    },
    createNewDashboard() {
      let dashboardType = this.dashboardType
      let dashboardName = this.dashboardName
      console.log(dashboardType)
      console.log(this.$store.state.selectedData)
      this.$store.dispatch("actionCreateDashboard", {dashboardName, dashboardType});
      if (!this.dashboardNameError) {
        if (this.dashboardType === "Annotation") {
          this.navigateTo('/uvldashboard/annotation')
        } else {
          this.navigateTo('/uvldashboard/jira')
        }
        this.closeCreateDashboardDialog()
      }
    },
    async loadDashboard(){
      let response = await this.$store.dispatch("actionGetSelectedData", this.selectedDashboard);
      console.log(response.data)
      console.log(response.data.get("type"))
      if (response.data.get("type") === "Annotation") {
        this.navigateTo('/uvldashboard/annotation')
      } else {
        this.navigateTo({name: '/uvldashboard/jira', params: {storedDatasets: response.data.get("datasets")}})

      }
      this.getSavedDataNames()
      this.getAllIssues()
      this.getProjectNames()
      this.checkRestoreData = false
    },

    getSelectedData() {
      return this.$store.state.selectedData
    },
    async getSavedData() {
      console.log("get saved data")
      await this.$store.dispatch("actionGetSavedDataNames")
      console.log(this.$store.state.selectedData)
      this.tabs = this.$store.state.selectedData;
      this.tabCounter = this.tabs.length;

      // Automatically select the first tab if there are any tabs
      if (this.tabs.length > 0) {
        this.activeTab = 0;
      }
    },
    validateDashboardName() {
      console.log(this.dashboardName)
      console.log(this.dashboardType)
      if (this.$store.state.selectedData.includes(this.dashboardName)) {
        this.dashboardNameError = 'This dashboard name already exists. Please choose a different name.';
      } else {
        this.dashboardNameError = '';
      }
      console.log(this.dashboardNameError)
    },
  },
  computed: {
    getSelectedData() {
      return this.$store.state.selectedData
    },
  }
};
</script>

<style scoped>
#start {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.banner{
  margin-top: 50px;
  text-align: center;
}
.container{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
}
</style>