<template>
  <div>
    <div>
      <v-select
          v-model="selectedFeedbackFileName"
          :items="feedbackFileNames"
          label="Select Feedback"
          @change="sendSelectedFeedbackName()"
      ></v-select>
      <v-select
          v-model="selectedAnnotationFileName"
          :items="annotationFileNames"
          label="Select Annotations"
          @change="sendSelectedAnnotationName()"
      ></v-select>
    </div>
    <v-data-table
        :headers="tableHeaders"
        :items="feedback"
    >
      <template v-slot:items="props">
        <tr @click="showDetails(props.item)">
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.text }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>

// import ExcelJS from 'exceljs';
// import axios from "axios";

import FeedbackService from "@/feedback-service";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Feedback",
  data() {
    return {
      excelData: [],
      tableHeaders: [
        {text: "ID", value: "id"},
        {text: "Text", value: "text"}
      ],
      feedback: [],
      feedbackFileNames:[],
      selectedFeedbackFileName: '',
      annotationFileNames:[],
      selectedAnnotationFileName: '',
    }
  },
  methods: {
    sendSelectedFeedbackName(){
      FeedbackService.saveSelectedFeedback(this.selectedFeedbackFileName).then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    sendSelectedAnnotationName(){
      FeedbackService.assignToreCategoriesToFeedback(this.selectedAnnotationFileName).then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    getFeedback(){
      FeedbackService.getFeedback().then((response) => {
        console.log(response.data)
        this.feedback = response.data
      })
    },
    fetchFeedbackFileNames(){
      FeedbackService.getFeedbackNames().then((response) => {
        console.log(response.data)
        this.feedbackFileNames = response.data
      });
    },
    fetchAnnotationFileNames(){
      FeedbackService.getAnnotationsNames().then((response) => {
        console.log(response.data)
        this.annotationFileNames = response.data
      });
    },
    showDetails(item) {
      this.$router.push({ name: 'tore-feedback', params: { item: item } });
    },
    // async handleFileChange(event) {
    //   const file = event.target.files[0];
    //   const reader = new FileReader();
    //   reader.onload = async event => {
    //     const data = new Uint8Array(event.target.result);
    //     const workbook = new ExcelJS.Workbook();
    //     await workbook.xlsx.load(data);
    //     const worksheet = workbook.getWorksheet(1); // Adjust as needed
    //     const excelData = [];
    //     const headers = worksheet.getRow(1).values;
    //     this.tableHeaders = headers;
    //     console.log(this.tableHeaders)
    //     worksheet.eachRow((row, rowNumber) => {
    //       if (rowNumber !== 1) {
    //         const rowData = row.values;
    //         excelData.push(rowData);
    //       }
    //     });
    //     this.excelData = excelData;
    //     console.log(this.excelData)
    //     const response = await axios.post('http://localhost:8081/save_excel_data', {data: this.excelData});
    //     console.log(response.data.message);
    //   };
    //   reader.readAsArrayBuffer(file);
    //   this.$router.go();
    // },
  },
  created() {
    this.fetchFeedbackFileNames();
    this.fetchAnnotationFileNames();
    this.getFeedback();
  },
}
</script>

<style scoped>


</style>