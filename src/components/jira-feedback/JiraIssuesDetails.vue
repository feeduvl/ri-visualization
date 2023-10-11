<template>
  <div>
    <button class="back-button" @click="goBack">&lt; Back</button>
    <p>Issue Key: {{ item.key }}</p>
    <p>Assigned Feedback</p>
    <v-data-table
        :headers="header"
        :items="item.assigned_feedback"
    >
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.text }}</td>
      </template>
    </v-data-table>
    <p>Assigned Feedback with TORE classification</p>
    <v-data-table
        :headers="header"
        :items="item.assigned_feedback_with_tore"
    >
      <template v-slot:items="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.text }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>

export default {
  props: ['item'],
  data() {
    return {
      header: [
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
};

</script>



<style scoped>

.back-button {
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: absolute;
  top: 100px;
  left: 20px;
}

.back-button:hover {
  background-color: #0056b3;
}

</style>