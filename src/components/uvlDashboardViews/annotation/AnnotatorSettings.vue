<template>
    <v-container
            class="annotator-settings">
    </v-container>
</template>

<script>
    import axios from "axios"
    import {GREEN_FILL, RED_FILL, GRAY} from "@/colors";
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
                        sortable: true,
                        width: "10%",
                        value: "last_updated",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Created",
                        sortable: true,
                        width: "10%",
                        value: "uploaded_at",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Dataset",
                        sortable: false,
                        value: "dataset",
                        width: "9%",
                        filterable: false,
                        align: 'center',
                    },
                    {
                        text: "Actions",
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
            viewCodeResults(annotation){
                this.$store.commit("updateSelectedAnnotation", annotation.name) // repeat startAnnotating here in case implementation changes
                this.$store.commit("updateSentenceTokenizationEnabledForAnnotation", annotation.sentence_tokenization_enabled_for_annotation);
                this.$store.dispatch('actionGetSelectedAnnotation');
                this.$store.commit("toggleAnnotatorViewingCodes", true)
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
    table.v-table tbody tr,
    table.v-table tbody td,
    table.v-table tbody th {
        min-height: 50px;
        height: 50px;
        max-height: 50px;
    }

    h1 {
        text-align: center;
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