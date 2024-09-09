<template>
    <v-container
            class="annotator-settings">
        <!--<v-card>
            <v-card flat class="header">
                <v-card-title primary-title>
                    <h1>New Annotation</h1>
                </v-card-title>

                <v-container>
                    <v-layout row wrap>
                        <v-flex xs3>
                            <v-autocomplete
                                    v-model="createNewAnnotationDataset"
                                    :items="$store.state.datasets"
                                    label="Dataset"
                                    :loading="$store.state.isLoadingAnnotation || $store.state.isLoadingAvailableAnnotations"
                            >
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs1/>
                        <div class="mt-3">
                            <v-flex xs12>
                            <label>
                                <input type="radio" id="Word-based" :value="false" v-model="sentenceTokenizationEnabledForAnnotation" />
                                <label for="Word-based"> Word-based Tokenization</label>
                            </label>
                            </v-flex>

                            <v-flex xs12>
                            <label>
                                <input type="radio" id="Sentence-based" :value="true" v-model="sentenceTokenizationEnabledForAnnotation" />
                                <label for="Sentence-based"> Sentence-based Tokenization</label>
                            </label>
                            </v-flex>
                        </div>
                        <v-flex xs1/>
                        <v-flex xs3 id="service-status">
                            <b>Tokenization Service: <span :style="{'color': serviceColor}">{{ serviceStatus }}</span></b>
                        </v-flex>
                        <v-flex xs1/>
                        <v-flex xs3/>
                    </v-layout>
                </v-container>
                <v-divider/>
                <v-container
                    class="new-annotation-params"
                >
                    <v-layout row justify-center align-center>
                        <v-flex>
                            <v-text-field
                                    class="annotator-text-input annotator-settings__name-input"
                                    :disabled="!createNewAnnotationDataset"
                                    :rules="[!$store.state.available_annotations.filter(a => a.name === addingAnnotationName).length > 0 || 'Name is already in use.']"
                                    label="Enter a unique annotation name"
                                    v-model="addingAnnotationName">
                            </v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-tooltip bottom>
                                <template #activator="{on}">
                                    <v-icon
                                            v-on="on"
                                            :disabled="!addingAnnotationName || !createNewAnnotationDataset || $store.state.available_annotations.filter(a => a.name === addingAnnotationName).length > 0 || $store.state.isLoadingAnnotation"
                                            color="blue"
                                            @click="initializeAnnotation"
                                    >
                                        add
                                    </v-icon>
                                </template>
                                <span>
                            Create new Annotation
                        </span>
                            </v-tooltip>
                        </v-flex>
                    </v-layout>

                </v-container>
            </v-card>

        </v-card>-->
        <!--<v-card>
            <v-card flat class="header">
                <v-card-title>
                    <h1>Annotations</h1>
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
                            label="Search for Annotation Name"
                            single-line
                            hide-details
                            clearable
                    ></v-text-field>
                </v-card-title>
            </v-card>

            <v-data-table
                    :headers="tableHeaders"
                    :items="$store.state.available_annotations.filter(a => a && a.name)"
                    :loading="$store.state.isLoadingAnnotation || $store.state.isLoadingAvailableAnnotations"
                    :search="search"
            >
                <template #items="{item}">
                    <tr>
                        <td>{{item.name}}</td>
                        <td style="text-align:center">{{ item.sentence_tokenization_enabled_for_annotation ? "Sentence-based" : "Word-based" }}</td>
                        <td style="text-align:center">{{item.last_updated?
                            item.last_updated.replace("Z", "").replace("T", " ").substring(0, 19):'last_updated missing'
                            }}
                        </td>
                        <td style="text-align:center">{{item.uploaded_at?
                            item.uploaded_at.replace("Z", "").replace("T", " ").substring(0, 19):'uploaded_at missing'
                            }}
                        </td>
                        <td style="text-align:center">{{ item.dataset}}</td>
                        <td style="text-align:center"><span class="icon-column">
                            <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                      small
                                      @click="viewCodeResults(item)"
                                      v-bind="attrs"
                                      v-on="on"
                                      :disabled= "$store.state.isLoadingAnnotation || $store.state.isLoadingAvailableAnnotations"
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
                                      @click="startAnnotating(item)"
                                      v-bind="attrs"
                                      v-on="on"
                                      :disabled= "$store.state.isLoadingAnnotation || $store.state.isLoadingAvailableAnnotations"
                              >
                                mode
                              </v-icon>
                            </template>
                            <span>Start Annotating</span>
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon
                                      small
                                      @click="annotationToDelete = item"
                                      v-bind="attrs"
                                      v-on="on"
                                      :disabled= "$store.state.isLoadingAnnotation || $store.state.isLoadingAvailableAnnotations"
                              >
                                delete
                              </v-icon>
                            </template>
                            <span>Delete Annotation</span>
                          </v-tooltip>
                        </span></td>
                    </tr>
                            </template>
            </v-data-table>
        </v-card>
        <v-snackbar
                v-model="deleteSnackbarVisible"
                v-if="deleteSnackbarVisible"
                :timeout="0"
                :top=true
        >
            Delete Annotation {{ annotationToDelete.name }}?

            <v-btn
                    color="error"
                    small
                    @click="deleteAnnotation"
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
                v-model="initializingNewAnnotation"
                :timeout="7000"
                :top="true"
        >
            Initializing Annotation, this may take a while...

        </v-snackbar>-->
    </v-container>
</template>

<script>
    import axios from "axios"
    import {GREEN_FILL, RED_FILL, GRAY, PRIMARY} from "@/colors";
    import {ANNOTATOR_STATUS_ENDPOINT} from "@/RESTconf"
    export default {
        name: "AnnotatorSettings",
        data: () => {
            return {
                search: "",
                serviceStatus: "Checking",
                serviceColor: GRAY,
                initializingNewAnnotation: false,

                selectAnnotationLocal: null,
                addingAnnotationName: "",
                createNewAnnotationDataset: null,
                annotationToDelete: null,
                sentenceTokenizationEnabledForAnnotation: false,

                tableHeaders: [
                    {
                        text: "Name",
                        sortable: true,
                        width: "10%",
                        value: "name"
                    },
                    {
                        text: "Type of Tokenization",
                        sortable: true,
                        width: "10%",
                        value: "sentence_tokenization_enabled_for_annotation",
                        align: 'center'
                    },
                    {
                        text: "Last Updated",
                        align: "center",
                        sortable: true,
                        width: "10%",
                        value: "last_updated",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Created",
                        align: "center",
                        sortable: true,
                        width: "10%",
                        value: "uploaded_at",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Dataset",
                        align: "left",
                        sortable: false,
                        value: "dataset",
                        width: "9%",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Actions",
                        align: "center",
                        sortable: false,
                        value: 'actions',
                        width: "12%",
                        align: 'center',
                    },
                ],
            }
        },

        computed: {

            deleteSnackbarVisible: {
                get(){
                    return this.annotationToDelete !== null;
                },
                set(value){
                    if(!value){
                        this.annotationToDelete = null;
                    } else {
                        console.error("Something went wrong with the delete snackbar")
                    }
                }
            },

            annotatorSelectedAnnotation: {
                get() {
                    return this.$store.state.selected_annotation
                },
                set(value) {
                    this.$store.commit("updateSelectedAnnotation", value)
                }
            }
        },

        mounted(){
            this.reloadFields();
        },

        methods: {
            initializeAnnotation(){
                this.initializingNewAnnotation = true;
                this.$store.dispatch('actionGetNewAnnotation', {name: this.addingAnnotationName, dataset: this.createNewAnnotationDataset, sentenceTokenizationEnabledForAnnotation: this.sentenceTokenizationEnabledForAnnotation});
                this.sentenceTokenizationEnabledForAnnotation = false;
            },

            deleteAnnotation(){
                console.log(this.annotationToDelete);
                this.$store.dispatch("actionDeleteAnnotation", this.annotationToDelete.name)
                this.annotationToDelete = null;
            },

            viewCodeResults(annotation){
                console.log("viewCodeResults called")
                this.$store.commit("updateSelectedAnnotation", annotation.name)  // repeat startAnnotating here in case implementation changes
                this.$store.commit("updateSentenceTokenizationEnabledForAnnotation", annotation.sentence_tokenization_enabled_for_annotation);
                console.log("get selected annotation now")
                this.$store.dispatch('actionGetSelectedAnnotation');
                this.$store.commit("toggleAnnotatorViewingCodes", true)
            },

            startAnnotating(annotation){
                console.log("startAnnotating called")
                this.$store.commit("toggleAnnotatorViewingCodes", false)
                this.$store.commit("updateSelectedAnnotation", annotation.name)
                console.log("get selected annotation now")
                this.$store.dispatch('actionGetSelectedAnnotation');
            },

            reloadFields(){
                console.log("reloadFields in AnnotatorSettings")
                this.checkServiceStatus();
                this.$store.dispatch("actionGetAllRelationships")
                this.$store.dispatch("actionGetAllTores")
                this.$store.dispatch("actionLoadResults")
                this.$store.dispatch("actionGetAllAnnotations")
            },

            async checkServiceStatus() {
                let status = "checking"
                this.updateStatus(status);
                axios
                    .get(ANNOTATOR_STATUS_ENDPOINT)
                    .then(response => {
                        if (response.data !== null) {
                            status = response.data.status;
                        } else {
                            status = "offline";
                        }
                    })
                    .catch(e => {
                        status = "offline";
                        console.error("Error getting annotator status: "+e)
                    }).finally( () => {
                    this.updateStatus(status);
                });
            },

            updateStatus(status) {
                if (status === "operational") {
                    this.serviceStatus = "Running";
                    this.serviceColor = GREEN_FILL;
                } else if (status === "checking") {
                    this.serviceStatus = "Checking";
                    this.serviceColor = GRAY;
                } else {
                    this.serviceStatus = "Offline";
                    this.serviceColor = RED_FILL;
                }
            },
        }
    }
</script>

<style scoped>
    .icon-column  {
        display: flex;
        justify-content: center;
    }

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
        padding-top: 0;
    }

    .pointer {
        cursor: pointer;
    }

    .toggle-effect {
        background-color: #bdbdbd !important;
    }

    .anti-margin {
        margin-bottom: 0 !important;
    }

    #service-status {
        padding-left: 0;
        padding-top: 25px;
    }

    #reload-btn {
        margin-left: 10px;
    }

    table.v-table tbody td:first-child, table.v-table tbody td:not(:first-child), table.v-table tbody th:first-child, table.v-table tbody th:not(:first-child), table.v-table thead td:first-child, table.v-table thead td:not(:first-child), table.v-table thead th:first-child, table.v-table thead th:not(:first-child) {
        padding: 0 8px;
    }

    .dialog-title {
        font-weight: 500;
    }

</style>