<template>
  <div>
    <p>Issue Key: {{ item.key }}</p>
    <p>Assigned Feedback</p>
<!--    <v-data-table-->
<!--        :headers="header"-->
<!--    >-->
<!--    </v-data-table>-->
    <p>Assigned Feedback with TORE classification</p>
    <v-data-table
        :headers="header"
        :items="item.feedback"
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
      headers: [
        {text: "Issue Name", value: "key"},
        {text: "Summary", value: "summary"},
        {text: "Issue Type", value: "issueType"},
        {text: "Project Name", value: "projectName"},
      ],
    }
  },
  methods: {
  }
};

</script>



<style scoped>

</style>