<template>
    <div>
        <v-dialog
                v-model="renameCodeDialog"
                width="500"
                v-if="renameCodeDialog"
        >
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    {{renameCode.name?`Rename Code: '`+renameCode.name+`'`:'Assign Name to all no-name codes?'}}
                </v-card-title>

                <v-card-text>
                     {{renameCode.name?('Rename all '+numOccurencesRename+` occurrences of code: '`+renameCode.name+`'?`):'Assign Name to all occurrences of nameless codes?'}}
                </v-card-text>

                <v-text-field
                        label="New Code Name"
                        v-model="renameCodeNewName"
                    >

                </v-text-field>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            flat
                            @click="renameCodeDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn
                            :disabled="!renameCodeNewName"
                            color="primary"
                            flat
                            @click="doRenameCode"
                    >
                        Rename
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-container
                class="new-annotation-params"
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
                    :headers="index===0 || index >= 4?this_header.concat([{text: 'Actions', value: 'placeholder'}]):this_header"
                    :items="tab_content[index]"
                    :search="search"
                    :loading="$store.state.isLoadingAnnotation"
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
                        <td v-show="index===0">
                            <span class="icon-column">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                          small
                                          @click="showRenameCodeDialog(item)"
                                          v-bind="attrs"
                                          v-on="on"
                                  >
                                    mode
                                  </v-icon>
                                </template>
                                <span>Change Name</span>
                              </v-tooltip>
                            </span>
                        </td>
                        <td v-show="index>=4">
                            <span class="icon-column">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                          small
                                          @click="deleteOccurrence(item, index === headers.length-1)"
                                          v-bind="attrs"
                                          v-on="on"
                                  >
                                    delete
                                  </v-icon>
                                </template>
                                <span>Delete Occurrence</span>
                              </v-tooltip>
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
            <v-tab-item
            :style="'background-color: white;'"
            >
                <ModelView 
                    :tore_code_frequency = "this.tore_code_frequency" 
                    :tore_relationship_frequency = "this.tore_relationship_frequency"
                />
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
    import {Code, Code_user_display_prompt} from "./code"
    import ModelView from "./ModelView"
    export default {
        name: "CodeView",
        components: {
            ModelView
        },
        computed: {
            frozen_codes_copy(){
                console.warn("frozen_codes_copy")
                let ret = []
                for(let c of this.$store.state.codes){
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
            code_name_summary(){
                return this.generate_code_summary(this.frozen_codes_copy.filter(c => c), c => c.name);
            },
            code_tore_summary(){
                return this.generate_code_summary(this.frozen_codes_copy.filter(c => c), c => c.tore)
            },
            tore_code_frequency() {
                var frequencies = {};
                for(let code of this.code_tore_summary) {
                    frequencies[code.tore] = [code.count, code.doc_count];
                }
                return frequencies;
            },
            code_combination_summary(){
                return this.generate_code_summary(this.frozen_codes_copy.filter(c => c), (code) => {
                    if(code.name && !code.tore){
                        return "Name: '"+code.name+"'";
                    } else if (!code.name && code.tore){
                        return "Category: '"+code.tore+"'"
                    } else if(code.name && code.tore){
                        return "Name: '"+code.name + "' Category: '"+code.tore+"'";
                    } else {
                        return ""
                    }
                })
            },
            relationship_summary(){
                return this.generate_relationship_summary(this.$store.state.tore_relationships.filter(r => r))
            },
            relationship_frequency() {
                return this.generate_relationship_frequency(this.$store.state.tore_relationships.filter(r => r), this.frozen_codes_copy)
            },
            tore_relationship_frequency() {
                var frequencies = {};
                for(let frequency of this.relationship_frequency) {
                    frequencies[frequency.name] = [frequency.count, frequency.doc_count];
                }
                return frequencies;
            },
            name_occurrences(){
                return this.generate_occurrences(this.frozen_codes_copy, c => c.name);
            },

            tab_content(){
                //console.log("tab_content")
                let ret = [this.code_name_summary, this.code_tore_summary, this.code_combination_summary, this.relationship_summary,
                    this.name_occurrences,
                    this.generate_occurrences(this.frozen_codes_copy, c => c.tore),
                    this.generate_occurrences(this.frozen_codes_copy, c => (c.name || c.tore)),
                    this.generate_relationship_occurrences(this.frozen_codes_copy)]
                Object.freeze(ret)
                return ret
            },

            numOccurencesRename(){
                //console.log("numOccurrencesRename")
                let count = 0;
                for(let c of this.name_occurrences){
                    if(c){
                        if(c.name === this.renameCode.name){
                            count++;
                        }
                    }
                }
                return count;
            }
        },
        data: () => {
            return {
                paginations: [{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "name"},
                    {page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "tore"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "tore"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "relationship_name"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "name"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "tore"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "name"},{page: 1,
                    descending: false,
                    rowsPerPage: 100,
                    sortBy: "relationship_name"},],
                search: "",
                renameCodeNewName: "",
                renameCodeDialog: false,
                renameCode: null,
                selectedTab: 0,
                tab_titles: ["Word Codes", "Category Codes", "Combination View", "Relationships",
                    "Word Code Occurrences", "Category Code Occurrences", "Combination Code Occurrences", "Relationship Occurrences", "Visualization View"],
                headers: [
                            [  // Tab view 0
                                {
                                    text: 'Code Name',
                                    value: 'name',
                                    align: 'left',
                                    sortable: true
                                },
                                {
                                    text: 'Count',
                                    align: "left",
                                    sortable: true,
                                    value: 'count'
                                },
                                {
                                    text: 'Number of Relationships',
                                    align: "left",
                                    sortable: true,
                                    value: 'relationship_count'
                                },
                                {
                                    text: 'Appearances',
                                    align: "left",
                                    sortable: true,
                                    value: 'doc_count'
                                }
                            ],
                            [
                                {
                                    text: "Category",
                                    align: "left",
                                    sortable: true,
                                    value: "tore"
                                },

                                {
                                    text: 'Occurrences',
                                    align: "left",
                                    sortable: true,
                                    value: 'count'
                                },
                                {
                                    text: 'Number of Relationships',
                                    align: "left",
                                    sortable: true,
                                    value: 'relationship_count'
                                },
                                {
                                    text: 'Appearances',
                                    align: "left",
                                    sortable: true,
                                    value: 'doc_count'
                                }
                            ],
                            [
                                {
                                    text: "Category",
                                    align: "left",
                                    sortable: true,
                                    value: "tore"
                                },
                                {
                                    text: "Name",
                                    align: "left",
                                    sortable: true,
                                    value: "name"
                                },
                                {
                                    text: 'Occurrences',
                                    align: "left",
                                    sortable: true,
                                    value: 'count'
                                },
                                {
                                    text: 'Number of Relationships for this combination',
                                    align: "left",
                                    sortable: true,
                                    value: 'relationship_count'
                                },
                                {
                                    text: 'Appearances',
                                    align: "left",
                                    sortable: true,
                                    value: 'doc_count'
                                }
                            ],
                            [
                                {
                                    text: "Relationship",
                                    align: "left",
                                    sortable: true,
                                    value: "relationship_name",
                                },
                                {
                                    text: "Owning Category",
                                    align: "left",
                                    sortable: true,
                                    value: "owner_tore",
                                },
                                {
                                    text: "Owner Name",
                                    align: "left",
                                    sortable: true,
                                    value: "owner_name",
                                },
                                {
                                    text: "Target",
                                    align: "left",
                                    sortable: true,
                                    value: "target_string"
                                }
                            ],

                            [
                                        {
                                            text: "Code Name",
                                            align: "left",
                                            sortable: true,
                                            value: "name"
                                        },
                                        {
                                            text: "Document",
                                            align: "left",
                                            sortable: true,
                                            value: "document"
                                        },
                                        {
                                            text: "Words",
                                            align: "left",
                                            sortable: true,
                                            value: "words_string"
                                        }
                                    ],
                            [
                                        {
                                            text: "Category",
                                            align: "left",
                                            sortable: true,
                                            value: "tore"
                                        },
                                        {
                                            text: "Document",
                                            align: "left",
                                            sortable: true,
                                            value: "document"
                                        },
                                        {
                                            text: "Words",
                                            align: "left",
                                            sortable: true,
                                            value: "words_string"
                                        },
                                ],
                            [
                                        {
                                            text: "Category",
                                            align: "left",
                                            sortable: true,
                                            value: "tore"
                                        },
                                        {
                                            text: "Name",
                                            align: "left",
                                            sortable: true,
                                            value: "name"
                                        },
                                        {
                                            text: "Document",
                                            align: "left",
                                            sortable: true,
                                            value: "document"
                                        },
                                        {
                                            text: "Words",
                                            align: "left",
                                            sortable: true,
                                            value: "words_string"
                                        },
                                        ],
                            [
                                {
                                    text: "Relationship",
                                    align: "left",
                                    sortable: true,
                                    value: "relationship_name"
                                },

                                {
                                    text: "Owning Category",
                                    align: "left",
                                    sortable: true,
                                    value: "tore"
                                },
                                {
                                    text: "Owner Name",
                                    align: "left",
                                    sortable: true,
                                    value: "name"
                                },
                                {
                                    text: "Document",
                                    align: "left",
                                    sortable: true,
                                    value: "document"
                                },

                                {
                                    text: "Owner Words",
                                    align: "left",
                                    sortable: true,
                                    value: "words_string"
                                },
                                {
                                    text: "Target Words",
                                    align: "left",
                                    sortable: true,
                                    value: "target_string"
                                },
                            ]
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
                this.$store.commit("updateLastAnnotationEditAt")
            },

            showRenameCodeDialog(code){
                this.renameCode = code;
                this.renameCodeDialog = true;
            },

            generate_relationship_summary(list_of_relationships){
                //console.log("generate_relationship_summary")
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
                      this.$store.commit('delete_tore_relationship', relationship);
                    }
                    if(summary.target_tokens === null || summary.target_tokes === undefined){
                        summary.target_string = "";
                    }
                    else{
                        summary.target_string = this.$store.getters.tokenListToString(summary.target_tokens)
                    }
                    summary.placeholder = ""
                    Object.freeze(summary)
                    summaries.push(summary)
                    //console.log(summary)
                }
                Object.freeze(summaries)
                //console.log(summaries)
                return summaries
            },
            generate_relationship_frequency(list_of_relationships, list_of_codes) {
                let frequency = [];
                let found_relations = [];
                let found_documents = {};

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
                            code.relationship_index = relationship_index;
                            if(this.$store.state.tore_relationships[relationship_index]){
                                code.relationship_name = this.$store.state.tore_relationships[relationship_index].relationship_name;
                            }
                            if(!(code.relationship_name in found_documents)) {
                                found_documents[code.relationship_name] = [];
                            }
                            if(!(found_documents[code.relationship_name].includes(code.document))) {
                                found_documents[code.relationship_name].push(code.document);
                            }
                        }
                    }
                }
                for(let relationship of list_of_relationships) {
                    let name = relationship.relationship_name;
                    let index = found_relations.indexOf(name);

                    if (index === -1){
                        let frequencies = {
                            name: name,
                            count: 1,
                            doc_count: found_documents[name].length
                        }
                        frequency.push(frequencies);
                        found_relations.push(name);
                    } else { 
                        frequency[index].count++;
                    }
                }
                for(let frequencies of frequency){
                    Object.freeze(frequencies)
                }
                Object.freeze(frequency)
                return frequency
            },

            /**
             *
             * @param list_of_codes
             * @param get_code_name Group encodings by the result of this mapping, i.e. they are considered the same iff this result is the same
             * @return {[]}
             */
            generate_code_summary(list_of_codes, get_code_name){
                //console.log("generate_code_summary")
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
            
            generate_occurrences(list_of_codes, getName){
                //console.log("generate_occurrences")
                let ret = [];
                for(let c of list_of_codes){
                    if(c && getName(c)){
                        //let code = {name: c.name, tore: c.tore, index: c.index};
                        let code = {...c}
                        code.placeholder = ""
                        let index = 0;
                        console.log("Documentlist: ")
                        for(let docs of this.$store.state.docs){
                            console.log(docs)
                        }
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
                //console.log("generate_relationship_occurrences")
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
                            if(this.$store.state.tore_relationships[relationship_index]){
                                code.relationship_name = this.$store.state.tore_relationships[relationship_index].relationship_name;
                                code.words_string = this.$store.getters.tokenListToString(code.tokens);
                                code.target_string = this.$store.getters.tokenListToString(this.$store.state.tore_relationships[relationship_index].target_tokens)
                                Object.freeze(code)
                                ret.push(code);
                            }
                            else{
                                //console.log("Purging all relationships from code "+ c + " because of faulty relationship");
                                this.$store.commit('delete_all_relationships_from_code', c);

                            }
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
                this.downloadTextFile("annotation_"+this.$store.state.selected_annotation+"_"+dateString+"_"+this.tab_titles[tabIndex].toLowerCase()+".csv", this.getCSVFileString(this.headers[tabIndex], this.tab_content[tabIndex]));
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

                this.$parent.doSaveAnnotation(false)
            }

        }
    }
</script>

<style scoped>

</style>