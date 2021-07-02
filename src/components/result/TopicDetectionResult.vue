<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card id="wordcloud_holder">
        <v-card-title>
          <h2>Concept Wordcloud</h2>
        </v-card-title>
        <cloud :data="topicWords" :height="height" :padding="padding" :width="width" :fontSizeMapper="fontSizeMapper" :rotate="rotate" :coloring="coloring" :colors="colors" />
      </v-card>
    </v-flex>
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
    <v-flex xs12 id="heatmap-holder">
      <heatmap-document-topic/>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapGetters} from "vuex";
import Cloud from 'vue-d3-cloud'
import {CLOUD} from "@/colors";

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
      }
      return list;
    },
    topicWords() {
      let list = []
      let tw = []
      for (let topic in this.selectedResult.topics) {
        for (let index in this.selectedResult.topics[topic]) {
          let word = this.selectedResult.topics[topic][index];
          if (!(list.indexOf(word) > -1)) {
            list.push(word);
            tw.push({text: word, value: 24})
          }
        }
      }
      return tw;
    }
  },
  components: {
    Cloud,
    "heatmap-document-topic": () =>
        import("../widget/heatmap/HeatmapDocumentTopic"),
  },
  data: function () {
    return {
      fontSizeMapper: word => word.value,
      rotate: 0,
      coloring: "random",
      colors: CLOUD,
      width: 1152,
      height: 400,
      padding: 5,
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

#wordcloud_holder {
  margin-bottom: 20px;
}

#heatmap-holder {
  margin-top: 20px;
}

</style>