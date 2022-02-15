<template>
    <v-dialog
            :hide-overlay="true"
            :persistent="!requiredAgreementsPresent || isLinking"
            :no-click-animation="isLinking"
            v-model="wrapInputVisible"
            v-if="wrapInputVisible"
            id="agreement-input-dialog"
            :scrollable="false"
            class="agreement-input-dialog"
        >
        <v-card
                :elevation="0"
                class="agreement-input"
                :disabled="disabled"
                ref="agreement_input">

            <div class="agreement-input__input-fields">
                <template v-if="!isLinking"
                          class="agreement-input-no-link">
                    <v-menu
                            bottom
                            left
                            offset-x>
                        <template v-slot:activator="{on: onMenu}">
                            <v-tooltip bottom>
                                <template v-slot:activator="{on: onTooltip}">
                                    <v-icon v-on="{...onMenu, ...onTooltip}">
                                        list
                                    </v-icon>
                                </template>
                                <span>Show Options</span>
                            </v-tooltip>
                        </template>

                        <v-list>
                            <v-dialog
                                    v-model="promptHighlightAll"
                                    transition="dialog-bottom-transition"
                            >
                                <v-card>
                                    <v-card-title class="text-h5 grey lighten-2">
                                        Encode all similar
                                    </v-card-title>

                                    <v-card-text
                                    >
                                        Current token: <b>{{selectedToken.name}}</b> Current token lemma: <b>{{selectedToken.lemma}}</b><br>
                                    </v-card-text>
                                    <v-card-text
                                            v-if="selected_code.tokens.length > 1"
                                    >
                                        All tokens for this encoding: <b>{{getselected_codeString("name")}}</b> All lemmas for this encoding: <b>{{getselected_codeString("lemma")}}</b>  <br>

                                    </v-card-text>

                                    <v-divider></v-divider>
                                    <v-card-text>

                                        Selecting "Token" will encode all other occurrences of the current token with the Name of this encoding.<br>

                                        Selecting "Lemma" will encode all other occurrences of this current token lemma with the Name of this encoding.<br>
                                    </v-card-text>
                                    <v-card-text
                                            v-if="selected_code.tokens.length > 1"
                                    >

                                        Selecting "All Tokens" will encode all sequences of tokens that are <b>adjacent</b> and <b>match the sequence of tokens above</b> with the Name of this encoding.<br>

                                        Selecting "All Lemmas" will encode all sequences of tokens that are <b>adjacent</b> and <b>whose lemmas match the sequence of lemmas above</b> with the Name of this encoding.

                                    </v-card-text>

                                    <v-text-field></v-text-field>

                                    <v-divider></v-divider>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="red"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            cancel
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="encodeAllMatching(true, true)"
                                        >
                                            token
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="encodeAllMatching(true, false)"
                                        >
                                            lemma
                                        </v-btn>
                                        <template
                                        v-if="selected_code.tokens.length > 1">
                                            <v-btn
                                                    color="primary"
                                                    text
                                                    @click="encodeAllMatching(false, true)"
                                            >
                                                all tokens
                                            </v-btn>
                                            <v-btn
                                                    color="primary"
                                                    text
                                                    @click="encodeAllMatching(false, false)"
                                            >
                                                all lemmas
                                            </v-btn>
                                        </template>

                                    </v-card-actions>
                                </v-card>

                                <template v-slot:activator="{on: onDialog}" >
                                    <v-list-tile
                                            v-on="onDialog"
                                    >
                                        Highlight all similar
                                    </v-list-tile>
                                </template>
                            </v-dialog>
                        </v-list>
                    </v-menu>

                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    @click="trashClicked" class="agreement-input__trash">
                                delete_outline
                            </v-icon>
                        </template>
                        <span
                        >Delete This Encoding</span>


                    </v-tooltip>

                    <v-combobox
                            required
                            :class="['agreement-input__name']"
                            label="Name"
                            :items="codeNames"
                            v-model="name"
                            item-text="name"
                            item-value="name"
                            :rules="[requiredAgreementsPresent || 'Either a name or a category is required']"
                            ref="nameInput"
                            v-if="wrapInputVisible"
                            autofocus
                            id="agreement-input__name"
                    ></v-combobox>

                    <v-autocomplete
                            class="agreement-input__tore"
                            @change="updateTore"
                            :rules="[requiredAgreementsPresent || 'Either a name or a category is required']"
                            :items="tores"
                            :value="tore"
                            label="Category">
                    </v-autocomplete>

                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    :disabled="!selected_code.tore || allowedRelationshipNames.length === 0"
                                    @click="startLinking">
                                link
                            </v-icon>
                        </template>
                        <span>New Relationship</span>
                    </v-tooltip>
                </template>
                <template v-else
                          class="agreement-input-link">
                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    v-if="selected_tore_relationship"
                                    @click="stopLinking">
                                done
                            </v-icon>
                            <v-icon v-else
                                    v-on="on"
                                    @click="stopLinking">
                                close
                            </v-icon>
                        </template>
                        <span v-if="selected_tore_relationship">Finish Linking</span>
                        <span v-else>Stop Linking</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    @click="deleteRelationshipClicked">
                                delete_outline
                            </v-icon>
                        </template>
                        <span>Delete This Relationship</span>
                    </v-tooltip>

                    <v-autocomplete  class="agreement-input__relationship-name"
                                     @change="updateRelationshipName"
                                     :items="allowedRelationshipNames"
                                     :value="relationshipName"
                                     :disabled="!selected_tore_relationship"
                                     :label="selected_tore_relationship?'Relationship Name':'Select a target token'">
                    </v-autocomplete>
                </template>
                <v-tooltip bottom>
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                v-if="panelIsUp"
                                @click="arrowIconClicked">
                            arrow_downward
                        </v-icon>
                        <v-icon
                                v-on="on"
                                v-else
                                @click="arrowIconClicked">
                            arrow_upward
                        </v-icon>
                    </template>
                    <span>Move this box {{directionCueString}}</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                @click="$emit('show-edit-configurables')">
                            settings
                        </v-icon>
                    </template>
                    Edit Categories and Relationships
                </v-tooltip>
            </div>

            <div class="agreement-input__relationships" v-if="!isLinking && $store.state.selected_code && $store.state.selected_code.relationship_memberships.length > 0">
                <v-list class="agreement-input__relationships-list">
                    <v-subheader>Edit a relationship</v-subheader>
                    <v-list-tile
                                @click="setSelectedToreRelationship(item)"
                                v-for="(item, i) in selectedToreRelationships"
                                :key="'relationships_'+i">
                            {{(item.relationship_name?item.relationship_name:'[TORE Relationship]') +' -> '+tokenListToString(item.target_tokens)}}
                    </v-list-tile>
                </v-list>
            </div>
        </v-card>
        <v-snackbar
            :timeout="4000"
            v-model="showSnackbar"
        >
            {{snackbarText}}
        </v-snackbar>
    </v-dialog>
</template>

<script>

    import {mapGetters, mapState} from "vuex";
    import {Code} from "@/components/agreement/code";

    export default {
        name: "AgreementInput",

        data(){
            return {
                showSnackbar: false,
                snackbarText: "",
                promptHighlightAll: false
            }
        },
        computed: {
            ...mapGetters(["requiredAgreementsPresent",
                "isLinking",
                "codeNames",
                "selected_code",
                "selected_tore_relationship",
                "selectedToken",
                "tokenListToString",
                "showingInput",
                "getCodesForToken"]),

            ...mapState(["relationship_names", "tores"]),

            allowedRelationshipNames(){
                return this.$store.state.relationship_names.filter((name, index) => {
                    return !this.$store.state.relationship_owners[index] || this.$store.state.relationship_owners[index] === this.tore;
                } )
            },

            wrapInputVisible: {
                get(){
                    return this.showingInput;
                },

                set(bool){
                    if(!this.requiredAgreementsPresent){  // codes need some kind of label
                        console.log("Missing required input, ignoring dialog hide")
                    } else {
                        this.$store.commit("setAgreementInputVisible", bool);  // should always be false
                    }
                }
            },

            name: {
                get(){
                    return this.selected_code.name;
                },
                set(value){
                    this.$store.commit("updateCodeName", value);
                    this.$store.commit("updateLastAgreementEditAt")
                },
            },
            tore(){
                return this.selected_code.tore;
            },
            relationshipName(){
                let r = this.$store.state.selected_tore_relationship
                return r ? r.relationship_name : ""
            },
            directionCueString(){
                return this.panelIsUp?"down":"up";
            },

            selectedToreRelationships(){
                let r = []
                for (let rel of this.selected_code.relationship_memberships){
                    r.push(this.$store.state.tore_relationships[rel])
                }
                return r
            }
        },

        watch: {
            selected_code(){
                if(this.selected_code && !this.requiredAgreementsPresent){
                    let lemma = this.$store.state.tokens[this.selectedToken.index].lemma;
                    console.log("Initializing name and tore fields for new code: "+lemma);

                    let foundTore = "";
                    if(this.selectedToken){
                        for(let code of this.getCodesForToken(this.selectedToken)){
                            if(code.tore){
                                foundTore = code.tore;
                                break;
                            }
                        }
                    } else {
                        console.error("watch::selected_code got selected code without selected token");
                    }

                    setTimeout(t => {
                        this.$store.commit("updateCodeName", lemma);
                        if(foundTore){
                            this.$store.commit("updateCodeTore", foundTore);
                        }
                    });
                }
            },

            promptHighlightAll(){
                if(this.promptHighlightAll){
                    this.$emit('remove-dialog-stylerule', "Showing 'highlight all similar' dialog")
                } else {
                    this.$emit('reposition-dialog')
                }
            }
        },

        methods: {

            encodeAllMatching(useSelectedToken, tokenName){
                let searchField = "name"
                if(!tokenName){
                    searchField = "lemma"
                }
                let matchPatternList = []
                let thisTokenIndex = null;
                if(useSelectedToken){
                    matchPatternList.push(this.selectedToken[searchField])
                    thisTokenIndex = this.selectedToken.index;
                } else {
                    for(let t of [...this.selected_code.tokens].sort()){
                        if(thisTokenIndex===null){
                            thisTokenIndex = t;
                        }
                        matchPatternList.push(this.$store.state.tokens[t][searchField]);
                    }

                }

                let matching_indices = []  // indices at which a matching sequence starts
                for(let t of this.$store.state.tokens){
                    if(t.index === thisTokenIndex){
                        continue;
                    }
                    if(this.checkIsMatching(t, matchPatternList, tokenName)){
                        matching_indices.push(t.index);
                    }
                }

                console.log("Assigning matches to codes: ")
                for(let index of matching_indices){

                    let code = new Code(this.$store.state.codes.length)
                    code.name = this.selected_code.name;
                    for(let i of Array(matchPatternList.length).keys()){
                        this.$store.commit('assignToCode',
                            {token: this.$store.state.tokens[index+i],
                                code,
                                new_code:i===0});
                    }

                }

                this.$store.commit("updateLastAgreementEditAt")
                this.promptHighlightAll = false;
                this.snackbarText = "Added "+matching_indices.length+" new encodings."
                this.showSnackbar = true;
            },

            /**
             * Check to see if a matching series of tokens begins at the current token
             * @param token the whole object
             * @param matchPatternList field values for tokens, sorted in ascending order
             * @param tokenName use token name, else use lemma
             */
            checkIsMatching(token, matchPatternList, tokenName){
                let left_to_match = [...matchPatternList].reverse()
                let field = tokenName?"name":"lemma";
                while(left_to_match.length > 0){
                    let check_field = left_to_match.pop();
                    if(check_field !== token[field]){
                        return false;
                    } else {
                        token = this.$store.state.tokens[token.index+1];
                    }
                }
                return true;
            },

            getselected_codeString(field){
                return [...this.selected_code.tokens].sort().map(t => t==null?null:this.$store.state.tokens[t][field]).filter(t => t != null).join(' ');
            },
            updateRelationshipName(value){
                if(this.$store.state.selected_tore_relationship){
                    this.$store.commit("setRelationshipName", value);
                    this.$store.commit("updateLastAgreementEditAt")
                }
            },
            updateTore(value){
                this.$store.commit("updateCodeTore", value);
                this.$store.commit("updateLastAgreementEditAt")
            },
            trashClicked(){
                this.$emit("agreement-input-trash-click");
            },
            startLinking(){
                this.$store.commit("setIsLinking", true);
            },
            stopLinking(){
                this.$store.commit("setIsLinking", false);
            },
            arrowIconClicked(){
                this.$emit("agreement-input__arrow-icon-click");
            },
            deleteRelationshipClicked(){
                if(this.selected_tore_relationship){
                    this.$store.commit('delete_tore_relationship', this.selected_tore_relationship)
                    this.$store.commit("updateLastAgreementEditAt")
                }
                this.stopLinking()
            },
            setSelectedToreRelationship(relationship){
                this.startLinking()
                this.$store.commit("setSelectedToreRelationship", relationship)
            }
        },
        props: {
            panelIsUp: {
                type: Boolean
            },

            disabled: {
                type: Boolean,
                default: false
            },
        },

    }
</script>

<style>

    .agreement-input{
        display: flex;
        width: fit-content;
        flex-direction: column;
        align-items: center;
        border-radius: 20px !important;
    }

    .agreement-input__input-fields {
        display: flex;
        width: 100%;
        flex-direction: row;
    }

    .agreement-input-no-link{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 10px;
        margin: 10px;
    }

    .agreement-input__trash {
        float: left;
        margin-right: 10px;
    }

    .agreement-input__relationship-name {
        float: left;
        flex: 1 1 20em;
    }

    .agreement-input__tore {
        float: left;
        flex: 1 1 20em;
    }

    .agreement-input__relationships-list .v-list__tile{
        display: flex;
        justify-content: center;
        height: 28px;
    }

    .agreement-input__relationships-list .v-subheader {
        display: flex;
        justify-content: center;
        height: 14px;
    }
    .agreement-input__cancel{
        margin-top: 15px !important;
    }

</style>