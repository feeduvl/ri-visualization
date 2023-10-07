<template>
  <div id="app">
    <v-toolbar class="banner">
      <router-link to="/">Issues</router-link>
      <router-link to="/feedback" style="margin-left: 10px">Feedback</router-link>
    </v-toolbar>
    <router-view style="margin-top: 40px"/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
<script setup>
</script>