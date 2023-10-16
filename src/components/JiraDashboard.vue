<template>
  <div id="start">
    <div class="center-container">
      <v-card class="banner">
        <v-tabs
        >
          <v-tab>
            <v-btn @click="navigateTo('/jira/issues')" :class="{ 'tab': true, 'tab-left': activeTab === 'issues' }">Issues</v-btn>
          </v-tab>
          <v-tab>
            <v-btn @click="navigateTo('/jira/feedback')" :class="{ 'tab': true, 'tab-right': activeTab === 'feedback' }">Feedback</v-btn>
          </v-tab>
        </v-tabs>
      </v-card>
    </div>
    <router-view></router-view>
  </div>
</template>

<script >
export default {
  data() {
    return {
      activeTab: '',
    };
  },
  methods: {
    navigateTo(route) {
      this.activeTab = route.split('/').pop();
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>

#start {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
.banner{
  margin-top: 50px;
  width: 90%;
  text-align: center;
}
.center-container{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>