<template>
    <div>
        <v-switch
        v-model="findAllCombinations"
        :label="`Find unique combinations of 'Name' and 'TORE' fields`">

        </v-switch>
        <v-tabs
            v-model="selectedTab">
            <v-tab>
                <span>
                    Code Statistics
                </span>
            </v-tab>
            <v-tab>
                <span>
                    Another Tab
                </span>
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="selectedTab">
            <v-tab-item>
                <v-data-table
                    :headers="headers"
                    :items="code_summaries">
                    <template v-slot:items="props">
                        <td>{{ props.item.codeDisplayName }}</td>
                        <td class="text-xs-right">{{ props.item.count }}</td>
                        <td class="text-xs-right">{{ props.item.relationship_count }}</td>
                        <td class="text-xs-right">{{ props.item.doc_count }}</td>
                    </template>

                </v-data-table>
            </v-tab-item>
            <v-tab-item>
                Tab 1 content
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
    import {Code_user_display_prompt} from "./code"
    export default {
        name: "CodeView",
        computed: {
            code_summaries(){
                if(!this.findAllCombinations){
                    return this.generate_summaries(this.$store.state.codes.filter(c => c && c.name), c => c.name).concat(
                        this.generate_summaries(this.$store.state.codes.filter(c => c && c.tore), c => c.tore))
                } else {
                    return this.generate_summaries(this.$store.state.codes.filter(c => c), Code_user_display_prompt)
                }
            }
        },
        data: () => {
            return {
                findAllCombinations: false,  // treat codes with 'name' and 'tore' fields as two separate codes
                selectedTab: 0,
                headers: [
                        [  // Tab view 0
                            {
                                text: 'Code',
                                align: 'left',
                                sortable: true,
                                value: 'codeDisplayName'  // can also refer to the TORE category
                            },
                            { text: 'Count', value: 'count'},
                            { text: 'Number of Relationships', value: 'relationship_count' },
                            { text: 'Num. of Documents with this code', value: 'doc_count'}
                        ],

                        [

                        ]

                ],
            }
        },
        methods: {
            /**
             *
             * @param list_of_codes
             * @param get_code_name This must be an injective mapping between code instances and strings!!!!
             * @return {[]}
             */
            generate_summaries(list_of_codes, get_code_name){
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
                            codeDisplayName: name,
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
                }
                out+='\n'

                for(let item of itemsList){
                    for(let header of tableHeadersDef){
                        out+=item[header.value];
                        if(count < tableHeadersDef.length - 1){
                            out+=delim;
                        }
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
        }
    }
</script>

<style scoped>

</style>