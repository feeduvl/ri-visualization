<template>
  <div class="container">
    <button class="back-button" @click="goBack">
      <i class="material-icons">arrow_back_ios</i>
    </button>
    <h2>Tore Classification for Feedback: "{{item.id}}"</h2>
    <v-data-table
        :items="item.tore"
    >
      <template v-slot:items="props">
        <td>{{ props.item }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: ['item'],
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.container{
  margin-top: 20px;
}
.back-button {
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: absolute;
  top: 150px;
  left: 120px;
}

.back-button:hover {
  color: blue;
}

</style>