<template>
    <div>
        <v-container
                class="new-annotation-params"
        >
            <v-layout row justify-left align-center>
                <v-flex>
                    <v-btn
                        @click="downloadSelectedTab">
                        Download this tab
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
                    v-for="(this_header, index) in headers"
                    :key="'tab_header'+index"
            >
                <v-data-table
                    :headers="this_header"
                    :items="tab_content[index]">
                    <template v-slot:items="{item}">
                        <td v-for="(column, column_index) in this_header"
                            :key="'header_column_'+index+'_'+column_index"
                            :class="{'text-xs-left': column_index > 0}"
                        >
                            {{item[column.value]}}
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
        name: "CodeView",
        computed: {
            code_name_summary(){
                return this.generate_code_summary(this.$store.state.codes.filter(c => c && c.name), c => c.name);
            },
            code_tore_summary(){
                return this.generate_code_summary(this.$store.state.codes.filter(c => c && c.tore), c => c.tore)
            },
            code_combination_summary(){
                return this.generate_code_summary(this.$store.state.codes.filter(c => c), Code_user_display_prompt)
            },
            relationship_summary(){
                return this.generate_relationship_summary(this.$store.state.tore_relationships.filter(c => c))
            },

            tab_content(){
                return [this.code_name_summary, this.code_tore_summary, this.code_combination_summary, this.relationship_summary]
            }

        },
        data: () => {
            return {
                selectedTab: 0,
                tab_titles: ["Name", "TORE Entity", "Combination View", "Relationships"],
                headers: [
                            [  // Tab view 0
                                {
                                    text: 'Code Name',
                                    align: 'left',
                                    sortable: true,
                                    value: 'name'
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
                                    text: 'Num. of Documents with this code',
                                    align: "left",
                                    sortable: true,
                                    value: 'doc_count'
                                }
                            ],

                            [
                                {
                                    text: "TORE Entity",
                                    align: "left",
                                    sortable: true,
                                    value: "tore"
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
                                    text: 'Num. of Documents with this tore entity',
                                    align: "left",
                                    sortable: true,
                                    value: 'doc_count'
                                }
                            ],
                            [
                                {
                                    text: "Name",
                                    align: "left",
                                    sortable: true,
                                    value: "name"
                                },
                                {
                                    text: "TORE Entity",
                                    align: "left",
                                    sortable: true,
                                    value: "tore"
                                },
                                {
                                    text: 'Count',
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
                                    text: 'Num. of Documents with this combination',
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
                                    text: "Owner Name",
                                    align: "left",
                                    sortable: true,
                                    value: "owner_name",
                                },

                                {
                                    text: "Owner TORE",
                                    align: "left",
                                    sortable: true,
                                    value: "owner_tore",
                                },
                                {
                                    text: "Target",
                                    align: "left",
                                    sortable: true,
                                    value: "target_string"
                                }
                            ]

                ],
            }
        },
        methods: {

            generate_relationship_summary(list_of_relationships){
                let summaries = []

                for(let relationship of list_of_relationships){

                    let summary = {...relationship}
                    let owner = this.$store.state.codes[summary.TOREEntity];
                    summary.owner_name = owner.name;
                    summary.owner_tore = owner.tore;
                    summary.target_string = this.$store.getters.tokenListToString(summary.target_tokens)
                    summaries.push(summary)
                }
                return summaries
            },


            /**
             *
             * @param list_of_codes
             * @param get_code_name This must be an injective mapping between code instances and strings!!!!
             * @return {[]}
             */
            generate_code_summary(list_of_codes, get_code_name){
                let summaries = []
                let found_codes = []

                for(let code of list_of_codes){
                    let name = get_code_name(code);
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
                            found_in_docs
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
                return summaries
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
            }

        }
    }
</script>

<style scoped>

</style>