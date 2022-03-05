<template>
  <v-container
      class="agreement-settings">
    <v-card>
      <v-card flat class="header">
        <v-card-title primary-title>
          <h1>New Agreement</h1>
        </v-card-title>

        <v-container>
          <v-layout row wrap>
            <v-flex xs3>
              <v-autocomplete
                  v-model="createNewAgreementDataset"
                  :items="$store.state.datasets"
                  label="Dataset"
                  :loading="$store.state.isLoadingAgreement || $store.state.isLoadingAvailableAgreements"
              >
              </v-autocomplete>
            </v-flex>
            <v-flex xs1/>
            <v-flex xs3/>
            <v-flex xs1/>
            <v-flex xs3/>
          </v-layout>
        </v-container>
        <v-divider/>
        <v-container
            class="new-agreement-params"
        >
          <v-layout row justify-center align-center>
            <v-flex>
              <v-text-field
                  class="annotator-agreement-text-input annotator-agreement-settings__name-input"
                  :disabled="!createNewAgreementDataset"
                  :rules="[!$store.state.available_agreements.filter(a => a.name === addingAgreementName).length > 0 || 'Name is already in use.']"
                  label="Enter a unique agreement name"
                  v-model="addingAgreementName">
              </v-text-field>
            </v-flex>
            <v-flex>
              <v-tooltip bottom>
                <template #activator="{on}">
                  <v-icon
                      v-on="on"
                      :disabled="!addingAgreementName || !createNewAgreementDataset || selectedAnnotationsForAgreement.length < 2 || $store.state.available_agreements.filter(a => a.name === addingAgreementName).length > 0 || $store.state.isLoadingAgreement"
                      color="blue"
                      @click="initializeAgreement"
                  >
                    add
                  </v-icon>
                </template>
                <span>
                            Create new Agreement
                        </span>
              </v-tooltip>
            </v-flex>
          </v-layout>
          <v-layout row justify-center align-center>
            <v-flex>
              <v-checkbox
                  v-model="doAutomaticCompletion"
                  :label="`Automatically resolve all inter-rater concurrences`"
              ></v-checkbox>
            </v-flex>
          </v-layout>
          <v-layout row justify-center align-center>
            <v-flex>
              <SelectableAnnotations v-bind:selected-dataset="createNewAgreementDataset"
                                     @selectAnnotation="updateSelectedAnnotations"/>
            </v-flex>
          </v-layout>


        </v-container>
      </v-card>

    </v-card>
    <v-card>
      <v-card flat class="header">
        <v-card-title>
          <h1>Agreements</h1>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  @click="reloadFields"
                  v-bind="attrs"
                  v-on="on"
                  id="reload-btn"
              >
                refresh
              </v-icon>
            </template>
            <span>Reload</span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-text-field
              v-model="search"
              append-icon="search"
              label="Search for Agreement Name"
              single-line
              hide-details
              clearable
          ></v-text-field>
        </v-card-title>
      </v-card>

      <v-data-table
          :headers="tableHeaders"
          :items="availableAgreements"
          :search="search"
      >
        <template v-slot:items="props">
          <td>{{ props.item.name }}</td>
          <td style="text-align:center">{{
              props.item.last_updated ?
                  props.item.last_updated.replace("Z", "").replace("T", " ").substring(0, 19) : 'last_updated missing'
            }}
          </td>
          <td style="text-align:center">{{
              props.item.created_at ?
                  props.item.created_at.replace("Z", "").replace("T", " ").substring(0, 19) : 'created_at missing'
            }}
          </td>
          <td>{{ props.item.dataset }}</td>
          <td>
            <ul style="list-style-type: none">
              <li v-for="annotation in props.item.annotation_names">
                {{ annotation }}
              </li>
            </ul>
          </td>
          <td>{{ props.item.is_completed ? "Yes" : "No" }}</td>
          <td><span class="icon-column">
                            <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                  small
                                  @click="viewCodeResults(props.item)"
                                  v-bind="attrs"
                                  v-on="on"
                              >
                                visibility
                              </v-icon>
                            </template>
                            <span>View Codes</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                  small
                                  @click="startComparison(props.item)"
                                  v-bind="attrs"
                                  v-on="on"
                              >
                                mode
                              </v-icon>
                            </template>
                            <span>Start Merging</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                  small
                                  @click="agreementToDelete = props.item"
                                  v-bind="attrs"
                                  v-on="on"
                              >
                                delete
                              </v-icon>
                            </template>
                            <span>Delete Agreement</span>
                          </v-tooltip>
                        </span></td>
        </template>
        <template v-slot:no-results>
          <v-alert :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </template>
      </v-data-table>

    </v-card>
    <v-snackbar
        v-model="deleteSnackbarVisible"
        v-if="deleteSnackbarVisible"
        :timeout="0"
        :top=true
    >
      Delete Agreement {{ agreementToDelete.name }}?

      <v-btn
          color="error"
          small
          @click="deleteAgreement"
      >
        Confirm
      </v-btn>

      <v-btn
          color="primary"
          small
          @click="deleteSnackbarVisible = false"
      >
        Cancel
      </v-btn>
    </v-snackbar>
    <v-snackbar
        v-model="initializingNewAgreement"
        :timeout="7000"
        :top="true"
    >
      Initializing Agreement, this may take a while...

    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios"
import {GRAY, GREEN_FILL, RED_FILL} from "@/colors";
import SelectableAnnotations from "@/components/agreement/SelectableAnnotations";

export default {
  name: "AgreementSettings",
  components: {
    SelectableAnnotations
  },
  data: () => {
    return {
      search: "",
      initializingNewAgreement: false,
      selectedAnnotationsForAgreement: [],

      addingAgreementName: "",
      doAutomaticCompletion: true,

      createNewAgreementDataset: null,
      agreementToDelete: null,

      tableHeaders: [
        {
          text: "Name",
          sortable: true,
          width: "10%",
          value: "name"
        },
        {
          text: "Last Updated",
          align: "center",
          sortable: true,
          width: "10%",
          value: "last_updated",
          filterable: false,
        },
        {
          text: "Created",
          align: "center",
          sortable: true,
          width: "10%",
          value: "created_at",
          filterable: false,
        },
        {
          text: "Dataset",
          align: "left",
          sortable: true,
          value: "dataset",
          width: "9%",
          filterable: false,
        },
        {
          text: "Selected Annotations",
          align: "center",
          sortable: true,
          value: "annotations",
          width: "12%",
          filterable: false,
        },
        {
          text: "Is Completed?",
          align: "left",
          sortable: false,
          value: "is_completed",
          width: "5%",
          filterable: false,
        },
        {
          text: "Actions",
          align: "center",
          sortable: false,
          value: 'actions',
          width: "5%",
        },
      ],
    }
  },

  computed: {

      availableAgreements() {
          return this.$store.state.available_agreements
      },

    deleteSnackbarVisible: {
      get() {
        return this.agreementToDelete !== null;
      },
      set(value) {
        if (!value) {
          this.agreementToDelete = null;
        } else {
          console.error("Something went wrong with the delete snackbar")
        }
      }
    },


    agreementSelectedAnnotation: {
      get() {
        return this.$store.state.selected_agreement
      },
      set(value) {
        this.$store.commit("updateSelectedAgreement", value)
      }
    }
  },

  mounted() {
    this.reloadFields();
  },

  methods: {

    initializeAgreement() {
      this.initializingNewAgreement = true;
      this.$store.dispatch(
          'actionGetNewAgreement',
          {
            name: this.addingAgreementName,
            dataset: this.createNewAgreementDataset,
            annotations: this.selectedAnnotationsForAgreement,
            completeConcurrences: this.doAutomaticCompletion
          },
      )
    },

    deleteAgreement() {
      console.log(this.agreementToDelete);
      this.$store.dispatch("actionDeleteAgreement", this.agreementToDelete.name)
      this.agreementToDelete = null;
    },

    viewCodeResults(agreement) {
      this.$store.commit("updateSelectedAgreement", agreement.name)
      this.$store.dispatch('actionGetSelectedAgreement');
      this.$store.commit("toggleAgreementViewingCodes", true)
    },

    startComparison(agreement) {
      this.$store.commit("toggleAgreementViewingCodes", false)
      this.$store.commit("updateSelectedAgreement", agreement.name)
      this.$store.dispatch('actionGetSelectedAgreement');
    },

    reloadFields() {
      this.$store.dispatch("actionGetAllAgreements")
      this.$store.dispatch("actionGetAllAnnotations")
        this.$store.dispatch("actionGetAllRelationships")
        this.$store.dispatch("actionGetAllTores")

    },

    updateSelectedAnnotations(selectedAnnotations) {
      this.selectedAnnotationsForAgreement = selectedAnnotations
    }
  }
}
</script>
