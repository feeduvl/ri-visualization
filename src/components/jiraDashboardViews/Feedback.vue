<template>
  <div class="container">
    <v-dialog v-model="isLoadingData" :max-width="300">
      <LoadingView/>
    </v-dialog>
    <div>
      <v-dialog v-model="deleteAllFb" :max-width="300" class="delete-all-feedback">
        <v-card>
          <v-card-title>
            <h3>Are you sure you want to delete all imported feedback?</h3>
          </v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="deleteAllFeedback()">
              Delete
            </v-btn>
            <v-btn dark color="black" @click="dontDeleteFeedback()">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-card class="table-header">
      <v-card-title>
        <h2>Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
        <div class="delete-button">
          <v-btn  @click="dialogDeleteAllFeedback()" small>
            <i class="material-icons delete-icon">delete_sweep</i>
          </v-btn>
          <v-switch v-model="showUnassigned" @change="getUnassignedFeedback">

          </v-switch>
        </div>

      </v-card-title>
      <v-data-table
          :headers="tableHeaders"
          :items="getFeedbackForFilter"
          item-key="id"
          class="elevation-1"
          :total-items="$store.state.totalFeedbackItems"
          rows-per-page-text="Feedback per page"
          :rows-per-page-items="pagination.rowsPerPageItems"
          :pagination.sync="pagination"
          @update:pagination.self="getFeedback()"
          :no-data-text="warning"
      >
        <template v-slot:items="props">
          <tr @click="showDetails(props.item)">
            <td>{{ props.item.text }}</td>
            <td>{{ limitDescriptionText(props.item.id, 10) }}</td>
            <td>
              <i class="material-icons delete-icon" @click.stop="deleteFeedback(props.item)">delete</i>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>

import LoadingView from "@/components/jiraDashboardViews/dialogs/LoadingView.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Feedback",
  components: {LoadingView},
  data() {
    return {
      tableHeaders: [
        {text: "Text", value: "text"},
        {text: "ID", value: "id"}
      ],
      pagination: {
        sortBy: "id",
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsPerPageItems: [5, 10, 25, 50, 100, {"text": "All", "value": -1}]
      },
      search: "",
      warning: "Select Feedback Dataset",
      deleteAllFb: false,
      showUnassigned: false,
    }
  },
  methods: {
    getUnassignedFeedback(){
      if(this.showUnassigned){
        let selectedFeedback
        if(this.$store.state.selectedFeedback === ""){
          selectedFeedback = "None"
        }else{
          selectedFeedback = this.$store.state.selectedFeedback
        }
        let page = this.pagination.page
        let size = this.pagination.rowsPerPage
        this.$store.dispatch("actionGetFeedbackWithoutAssignment", {page, size, selectedFeedback})
      }else{
        this.getFeedback()
      }

    },
    dialogDeleteAllFeedback() {
      this.deleteAllFb = true
    },
    dontDeleteFeedback(){
      this.deleteAllFb = false
    },
    limitDescriptionText(text, limit) {
      if (text.length > limit) {
        return text.substring(0, limit);
      } else {
        return text;
      }
    },
    getFeedback(){
      let page = this.pagination.page
      let size = this.pagination.rowsPerPage
      let selectedFeedbackFileName = this.selectedFeedbackFileName
      this.$store.dispatch("actionGetFeedback", {page, size, selectedFeedbackFileName})
    },
    async deleteFeedback(item) {
      let feedbackId = item.id
      let selectedFeedback = this.$store.state.selectedFeedback
      await this.$store.dispatch("actionDeleteFeedback", {feedbackId, selectedFeedback})
      this.getFeedback()
    },
    async deleteAllFeedback() {
      let selectedFeedback
      if (this.$store.state.selectedFeedback === ""){
        selectedFeedback = "None"
      }else{
        selectedFeedback = this.$store.state.selectedFeedback
      }
      await this.$store.dispatch("actionDeleteAllFeedback", selectedFeedback)
      this.getFeedback()
      this.deleteAllFb = false
    },
    showDetails(item) {
      this.$router.push({ name: 'tore_feedback', params: { item: item } });
    },
  },
  computed: {
    selectedFeedbackFileName (){
      return this.$store.state.selectedFeedback
    },
    isLoadingData(){
      return this.$store.state.isLoadingData
    },
    getFeedbackForFilter() {
      if (this.search !== "") {
        return this.filterFeedback
      } else {
        if (this.showUnassigned){
          return this.$store.state.feedbackWithoutAssignment
        }else{
          return this.$store.state.feedback
        }
      }
    },
    filterFeedback() {
      return this.$store.state.feedback.filter(item => {
        return item.id.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  activated() {
    this.getFeedback();
  },
}
</script>

<style scoped>
.table-header{
  margin-top: 20px;
}
.container{
  width: 90%;
  margin-top: 20px;
}
.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
.delete-all-feedback{
  text-align: center;
}
</style>