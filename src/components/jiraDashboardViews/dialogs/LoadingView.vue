<template>
  <div class="overlay">
    <div class="text-center">
      <v-progress-circular indeterminate size="64">
        Loading...
      </v-progress-circular>
    </div>
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
.overlay{
  height: 200px;
  margin-top: 20px;
  margin-left: 45%;
  width: 50%;
}
</style>