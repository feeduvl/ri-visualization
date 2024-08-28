<template>
  <div>
    <v-card>
      <v-tabs>
        <v-tab v-for="i in tabs" :key="'dyn-tab-' + i" :href="'#tab-' + i">
          Tab {{ i }}
        </v-tab>

        <!-- New Tab Button -->
        <template v-slot:extension>
          <v-tab @click.prevent="newTab"><v-icon>mdi-plus</v-icon></v-tab>
        </template>
      </v-tabs>

      <v-tabs-items>
        <v-tab-item v-for="i in tabs" :key="'dyn-tab-item-' + i" :id="'tab-' + i">
          <v-card flat>
            <v-card-text>Tab contents {{ i }}</v-card-text>
            <v-card-actions>
              <v-btn color="red" @click="closeTab(i)">Close tab</v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

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
      activeTab: '',
      tabs: [],
      tabCounter: 0
    };
  },
  mounted() {
    this.getSavedData();
  },
  methods: {
    navigateTo(route) {
      this.activeTab = route.split('/').pop();
      this.$router.push(route);
    },
    closeTab(x) {
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i] === x) {
          this.tabs.splice(i, 1)
        }
      }
    },
    async getSavedData(){
      await this.$store.dispatch("actionGetSelectedData", this.selectedData);
      console.log(this.$store.state.selectedData)
      this.tabs = this.$store.state.selectedData;
      this.tabCounter = this.tabs.length;
    },
    newTab() {
      this.tabs.push(this.tabCounter++)
    }
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