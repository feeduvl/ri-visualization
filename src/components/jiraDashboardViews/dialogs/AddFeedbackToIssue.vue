<template>
  <v-dialog v-model="openDialog" max-width="800">
    <v-card>
      <v-card-title>
        <h2>Add Feedback</h2>
        <div class="search-in-table">
          <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
        </div>
      </v-card-title>
      <v-card-text>
        <v-data-table
            v-model="selectedFeedback"
            :headers="headerDialog"
            :items="getFilteredFeedback"
            item-key="id"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" />
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.text }}</td>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addSelectedFeedback" dark color="blue" class="add-feedback">
          Add Selected Feedback to list
        </v-btn>
        <v-btn @click="toggleFeedback()" dark color="black">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: ['openFeedbackDialog', 'issue', 'listWithTore'],
  data(){
    return {
      selectedIssue: this.issue,
      selectedFeedback: [],
      search: "",
      headerDialog: [
        {text: "", sort: false},
        {text: "Id", value: "id"},
        {text: "Text", value: "text"},
      ],
    }
  },
  watch: {
    openFeedbackDialog() {
      this.selectedIssue = this.issue
      this.getUnassignedFeedback()
    },
  },
  computed:{
    openDialog(){
      return this.openFeedbackDialog
    },
    getFilteredFeedback() {
      if (this.search !== "") {
        return this.filterFeedback
      } else {
        return this.$store.state.unassignedFeedback
      }
    },
    filterFeedback() {
      return this.$store.state.unassignedFeedback.filter(item => {
        return item.id.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            || item.text.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      })
    },
  },
  methods: {
    toggleFeedback() {
      this.selectedFeedback = []
      this.$emit('toggleFeedback', !this.openFeedbackDialog);
    },
    async addSelectedFeedback() {
      const projectName = this.selectedIssue.projectName
      const issueKey = this.selectedIssue.key
      const selectedFeedback = this.selectedFeedback
      if (!this.listWithTore){
        await this.$store.dispatch("actionAddFeedbackToIssue", {projectName, issueKey, selectedFeedback})
        this.toggleFeedback();
      }else{
        await this.$store.dispatch("actionAddToreFeedbackToIssue", {projectName, issueKey, selectedFeedback})
        this.toggleFeedback();
      }
    },
    getUnassignedFeedback(){
      if (!this.listWithTore){
        this.$store.dispatch("actionGetUnassignedFeedback", this.selectedIssue.key)
      }else{
        this.$store.dispatch("actionGetToreUnassignedFeedback", this.selectedIssue.key)
      }
    },
  },
};
</script>

<style scoped>
.add-feedback{
  margin-left: 50%
}
</style>