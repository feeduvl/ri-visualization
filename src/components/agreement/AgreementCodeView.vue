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
                    {{item}}
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
                    :headers="index <= 4?this_header.concat([{text: 'Actions', value: 'placeholder'}]):this_header"
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
                            {{item[column.value]}}
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
    import {Code, Code_user_display_prompt} from "./code"
    export default {
        name: "AgreementCodeView",
        computed: {
            frozen_word_codes_copy(){
                console.warn("frozen_word_codes_copy")
                let ret = []
                for(let c of this.$store.state.agreement_word_codes){
                    if(!c){
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

            word_codes(){
                return this.generate_word_codes_summary(this.frozen_word_codes_copy.filter(c => c));
            },

            tab_content(){
                console.log("tab_content")
                let ret = [this.word_codes, this.word_codes, this.word_codes, this.word_codes, this.word_codes]
                Object.freeze(ret)
                return ret
            }
        },
        data: () => {
            return {
              paginations: [{page: 1,
                descending: false,
                rowsPerPage: 100,
                sortBy: "document"},
                {page: 1,
                  descending: false,
                  rowsPerPage: 100,
                  sortBy: "document"},{page: 1,
                  descending: false,
                  rowsPerPage: 100,
                  sortBy: "document"},{page: 1,
                  descending: false,
                  rowsPerPage: 100,
                  sortBy: "document"},{page: 1,
                  descending: false,
                  rowsPerPage: 100,
                  sortBy: "document"}],
              search: "",
              renameCodeNewName: "",
              renameCodeDialog: false,
              renameCode: null,
              selectedTab: 0,
              tab_titles: ["Word Codes", "Category Codes", "Relationship Codes", "Overlapping Tokens", "Statistics"],
              headers: [
                [  // Tab view 0
                  {
                    text: 'Document',
                    value: 'document',
                    align: 'left',
                    sortable: true
                  },
                  {
                    text: 'Tokens',
                    align: "left",
                    sortable: true,
                    value: 'token'
                  },
                  {
                    text: 'Annotation',
                    align: "left",
                    sortable: true,
                    value: 'annotation_names'
                  },
                  {
                    text: 'Word Code',
                    align: "left",
                    sortable: true,
                    value: 'word_codes'
                  }
                ],
                [
                  {
                    text: 'Document',
                    value: 'document',
                    align: 'left',
                    sortable: true
                  },
                  {
                    text: 'Tokens',
                    align: "left",
                    sortable: true,
                    value: 'token'
                  },
                  {
                    text: 'Annotation',
                    align: "left",
                    sortable: true,
                    value: 'annotation_names'
                  },
                  {
                    text: 'Category',
                    align: "left",
                    sortable: true,
                    value: 'categories'
                  }
                ],
                [
                  {
                    text: 'Document',
                    value: 'document',
                    align: 'left',
                    sortable: true
                  },
                  {
                    text: 'Tokens',
                    align: "left",
                    sortable: true,
                    value: 'token'
                  },
                  {
                    text: 'Annotation',
                    align: "left",
                    sortable: true,
                    value: 'annotation_names'
                  },
                  {
                    text: 'Relationship',
                    align: "left",
                    sortable: true,
                    value: 'relationships'
                  }
                ],
                [
                  {
                    text: 'Document',
                    value: 'document',
                    align: 'left',
                    sortable: true
                  },
                  {
                    text: 'Tokens',
                    align: "left",
                    sortable: true,
                    value: 'token'
                  },
                  {
                    text: 'Annotation',
                    align: "left",
                    sortable: true,
                    value: 'annotation_names'
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
                    text: 'Relationship',
                    align: "left",
                    sortable: true,
                    value: 'relationships'
                  }
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

            deleteOccurrence(item, isRelationship){
                if(isRelationship){
                    this.$store.commit("delete_tore_relationship", {index: item.relationship_index, TOREEntity: item.index})
                    setTimeout(()=> this.$emit("show-snackbar", {"msg": "Deleted relationship"}));
                } else {
                    this.$store.commit("delete_code", item);
                    setTimeout(()=> this.$emit("show-snackbar", {"msg":"Deleted code occurrence: "+Code_user_display_prompt(item)}))
                }
                this.$store.commit("updateLastAgreementEditAt")
            },

            showRenameCodeDialog(code){
                this.renameCode = code;
                this.renameCodeDialog = true;
            },

            generate_relationship_summary(list_of_relationships){
                console.log("generate_relationship_summary")
                let summaries = []

                for(let relationship of list_of_relationships){
                    let summary = {...relationship}
                    if(summary.TOREEntity){
                      let owner = this.frozen_codes_copy[summary.TOREEntity];
                      summary.owner_name = owner.name;
                      summary.owner_tore = owner.tore;
                    } else {
                      console.error("Got undefined TOREEntity for relationship")
                      console.error(relationship)
                      summary.owner_name = "";
                      summary.owner_tore = "";
                    }
                    summary.target_string = this.$store.getters.tokenListToString(summary.target_tokens)
                    summary.placeholder = ""
                    Object.freeze(summary)
                    summaries.push(summary)
                }
                Object.freeze(summaries)
                return summaries
            },


            /**
             *
             * @param list_of_codes
             * @param get_code_name Group encodings by the result of this mapping, i.e. they are considered the same iff this result is the same
             * @return {[]}
             */
            generate_code_summary(list_of_codes, get_code_name){
                console.log("generate_code_summary")
                let summaries = []
                let found_codes = []

                for(let code of list_of_codes){
                    let name = get_code_name(code);
                    if(!name){
                        //console.warn("generate_code_summary Got empty-name code, skipping: ");
                        //console.warn(code);
                        continue;
                    }
                    let index = found_codes.indexOf(name)

                    // updateable fields

                    let found_in_docs = []  // first doc is "all"
                    for(let doc of this.$store.state.docs){
                        found_in_docs.push(code.tokens.find(t_index => t_index >= doc.begin_index && t_index < doc.end_index) !== undefined)
                    }

                    let relationship_count = code.relationship_memberships.length;

                    if (index === -1){
                        let summary = {
                            name: code.name,
                            tore: code.tore,
                            count: 1,
                            relationship_count,
                            doc_count: found_in_docs.filter(b => b).length - 1,
                            found_in_docs,
                            placeholder: ""
                        }
                        summaries.push(summary)
                        found_codes.push(name);

                    } else {  // update information if necessary
                        summaries[index].relationship_count += relationship_count;
                        summaries[index].count++;
                        summaries[index].found_in_docs = summaries[index].found_in_docs.map((b, index) => b || found_in_docs[index])
                        summaries[index].doc_count = summaries[index].found_in_docs.filter(b => b).length - 1
                    }
                }
                for(let summary of summaries){
                    Object.freeze(summary)
                }
                Object.freeze(summaries)
                return summaries
            },


            generate_word_codes_summary(list_of_word_codes){
                console.log("generate_word_code_summary")
                let summaries = []
                let found_codes = []

                for(let code of list_of_word_codes){

                    let docName = ""
                    for(let doc of this.$store.state.docs){
                        let tokenIndex = code.tokens.first()
                        if (tokenIndex >= doc.begin_index && tokenIndex < doc.end_index) {
                           docName = doc.name
                        }
                    }
                    let summary = {
                        documentName: docName,
                        tokens: code.tokens,
                        annotationName: code.annotation_name,
                        wordCode: code.name
                    }
                    summaries.push(summary)
                    found_codes.push(name);
                }
                for(let summary of summaries){
                    Object.freeze(summary)
                }
                Object.freeze(summaries)
                return summaries
            },

            generate_occurrences(list_of_codes, getName){
                console.log("generate_occurrences")
                let ret = [];
                for(let c of list_of_codes){
                    if(c && getName(c)){
                        //let code = {name: c.name, tore: c.tore, index: c.index};
                        let code = {...c}
                        code.placeholder = ""
                        let index = 0;
                        for(let doc of this.$store.state.docs){
                            if(index !== 0 && code.tokens.find(t_index => t_index >= doc.begin_index && t_index < doc.end_index) !== undefined){
                                code.document = doc.name;
                                code.document_index = index;
                                break;
                            }
                            index++;
                        }
                        if(!code.document){
                            console.error("Didn't find document for code: "+Code_user_display_prompt(code));
                            console.error(code);
                        }

                        code.words_string = this.$store.getters.tokenListToString(code.tokens);
                        Object.freeze(code)
                        ret.push(code);
                    }
                }
                Object.freeze(ret)
                return ret;
            },

            generate_relationship_occurrences(list_of_codes){
                console.log("generate_relationship_occurrences")
                let ret = [];
                for(let c of list_of_codes){
                    if(c && c.relationship_memberships.length){
                        for(let relationship_index of c.relationship_memberships){
                            //let code = {name: c.name, tore: c.tore, index: c.index};
                            let code = {...c};
                            let index = 0;
                            for(let doc of this.$store.state.docs){
                                if(index !== 0 && code.tokens.find(t_index => t_index >= doc.begin_index && t_index < doc.end_index) !== undefined){
                                    code.document = doc.name;
                                    code.document_index = index;
                                    break;
                                }
                                index++;
                            }
                            if(!code.document){
                                console.error("Didn't find document for code: "+Code_user_display_prompt(code));
                                console.error(code);
                            }

                            code.placeholder = ""
                            code.relationship_index = relationship_index;
                            code.relationship_name = this.$store.state.tore_relationships[relationship_index].relationship_name;
                            code.words_string = this.$store.getters.tokenListToString(code.tokens);
                            code.target_string = this.$store.getters.tokenListToString(this.$store.state.tore_relationships[relationship_index].target_tokens)
                            Object.freeze(code)
                            ret.push(code);
                        }
                    }
                }
                Object.freeze(ret)
                return ret;
            },


            /**
             *
             * @param tableHeadersDef List of headers objects containing the text to be written to the file as well as the attribute name of the items that should be written to the file under this header
             * @param itemsList List of elements to be transformed into rows
             */
            getCSVFileString(tableHeadersDef, itemsList){
                let out = "";

                let delim = '|';
                let count = 0;
                for(let header of tableHeadersDef){
                    out+=header.text;
                    if(count < tableHeadersDef.length - 1){
                        out+=delim;
                    }
                    count++;
                }
                out+='\n'

                for(let item of itemsList){
                    count = 0;
                    for(let header of tableHeadersDef){
                        let val = item[header.value];
                        out+= (val===0?"0":(val||""))
                        if(count < tableHeadersDef.length - 1){
                            out+=delim;
                        }
                        count++;
                    }
                    out+='\n'
                }

                return out;

            },

            downloadTextFile(fileName, fileContents){
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContents));
                element.setAttribute('download', fileName);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            },

            downloadTab(tabIndex, dateString){
                this.downloadTextFile("agreement_"+this.$store.state.selected_agreement+"_"+dateString+"_"+this.tab_titles[tabIndex].toLowerCase()+".csv", this.getCSVFileString(this.headers[tabIndex], this.tab_content[tabIndex]));
            },

            downloadSelectedTab(){
                this.downloadTab(this.selectedTab, new Date(Date.now()).toISOString())
            },

            downloadAllTabs(){
                let now = new Date(Date.now()).toISOString();
                for(let i = 0; i < this.headers.length; i++){
                    this.downloadTab(i, now)
                }
            },

            doRenameCode(){

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