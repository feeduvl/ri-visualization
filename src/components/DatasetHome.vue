<template>
  <v-container>
    <v-card>
      <v-card flat class="header">
        <v-card-title>
          <h1>{{ cardTableTitle }}</h1>
        </v-card-title>
      </v-card>
      <v-layout row wrap>
        <v-flex xs1/>
        <v-flex xs3>
          <v-select
              v-model="selectedDataset"
              :items="datasets"
              label="Dataset"
              @change="loadDataset"
          >
          </v-select>
        </v-flex>
        <v-flex xs5/>
        <v-flex xs2>
          <v-btn small outline color="error" @click="deleteDataset()">
            <!-- <v-icon>clear</v-icon> -->
            Delete Dataset
          </v-btn>
          <v-checkbox
              v-model="confirm_delete"
              :label="`Confirm Deletion`"
              color="error"
              :loading="btnLoading"
              :disabled="btnLoading"
          ></v-checkbox>
        </v-flex>
      </v-layout>
      <v-data-table
          :headers="tableHeaders"
          :items="data"
          :pagination.sync="pagination"
          :loading="loading"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>{{ props.item.number }}</td>
            <td>{{ props.item.text }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-snackbar
        v-model="snackbarVisible"
        :timeout="snackbarTimeout"
        :top=true
    >
      {{ snackbarText }}

      <v-btn
          color="blue"
          text
          @click="closeSnackbar"
      >
        Close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import "moment/locale/de";
import {
  GET_DATASET_ENDPOINT,
  DELETE_DATASET_ENDPOINT
} from "@/RESTconf";
import { mapGetters } from 'vuex'
import {loadDatasets} from "@/RESTcalls";

export default {
  name: "DatasetHome",
  computed: {
    ...mapGetters({
      datasets: 'datasets'
    })
  },
  data() {
    return {
      key: this.$route.path,
      selectedDataset: "",
      snackbarVisible: false,
      snackbarTimeout: 0,
      snackbarText: "",
      loading: false,
      btnLoading: false,
      data: [],
      cardTableTitle: "Dataset Content",
      confirm_delete: false,
      pagination: {
        sortBy: "number",
        descending: false
      },
      tableHeaders: [
        {
          text: "Number",
          align: "center",
          sortable: true,
          value: "number",
          width: "10%"
        },
        {
          text: "Text",
          align: "left",
          sortable: false,
          value: "text",
          width: "90%"
        },

      ],
      errors: [],
      rawData: [],
    };
  },
  methods: {
    async loadDataset() {
      this.data = [];
      this.loading = true;
      axios
          .get(GET_DATASET_ENDPOINT(this.selectedDataset))
          .then(response => {
            this.updateTable(response.data);
            this.loading = false;
          })
          .catch(e => {
            this.errors.push(e);
            this.loading = false;
          });
    },
    updateTable(responseData) {
      var documents = []
      for (var index in responseData["documents"]) {
        var document = responseData["documents"][index];
        var d = { text: document.text,
              number: document.number};
        documents.push(d);
      }
      this.data = documents;
    },
    displaySnackbar(message, timeout=0) {
      this.snackbarText = message;
      this.snackbarVisible = true;
      this.snackbarTimeout = timeout;
    },
    closeSnackbar() {
      this.snackbarVisible = false;
      this.snackbarText = "";
      this.snackbarTimeout = 0;
    },
    async deleteDataset() {
      if (this.confirm_delete) {
        this.btnLoading = true;
        axios
            .delete(DELETE_DATASET_ENDPOINT(this.selectedDataset))
            .then(response => {
              if (response.status > 200 || response.status < 300) {
                this.updateTable([]);
                loadDatasets();
                this.displaySnackbar(response.data.message);
              } else {
                this.displaySnackbar("Error with file deletion!");
              }
            })
            .catch(e => {
              this.errors.push(e);
              this.displaySnackbar("Could not contact backend!");
            });
        this.confirm_delete = false;
        setTimeout(() => {  this.btnLoading = false; }, 1100);
      } else {
        this.displaySnackbar("Please confirm deletion.", 2000);
      }
    },
  },
  mounted() {
  }
};
</script>

<style scoped>
.header {
  margin-top: 20px;
}

.card-title-text {
  font-size: 2em;
  text-align: center;
}

table.v-table tbody tr,
table.v-table tbody td,
table.v-table tbody th {
  min-height: 50px;
  height: 50px;
  max-height: 50px;
}

.row-item {
  margin: 15px 10px 15px 10px;
}

.row-header {
  margin: 15px 10px 35px 10px;
  position: fixed;
}

.action-left {
  margin-right: 5px;
}

.action-right {
  margin-left: 5px;
}

h1 {
  text-align: center;
}

td {
  padding-top: 10px;
  padding-bottom: 10px;
}

.list-enter,
.list-leave-to {
  transition: all 0.5s;
  opacity: 0;
}

.backgroundcolor-red {
  background-color: rgba(255, 0, 0, 0.04);
}

.backgroundcolor-yellow {
  background-color: rgba(255, 249, 196, 0.5);
}

.backgroundcolor-grey {
  background-color: rgba(238, 238, 238, 0.04);
}

.spacing {
  padding-top: 0px;
}

.pointer {
  cursor: pointer;
}

.toggle-effect {
  background-color: #bdbdbd !important;
}

.anti-margin {
  margin-bottom: 0px !important;
}
</style>