<template>
  <div class="overlay">
    <h2>HALLO</h2>
    <v-progress-circular indeterminate size="64">
      Loading...
    </v-progress-circular>
    <v-btn dark color="black" @click="cancelLoading()"
    >Cancel
    </v-btn>
  </div>
</template>

<script>
export default {
  methods:{
    cancelLoading() {
      this.$store.dispatch("actionCancelLoading");
    },
  },

}
</script>

<style scoped>

</style>