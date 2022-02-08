<template>
    <div>
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
                v-for="(this_header, index) in headers"
                :key="'tab_header'+index"
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
                    :headers="index <= 2?this_header.concat([{text: 'Actions', value: 'placeholder'}]):this_header"
                    :items="tab_content[index]"
                    :search="search"
                    :loading="$store.state.isLoadingAgreement"
                    :rows-per-page-items="[25, 50, 100, 200, {'text':'$vuetify.dataIterator.rowsPerPageAll','value':-1}]"
                    :pagination.sync="paginations[index]"
                >
                    <template v-slot:items="{item}">
                        <td v-for="(column, column_index) in this_header"
                            :key="'header_column_'+index+'_'+column_index"
                            :class="{'text-xs-left': column_index > 0}"
                        >
                            {{ item[column.value] }}
                        </td>
                        <td v-show="index>=4">
                            <span class="icon-column">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-icon
                                            small
                                            @click="$emit('page-to-code', $store.state.codes[item.index])"
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

                    </template>

                </v-data-table>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import {Code_user_display_prompt} from "./code"

export default {
    name: "AgreementCodeView",
    computed: {
        frozen_code_alternatives_copy() {
            console.warn("frozen_word_codes_copy")
            let ret = []
            for (let c of this.$store.state.agreement_code_alternatives) {
                if (!c) {
                    ret.push(c)
                } else {
                    let copy = {...c}
                    Object.freeze(copy)
                    ret.push(copy)
                }
            }
            Object.freeze(ret)
            return ret;
        },

        code_alternatives() {
            console.log("Calculating code alternatives")
            return this.generate_code_alternatives_summary(this.frozen_code_alternatives_copy.filter(c => c));
        },

        statistics() {
            console.log("Calculating Statistics")
            return this.generate_statistics_summary();
        },

        tab_content() {
            console.log("tab_content")
            let ret = [this.code_alternatives[0], this.code_alternatives[1], this.statistics]
            console.log(ret)
            Object.freeze(ret)
            return ret
        }
    },
    data: () => {
        return {
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
                }],
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
                        value: 'token'
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
                        value: 'annotation_names'
                    },
                ],
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
                        value: 'token'
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
                        value: 'annotation_names'
                    },
                ],
                [
                    {
                        text: 'Document',
                        value: 'document',
                        align: 'left',
                        sortable: true
                    },
                    {
                        text: 'Initial Kappa',
                        align: "left",
                        sortable: true,
                        value: 'initial_kappa'
                    },
                    {
                        text: 'Current Kappa',
                        align: "left",
                        sortable: true,
                        value: 'current_kappa'
                    },
                    {
                        text: 'Percentage of Initial agreements',
                        align: "left",
                        sortable: true,
                        value: 'initial_agreements'
                    }
                ],
            ],
        }
    },
    methods: {

        deleteOccurrence(item, isRelationship) {
            if (isRelationship) {
                this.$store.commit("delete_tore_relationship", {index: item.relationship_index, TOREEntity: item.index})
                setTimeout(() => this.$emit("show-snackbar", {"msg": "Deleted relationship"}));
            } else {
                this.$store.commit("delete_code", item);
                setTimeout(() => this.$emit("show-snackbar", {"msg": "Deleted code occurrence: " + Code_user_display_prompt(item)}))
            }
            this.$store.commit("updateLastAgreementEditAt")
        },

        showRenameCodeDialog(code) {
            this.renameCode = code;
            this.renameCodeDialog = true;
        },

        generate_statistics_summary() {
            let summary = {
                document: "document",
                initial_kappa: "initialkappa",
                current_kappa: "currentKappa",
                initial_agreements: "percentage"
            }
            Object.freeze(summary)
            let summaries = [summary]
            Object.freeze(summaries)
            return summaries
        },

        generate_code_alternatives_summary(list_of_code_alternatives) {
            console.log("generate_code_alternatives_summary")
            let resolved_summaries = []
            let unresolved_summaries = []
            let found_codes = []

            for (let codeAlternative of list_of_code_alternatives) {
                console.log(codeAlternative)
                let docName = ""
                for (let doc of this.$store.state.docs) {
                    let tokenIndex = codeAlternative.code.tokens[0]
                    if (tokenIndex >= doc.begin_index && tokenIndex < doc.end_index) {
                        docName = doc.name
                    }
                }
                let relationships = []
                let toreRelationships = codeAlternative.tore_relationships
                let relationshipReferences = codeAlternative.code.relationship_memberships
                for (let relationshipRef of relationshipReferences) {
                    for (let toreRel of toreRelationships) {
                        if (toreRel.index === relationshipRef) {
                            let targetTokenString = ""
                            for (let targetToken of toreRel.target_tokens) {
                                targetTokenString = targetTokenString + targetToken.toString()
                            }
                            let relationship = "${toreRel.relationship_name} -> ${targetTokenString}"
                            relationships.push(relationship)
                            break
                        }
                    }
                }
                // TODO: Schaue nach Relationship nach, lade name und target token
                // Dann generiere Einen string mit "RelName -> TargetTokenname"
                let summary = {
                    document: docName,
                    token: this.$store.getters.tokenListToString(codeAlternative.code.tokens),
                    annotation_names: codeAlternative.annotation_name,
                    word_codes: codeAlternative.code.name,
                    categories: codeAlternative.code.tore,
                    relationships: relationships,
                }
                if (codeAlternative.merge_status === "Pending"){
                    unresolved_summaries.push(summary)
                } else {
                    resolved_summaries.push(summary)
                }
                found_codes.push(name);
            }
            for (let summary of resolved_summaries) {
                Object.freeze(summary)
            }
            for (let summary of unresolved_summaries) {
                Object.freeze(summary)
            }
            Object.freeze(unresolved_summaries)
            Object.freeze(resolved_summaries)
            console.log("Summaries:")
            console.log(unresolved_summaries)
            console.log(resolved_summaries)
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

        downloadAllTabs() {
            let now = new Date(Date.now()).toISOString();
            for (let i = 0; i < this.headers.length; i++) {
                this.downloadTab(i, now)
            }
        },

        doRenameCode() {

            for (let code of this.$store.state.codes) {
                if (code && code.name === this.renameCode.name) {
                    code.name = this.renameCodeNewName;
                }
            }

            this.renameCodeNewName = "";
            this.renameCodeDialog = false;

            this.$parent.doSaveAgreement(false)
        }

    }
}
</script>

<style scoped>

</style>