<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-title>
          <h2>Concept Words</h2>
        </v-card-title>
        <v-data-table
            :headers="tableHeaders"
            :items="topicWordlist"
            :pagination.sync="pagination"
            :loading="loadingResults"
        >
          <template slot="items" slot-scope="props">
            <tr>
              <td>{{ props.item.number }}</td>
              <td>
                <span v-for="word in props.item.words">
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
    topicWordlist() {
      let list = []
      for (let topic in this.selectedResult.topics) {
        let li = []
        let obj = {}
        for (let index in this.selectedResult.topics[topic]) {
          let word = this.selectedResult.topics[topic][index];
            li.push(word);
        }
        obj.number = parseInt(topic) + 1;
        obj.words = li;
        list.push(obj);
        console.log(obj);
      }
      return list;
    }
  },
  watch: {
    // Debug print
    selectedResult: function (newValue, oldValue) {
      console.log(this.selectedResult);
    },
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