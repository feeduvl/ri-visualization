<template>
    <div>
        <v-snackbar
            class="exported-agreement-snackbar"
            v-model="show_snackbar"
            :timeout="2500"
        >
            {{this.snackbarText}}
        </v-snackbar>

        <v-container
            class="agreement-downloads"
        >
            <v-layout row justify-left align-center>
                <v-flex>
                    <v-btn
                        @click="downloadSelectedTab">
                        Download this table
                    </v-btn>
                    <v-btn
                        @click="downloadAllTabs">
                        Download All
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-container>
        <v-container
            class="agreement-downloads"
            v-if="$store.state.agreement_is_completed"
        >
            <v-layout row justify-center align-center>
                <v-flex>
                    <v-text-field
                        class="annotator-agreement-text-input annotator-agreement-settings__name-input"
                        :rules="[!$store.state.available_annotations.filter(a => a.name === addingAnnotationName).length > 0 || 'Name is already in use.']"
                        label="Enter a unique annotation name"
                        v-model="addingAnnotationName">
                    </v-text-field>
                </v-flex>
                <v-flex>
                    <v-btn
                        :disabled="!addingAnnotationName || $store.state.available_annotations.filter(a => a.name === addingAnnotationName).length > 0"
                        @click="exportAnnotation">
                        Export As Annotation
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-container>
        <v-tabs
            v-model="selectedTab">
            <v-tab
                v-for="(item, index) in tab_titles"
                :key="'tab_title_'+index">
                <span>
                    {{ item }}
                </span>
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="selectedTab">
            <v-tab-item
                :style="'background-color: white;'"
                :key="'tab_header0'"
            >

                <v-container>
                    <v-layout>
                        <v-spacer></v-spacer>
                        <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                            clearable
                        ></v-text-field>
                    </v-layout>

                </v-container>
                <v-data-table
                    :headers="headers[0].concat([{text: 'Actions', value: 'placeholder'}])"
                    :items="tab_content[0]"
                    :search="search"
                    :loading="$store.state.isLoadingAgreement"
                    :rows-per-page-items="[25, 50, 100, 200, {'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}]"
                    :pagination.sync="paginations[0]"
                >
                    <template v-slot:items="props">
                        <tr v-bind:class="{'trBeginning': props.item.isFirst}">
                            <td :key="'header_column_0_0'"
                                :class="{'text-xs-left': 0 > 0}"
                                v-if="props.item.isFirst"
                                :rowspan="props.item.numPossibilities"
                            >{{ props.item.document }}</td>
                            <td :key="'header_column_0_1'"
                                :class="{'text-xs-left': 1 > 0}"
                                v-if="props.item.isFirst"
                                :rowspan="props.item.numPossibilities"
                            >{{ props.item.token_names }}</td>
                            <td :key="'header_column_0_2'"
                                :class="{'text-xs-left': 2 > 0}"
                            >{{ props.item.word_codes }}</td>
                            <td :key="'header_column_0_3'"
                                :class="{'text-xs-left': 3 > 0}"
                            >{{ props.item.categories }}</td>
                            <td :key="'header_column_0_5'"
                                :class="{'text-xs-left': 5 > 0}"
                            >
                                <ul style="list-style-type: none">
                                    <li v-for="relationship in props.item.relationships">
                                        {{ relationship }}
                                    </li>
                                </ul>
                            </td>
                            <td :key="'header_column_0_6'"
                                :class="{'text-xs-left': 6 > 0}"
                            >{{ props.item.annotation_name }}</td>
                            <td>
                                <span class="icon-column">
                                    <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-icon
                                          small
                                          @click="acceptCode(props.item)"
                                          v-bind="attrs"
                                          v-on="on"
                                      >
                                        check
                                      </v-icon>
                                    </template>
                                    <span>Accept</span>
                                  </v-tooltip>
                                    <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-icon
                                          small
                                          @click="rejectCode(props.item)"
                                          v-bind="attrs"
                                          v-on="on"
                                      >
                                        close
                                      </v-icon>
                                    </template>
                                    <span>Reject</span>
                                  </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-icon
                                                small
                                                @click="$emit('page-to-code', $store.state.agreement_code_alternatives[props.item.index].code)"
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                            visibility
                                            </v-icon>
                                        </template>
                                        <span>Go to Occurrence</span>
                                    </v-tooltip>
                                </span>
                            </td>
                        </tr>

                    </template>

                </v-data-table>
            </v-tab-item>
            <v-tab-item
                :style="'background-color: white;'"
                :key="'tab_header1'"
            >

                <v-container>
                    <v-layout>
                        <v-spacer></v-spacer>
                        <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                            clearable
                        ></v-text-field>
                    </v-layout>

                </v-container>
                <v-data-table
                    :headers="headers[1].concat([{text: 'Actions', value: 'placeholder'}])"
                    :items="tab_content[1]"
                    :search="search"
                    :loading="$store.state.isLoadingAgreement"
                    :rows-per-page-items="[25, 50, 100, 200, {'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}]"
                    :pagination.sync="paginations[1]"
                >
                    <template v-slot:items="props">
                        <tr v-bind:class="{'trBeginning': props.item.isFirst}">
                            <td :key="'header_column_0_0'"
                                :class="{'text-xs-left': 0 > 0}"
                                v-if="props.item.isFirst"
                                :rowspan="props.item.numPossibilities"
                            >{{ props.item.document }}</td>
                            <td :key="'header_column_0_1'"
                                :class="{'text-xs-left': 1 > 0}"
                                v-if="props.item.isFirst"
                                :rowspan="props.item.numPossibilities"
                            >{{ props.item.token_names }}</td>
                            <td :key="'header_column_0_2'"
                                :class="{'text-xs-left': 2 > 0}"
                            >{{ props.item.word_codes }}</td>
                            <td :key="'header_column_0_3'"
                                :class="{'text-xs-left': 3 > 0}"
                            >{{ props.item.categories }}</td>
                            <td :key="'header_column_0_5'"
                                :class="{'text-xs-left': 5 > 0}"
                            >
                                <ul style="list-style-type: none">
                                    <li v-for="relationship in props.item.relationships">
                                        {{ relationship }}
                                    </li>
                                </ul>
                            </td>
                            <td :key="'header_column_0_6'"
                                :class="{'text-xs-left': 6 > 0}"
                            >{{ props.item.annotation_name }}</td>
                            <td>
                                <span class="icon-column">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-icon
                                                small
                                                @click="$emit('page-to-code', $store.state.agreement_code_alternatives[props.item.index].code)"
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                            visibility
                                            </v-icon>
                                        </template>
                                        <span>Go to Occurrence</span>
                                    </v-tooltip>
                                </span>
                            </td>
                        </tr>

                    </template>

                </v-data-table>
            </v-tab-item>
            <v-tab-item
                :style="'background-color: white;'"
                :key="'tab_header2'"
            >
                <v-container
                    class="agreement-statistics"
                >
                    <v-layout row justify-left align-center>
                        <v-spacer></v-spacer>
                        <v-flex class="text-right">
                            <v-btn
                                @click="refreshKappas">
                                Refresh current Kappa values
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>

                <v-container>
                    <v-layout>
                        <v-spacer></v-spacer>
                        <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                            clearable
                        ></v-text-field>
                    </v-layout>

                </v-container>
                <v-data-table
                    :headers="headers[2]"
                    :items="tab_content[2]"
                    :search="search"
                    :loading="$store.state.isLoadingAgreement || $store.state.setIsRefreshingAgreement"
                    :rows-per-page-items="[25, 50, 100, 200, {'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}]"
                    :pagination.sync="paginations[2]"
                >
                    <template v-slot:items="{item}">
                        <td v-for="(column, column_index) in headers[2]"
                            :key="'header_column_2_'+column_index"
                            :class="{'text-xs-left': column_index > 0}"
                        >
                            {{ item[column.value] }}
                        </td>
                    </template>

                </v-data-table>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import {arrayOfIntSort} from "./ArrayUtils"
import {arraysEqual} from "./ArrayUtils"
import {store} from "../../store/store";

export default {
    name: "AgreementCodeView",
    computed: {
        code_alternatives() {
            console.log("Calculating code alternatives")
            return this.generate_code_alternatives_summary(this.$store.state.agreement_code_alternatives.filter(c => c));
        },

        statistics() {
            console.log("Calculating Statistics")
            return this.generate_statistics_summary();
        },

        tab_content() {
            console.log("tab_content")
            let ret = [this.code_alternatives[0], this.code_alternatives[1], this.statistics]
            console.log(ret)
            return ret
        }
    },
    data: () => {
        return {
            addingAnnotationName: "",
            snackbarText: "",
            show_snackbar: false,
            paginations: [{
                page: 1,
                descending: false,
                rowsPerPage: 100,
                sortBy: "document"
            },
                {
                    page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "document"
                }
            ],
            search: "",
            renameCodeNewName: "",
            renameCodeDialog: false,
            renameCode: null,
            selectedTab: 0,
            tab_titles: ["Unresolved Codes", "Resolved Codes", "Statistics"],
            headers: [
                [  // Tab view 0
                    {
                        text: 'Document',
                        value: 'document',
                        align: 'left',
                        sortable: true
                    },
                    {
                        text: 'Token Names',
                        align: "left",
                        sortable: true,
                        value: 'token_names'
                    },
                    {
                        text: 'Word Code',
                        align: "left",
                        sortable: true,
                        value: 'word_codes'
                    },
                    {
                        text: 'Category',
                        align: "left",
                        sortable: true,
                        value: 'categories'
                    },
                    {
                        text: 'Relationships',
                        align: "left",
                        sortable: true,
                        value: 'relationships'
                    },
                    {
                        text: 'Annotation Name',
                        align: "left",
                        sortable: true,
                        value: 'annotation_name'
                    },
                ],
                [  // Tab view 1
                    {
                        text: 'Document',
                        value: 'document',
                        align: 'left',
                        sortable: true
                    },
                    {
                        text: 'Token Names',
                        align: "left",
                        sortable: true,
                        value: 'token_names'
                    },
                    {
                        text: 'Word Code',
                        align: "left",
                        sortable: true,
                        value: 'word_codes'
                    },
                    {
                        text: 'Category',
                        align: "left",
                        sortable: true,
                        value: 'categories'
                    },
                    {
                        text: 'Relationships',
                        align: "left",
                        sortable: true,
                        value: 'relationships'
                    },
                    {
                        text: 'Annotation Name',
                        align: "left",
                        sortable: true,
                        value: 'annotation_name'
                    },
                ],
                [// Tab view 2
                    {
                        text: 'Kappa Name',
                        value: 'kappa_name',
                        align: 'left',
                    },
                    {
                        text: 'Initial Value',
                        align: "left",
                        value: 'kappa_initial'
                    },
                    {
                        text: 'Current Value',
                        align: "left",
                        value: 'kappa_current'
                    },
                ],
            ],
        }
    },
    methods: {

        acceptCode(alternative) {
            this.$store.commit('changeStatusOfCodeAlternative', {
                status: "Accepted",
                index: alternative.index
            })
            this.$store.commit("updateResolvedStatusOfTokens", {
                tokens: alternative.token,
                codeIndex: alternative.index
            })
            this.$emit('resolvedStatusOfTokensUpdated')
        },

        rejectCode(alternative) {
            this.$store.commit('changeStatusOfCodeAlternative', {
                status: "Declined",
                index: alternative.index
            })
            this.$store.commit("updateResolvedStatusOfTokens", {
                tokens: alternative.token,
                codeIndex: alternative.index
            })
            this.$emit('resolvedStatusOfTokensUpdated')
        },

        exportAnnotation(){
            console.log("Start export")
            let agreementName = this.$store.state.selected_agreement
            this.$store.dispatch('actionExportAgreement',
                {
                    agreementName: agreementName,
                    newAnnotationName: this.addingAnnotationName
                });
            this.doShowSnackbar({msg:"Agreement exported as annotation."})
        },

        doShowSnackbar({msg}){
            this.snackbarText = msg;
            this.show_snackbar = true;
        },

        showRenameCodeDialog(code) {
            this.renameCode = code;
            this.renameCodeDialog = true;
        },

        generate_statistics_summary() {
            let agreementStatistics = this.$store.state.agreement_statistics
            let summaries = []

            agreementStatistics.forEach(function (value) {
                let summary = {
                    kappa_name: value.kappa_name,
                    kappa_initial: value.initial_kappa,
                    kappa_current: value.current_kappa
                }
                Object.freeze(summary)
                summaries.push(summary)
            })

            Object.freeze(summaries)
            return summaries
        },

        // Transform summaries into a format that can be displayed as a grouped table
        transformSummariesForDisplaying(summaries) {

            summaries.sort((a, b) => arrayOfIntSort(a, b));

            let lastToken = summaries[0].token
            let numPossibilities = 0

            // Handle index 0
            summaries[0].isFirst = true
            numPossibilities++

            for (let idx = 1; idx <= summaries.length; idx++) {
                if(typeof summaries[idx] === 'undefined') {
                    for (let j = 1; j <= numPossibilities; j++){
                        summaries[idx-j].numPossibilities = numPossibilities
                    }
                } else {
                    if (arraysEqual(summaries[idx].token, lastToken)) {
                        summaries[idx].isFirst = false
                        numPossibilities++
                    } else {
                        for (let j = 1; j <= numPossibilities; j++){
                            summaries[idx-j].numPossibilities = numPossibilities
                        }
                        numPossibilities = 1
                        summaries[idx].isFirst = true
                        lastToken = summaries[idx].token
                    }
                }
            }
            return summaries
        },

        getDocNames: function (codeAlternative) {
            let docName = ""
            for (let doc of this.$store.state.docs) {
                let tokenIndex = codeAlternative.code.tokens[0]
                if (tokenIndex >= doc.begin_index && tokenIndex < doc.end_index) {
                    docName = doc.name
                }
            }
            return docName;
        },

        getRelationshipsForDisplay: function (codeAlternative) {
            let relationships = []
            let toreRelationships = this.$store.state.agreement_tore_relationships
            let relationshipReferences = codeAlternative.code.relationship_memberships
            for (let relationshipRef of relationshipReferences) {
                for (let toreRel of toreRelationships) {
                    if (toreRel.index === relationshipRef) {
                        let targetTokenString = []
                        for (let targetToken of toreRel.target_tokens) {
                            targetTokenString.push(targetToken)
                        }
                        let relationship = toreRel.relationship_name + "->" + this.$store.getters.tokenListToString(targetTokenString)
                        relationships.push(relationship)
                        break
                    }
                }
            }
            return relationships;
        },

        generate_code_alternatives_summary(list_of_code_alternatives) {
            console.log("generate_code_alternatives_summary")
            let resolved_summaries = []
            let unresolved_summaries = []
            let found_codes = []

            for (let codeAlternative of list_of_code_alternatives) {
                let docName = this.getDocNames(codeAlternative);
                let relationships = this.getRelationshipsForDisplay(codeAlternative);

                let summary = {
                    document: docName,
                    token: codeAlternative.code.tokens,
                    annotation_name: codeAlternative.annotation_name,
                    word_codes: codeAlternative.code.name,
                    categories: codeAlternative.code.tore,
                    relationships: relationships,
                    index: codeAlternative.index
                }
                if (codeAlternative.merge_status === "Pending"){
                    unresolved_summaries.push(summary)
                } else if (codeAlternative.merge_status === "Accepted") {
                    resolved_summaries.push(summary)
                }
                found_codes.push(name);
            }

            if (resolved_summaries.length !== 0){
                resolved_summaries = this.transformSummariesForDisplaying(resolved_summaries)
            }
            for (let summary of resolved_summaries) {
                let token = summary.token
                summary.token_names = this.$store.getters.tokenListToString(token)
            }

            if (unresolved_summaries.length !== 0){
                unresolved_summaries = this.transformSummariesForDisplaying(unresolved_summaries)
            }
            for (let summary of unresolved_summaries) {
                let token = summary.token
                summary.token_names = this.$store.getters.tokenListToString(token)
            }

            return [unresolved_summaries, resolved_summaries]
        },

        /**
         *
         * @param tableHeadersDef List of headers objects containing the text to be written to the file as well as the attribute name of the items that should be written to the file under this header
         * @param itemsList List of elements to be transformed into rows
         */
        getCSVFileString(tableHeadersDef, itemsList) {
            let out = "";

            let delim = '|';
            let count = 0;
            for (let header of tableHeadersDef) {
                out += header.text;
                if (count < tableHeadersDef.length - 1) {
                    out += delim;
                }
                count++;
            }
            out += '\n'

            for (let item of itemsList) {
                count = 0;
                for (let header of tableHeadersDef) {
                    let val = item[header.value];
                    out += (val === 0 ? "0" : (val || ""))
                    if (count < tableHeadersDef.length - 1) {
                        out += delim;
                    }
                    count++;
                }
                out += '\n'
            }

            return out;

        },

        downloadTextFile(fileName, fileContents) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContents));
            element.setAttribute('download', fileName);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        },

        downloadTab(tabIndex, dateString) {
            this.downloadTextFile("agreement_" + this.$store.state.selected_agreement + "_" + dateString + "_" + this.tab_titles[tabIndex].toLowerCase() + ".csv", this.getCSVFileString(this.headers[tabIndex], this.tab_content[tabIndex]));
        },

        downloadSelectedTab() {
            this.downloadTab(this.selectedTab, new Date(Date.now()).toISOString())
        },

        refreshKappas() {
            this.$store.dispatch("actionRefreshStatisticsOfAgreement")
        },

        downloadAllTabs() {
            let now = new Date(Date.now()).toISOString();
            for (let i = 0; i < this.headers.length; i++) {
                this.downloadTab(i, now)
            }
        },


    }
}
</script>


<style lang="scss">
tbody {
    tr:hover {
        background-color: transparent !important;
    }
}


table.v-table tbody tr,
table.v-table tbody th {
    min-height: 50px;
    height: 50px;
    max-height: 50px;
}

.trBeginning {
    border-top: 1px solid #404040 !important;
}
</style>