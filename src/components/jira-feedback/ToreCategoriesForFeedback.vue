<template>
  <div>
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

export default {
  props: ['item'],
  methods: {
  }
};

</script>



<style scoped>

</style>