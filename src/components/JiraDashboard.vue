<template>
  <div id="start">
    <nav id="start">
      <router-link to="issues">
        <div :class="{ 'tab': true, 'tab-left': $route.path === 'issues' }">Issues</div>
      </router-link>
      <router-link to="feedback">
        <div :class="{ 'tab': true, 'tab-right': $route.path === 'feedback' }">Feedback</div>
      </router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>

</script>

<style scoped>

.tab {
  display: inline-block;
  padding: 10px 0;
  margin: 0 5px;
  cursor: pointer;
}

.tab-left {
  width: 20%;
  text-align: center;
  border: 2px solid black;
  border-radius: 5px 0 0 5px;
}

.tab-right {
  width: 20%;
  text-align: center;
  border: 2px solid black;
  border-radius: 0 5px 5px 0;
}
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #007BFF;
}

#start {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

</style>