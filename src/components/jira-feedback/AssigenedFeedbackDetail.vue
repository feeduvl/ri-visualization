<template>
  <div>
    <router-link :to="{ path: ROUTE_JIRA() }">&lt; Issues</router-link>
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

import {ROUTE_JIRA} from "@/routes";

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
    ROUTE_JIRA() {
      return ROUTE_JIRA
    }
  }
};

</script>



<style scoped>

</style>