<template>
  <div class="overlay">
    <div class="text-center">
      <v-progress-circular
          :rotate="360"
          :size="100"
          :width="15"
          :model-value="value"
          color="teal"
      >
        {{ value }}
      </v-progress-circular>
    </div>
    <v-btn dark color="black" @click="cancelLoading()"
    >Cancel
    </v-btn>
  </div>
</template>

<script>
export default {
  data () {
    return {
      interval: {},
      value: 0,
    }
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  methods:{
    cancelLoading() {
      this.$store.dispatch("actionCancelLoading");
    },
  },
  mounted () {
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0)
      }
      this.value += 10
    }, 1000)
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
v-progress-circular {
  margin: 1rem;
}
</style>