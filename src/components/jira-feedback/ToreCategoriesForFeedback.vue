<template>
  <div>
    <router-link :to="{ path: ROUTE_FEEDBACK() }">&lt; Feedback</router-link>
    <p>Tore Classification for Feedback: "{{item.id}}"</p>
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

import {ROUTE_FEEDBACK} from "@/routes";

export default {
  props: ['item'],
  methods: {
    ROUTE_FEEDBACK() {
      return ROUTE_FEEDBACK
    }
  }
};

</script>



<style scoped>

</style>