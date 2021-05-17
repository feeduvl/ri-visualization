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
              @change="loadData"
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
          ></v-checkbox>
        </v-flex>
      </v-layout>
      <v-data-table
          :headers="tableHeaders"
          :items="data"
          :pagination.sync="pagination"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td>{{ props.item.number }}</td>
            <td>{{ props.item.text }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";
import "moment/locale/de";
import {
  GET_DATASET_ENDPOINT,
  DELETE_DATASET_ENDPOINT
} from "./../RESTconf.js";
import {
  ACTION_SET_FOOTER_TEXT,
  ACTION_SET_PROJECT_TITLE,
  ACTION_SET_TOOLBAR_HEADER, ACTION_SET_TOP_BAR_ALT_TEXT, ACTION_SET_TOP_BAR_LOGO,
} from "./../store/types.js";

export default {
  name: "DatasetHome",
  data() {
    return {
      key: this.$route.path,
      selectedDataset: "",
      datasets: ["Interviews-30", "Forum-Posts-Eclipse"],
      data: [{
        number: 1,
        text: "Test"
      },
        {
          number: 2,
          text: "Test2"
        }],
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
      topBarTitle: "Dataset View",
      projectTitle: "User View Language",
      topBarLogo: require('@/assets/UVL_Logo_small.png'),
      topBarAltText: 'uvl',
      footer: "",
      rawData: [],
    };
  },
  methods: {
    async loadData() {
      axios
          .get(GET_DATASET_ENDPOINT(this.selectedDataset))
          .then(response => {
            this.updateTable(response.data);
          })
          .catch(e => {
            this.errors.push(e);
          });
    },
    updateTable(responseData) {
      this.data = [{
        number: 1,
        text: "Function Testing"
      },
        {
          number: 2,
          text: "Different Content"
        },
        {
          number: 3,
          text: "Another text"
        }];
      //this.data = responseData;
    },
    showMessage(message) {
      // show a message snackbar
    },
    async deleteDataset() {
      if (this.confirm_delete) {
        axios
            .get(DELETE_DATASET_ENDPOINT(this.selectedDataset))
            .then(response => {
              this.updateTable([]);
              this.showMessage();
            })
            .catch(e => {
              this.errors.push(e);
            });
      }
    },
  },
  mounted() {
    this.$store.watch(
        (state, getters) => getters.runs,
        (newValue, oldValue) => {
          this.loadData([...newValue]);
        }
    );
    this.$store.dispatch(ACTION_SET_TOOLBAR_HEADER, this.topBarTitle);
    this.$store.dispatch(ACTION_SET_PROJECT_TITLE, this.projectTitle);
    this.$store.dispatch(ACTION_SET_TOP_BAR_LOGO, this.topBarLogo);
    this.$store.dispatch(ACTION_SET_TOP_BAR_ALT_TEXT, this.topBarAltText);
    this.$store.dispatch(ACTION_SET_FOOTER_TEXT, this.footer);
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