<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          <h2>Concept Words</h2>
        </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="selectedResult.topics"
          :pagination.sync="pagination"
          :loading="loadingResults"
      >
        <template slot="items" slot-scope="props">
          <tr v-for="(topic, index) in props.items">
            <td>{{ index+1 }}</td>
            <td>
                <span v-for="word in topic">
                    <v-chip>{{ word }}</v-chip><span> </span>
                </span>
            </td>
          </tr>
        </template>
      </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "TopicDetectionResult",
  computed: {
    ...mapGetters({
      loadingResults: 'loadingResults',
      selectedResult: 'selectedResult',
    }),
  },
  data: function () {
    return {
      tableHeaders: [
        {
          text: "Number",
          align: "center",
          sortable: true,
          value: "id",
          width: "10%",
          filterable: false
        },
        {
          text: "Concept Words",
          align: "left",
          sortable: false,
          value: "text",
          width: "90%",
          filterable: false
        },
      ],
      pagination: {
        sortBy: "Number",
        descending: false,
        rowsPerPage: 10,
      },
    }
  }
}
</script>

<style scoped>

</style>