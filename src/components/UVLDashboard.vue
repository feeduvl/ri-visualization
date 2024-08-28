<template>
  <div>
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
      <p v-if="warningMessage1" style="color: red">{{warningMessage1}}</p>
    </div>
    <div id="start" >
      <div class="container">
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
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script >

export default {
  data() {
    return {
      selectedData: "",

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
    openRestoreDataDialog(){
      if(this.selectedData === ""){
        this.warningMessage1 = "Error: No name selected. Please select a name"
      }else {
        this.warningMessage1 = ""
        this.checkRestoreData = true
      }
    },
    // Get names of the saved relations
    getSavedDataNames() {
      this.$store.dispatch("actionGetSavedDataNames")
      console.log("got saved data names")
    },
    openDeleteSavedData(item) {
      this.deleteSavedRelations = true
      this.savedDataToDelete = item
    },
    getSelectedData() {
      return this.$store.state.selectedData
    },
    async getSavedData(){
      console.log("getsaveddata")
      await this.$store.dispatch("actionGetSavedDataNames")
      console.log(this.$store.state.selectedData)
      this.tabs = this.$store.state.selectedData;
      this.tabCounter = this.tabs.length;

      // Automatically select the first tab if there are any tabs
      if (this.tabs.length > 0) {
        this.activeTab = 0;
      }
    },
  },
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