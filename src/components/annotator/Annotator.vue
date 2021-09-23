<template>
    <div>
        <div class="annotator-settings"
        v-if="!$store.state.selected_annotation">

            <v-autocomplete
                    class="annotator-string-selection annotator-toolbar__annotation-select"
                    :items="$store.state.available_annotations"
                    v-model="annotatorSelectedAnnotation"
                    @change="$store.dispatch('actionGetSelectedAnnotation')"
                    item-text="name"
                    item-value="name"
                    label="Select an Annotation"
                    :disabled="$store.state.isLoadingAvailableAnnotations"
                    :loading="$store.state.isLoadingAvailableAnnotations">
            </v-autocomplete>
        </div>
        <div class="annotator" ref="annotator"
        v-else>
            <v-card class="annotator-toolbar"
                    :disabled="$store.state.annotatorInputVisible || $store.state.isLoadingAnnotation">

                <v-autocomplete
                        class="annotator-string-selection annotator-toolbar__document-select"
                        :items="$store.state.docs"
                        v-model="annotatorSelectedDoc"
                        @change="$store.commit('updateDocTokens')"
                        item-text="name"
                        item-value="index"
                        label="Select a Document"
                        :loading="$store.state.isLoadingAnnotation">
                </v-autocomplete>

                <v-autocomplete
                        class="annotator-string-selection annotator-toolbar__algo-results-select"
                        :items="$store.state.algo_results"
                        item-text="name"
                        item-value="index"
                        v-model="annotatorAlgoResult"
                        label="Highlight Algorithm Results"
                        clearable>
                </v-autocomplete>

                <v-autocomplete
                        chips
                        multiple
                        clearable
                        label="Part of Speech Highlights"
                        class="annotator-toolbar__pos-select"
                        :items="pos_tags"
                        item-text="name"
                        item-value="tag"
                        v-model="annotatorPosTags"
                >
                    <template v-slot:selection="data">
                        <v-chip
                                v-bind="{...data.attrs, color: data.item.color}"
                                :input-value="data.selected"
                                close
                                @click:close="(function(item) {
                                const index = $store.state.selected_pos_tags.indexOf(item.tag)
                                const tags = $store.state.selected_pos_tags

                                if (index >= 0) tags.splice(index, 1)
                                $store.commit('updateSelectedPosTags', tags)
                            })(data.item)"
                                @click="data.select"
                        >{{ data.item.name }}
                        </v-chip>
                    </template>
                </v-autocomplete>

            </v-card>
            <v-card v-if="false" class="annotator-debug-panel">
                <v-textarea v-for="(t, index) in $store.state.codes"
                            :key="index"
                            :label="JSON.stringify(t)"
                            outlined
                            dense
                            rows="2"
                ></v-textarea>
                <v-textarea v-for="(c, index) in $store.state.tore_relationships"
                            :key="'relationship'+index"
                            :label="JSON.stringify(c)"
                            outlined
                            dense
                            rows="2"
                ></v-textarea>
            </v-card>
            <v-card class="annotator-token-area">
                <Token @annotator-token-click="tokenClicked"
                       @annotator-token-click-shift="tokenShiftClicked"
                       @annotator-token-click-ctrl="tokenCtrlClicked"
                       @annotator-token-mouseover="tokenHover"
                       @annotator-token-mouseleave="tokenUnhover"
                       ref="token"
                       v-for="(t, index) in $store.state.doc_tokens"
                       :key="index"
                       v-bind="{
                       ...t
                   }">
                </Token>
                <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
                    :key = "'emptyline'+emptyLineIndex">
                <AnnotatorInput
                        class="annotator-input"
                        v-if="showingInput"
                        :disabled="mustDisambiguateTokenCode"
                        v-click-outside="annotatorInputFocusOut"
                        ref="input_panel"
                        :style="inputFieldPanelLocationStyle"
                        :panelIsUp="panelIsUp"
                        :width="annotatorInputWidthPct"
                        @annotator-input-trash-click="delete_selected_code"
                        @annotator-input__arrow-icon-click="panelIsUp = !panelIsUp"
                        @code-name-input-keydown="expandIncompleteNameKeyDown"
                />
                <v-card
                        class="disambiguation-prompt"
                        :style="inputFieldPanelLocationStyle"
                        v-if="mustDisambiguateTokenCode">
                    <v-list>
                        <v-subheader>Do something with this token: </v-subheader>
                        <v-list-item
                                v-for="(item, i) in multipleCodesPromptList"
                                :key="'prompt_'+i"
                                :style="i===0?'border: green solid 2px':''"
                                @click="disambiguateTokenCode(item, i, this)()">
                            {{i > 0 ? `Edit '` + $store.getters.tokenListToString(item.tokens)+`'` : item.name}}
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-card>
        </div>
    </div>
</template>

<script>
    import Token from "@/components/annotator/Token";
    import AnnotatorInput from "@/components/annotator/AnnotatorInput";
    import {Code, Code_user_display_prompt} from "@/components/annotator/code";
    import {mapGetters} from "vuex";

    export default {
        name: "Annotator",
        data: () => {
            return {

                requestAnnotatorInput: false,
                disambiguatedTokenCode: null,

                incompleteNameInput: "",  // workaround to allow the user to type new names within autocomplete, should reflect current input value

                algo_lemmas: null,
                annotatorInputWidthPct: 60,
                panelIsUp: true,
                dropdownClassValues: ["annotator-input__tore", "v-list-item__content", "v-list-item", "v-list-item__title"]  // these aren't correctly identified as part of v-autocomplete
            }
        },
        components: {AnnotatorInput, Token},
        computed: {

            annotatorSelectedAnnotation: {
                get(){
                    return this.$store.state.selected_annotation
                },
                set(value){
                    this.$store.commit("updateSelectedAnnotation", value)
                }
            },

            annotatorSelectedDoc: {
                get(){
                    return this.$store.state.selected_doc;
                },
                set(value){
                    this.$store.commit("updateSelectedDoc", value)
                }
            },

            annotatorAlgoResult: {
                get(){
                    return this.$store.state.selected_algo_result;
                },

                set(value){
                    this.$store.commit("updateSelectedAlgoResult", value)
                }
            },

            annotatorPosTags: {
                get(){
                    return this.$store.state.selected_pos_tags;
                },
                set(value){
                    this.$store.commit("updateSelectedPosTags", value)
                }
            },

            mustDisambiguateTokenCode(){
                return this.requestAnnotatorInput && this.multipleCodesPromptList.length > 1 && this.disambiguatedTokenCode === null;
            },
            multipleCodesPromptList () {
                return [{name: "Create new Code", tore: ""}].concat(this.selectedToken===null?[]:this.getCodesForToken(this.selectedToken))
            },

            showingInput(){
                return this.selected_code && this.$store.state.annotatorInputVisible;
            },
            inputFieldPanelLocationStyle(){
                if(this.$store.state.selectedToken===null){
                    return {}
                }
                let refIndex = this.$store.state.docs[this.$store.state.selected_doc].begin_index
                let tokenBox = this.$refs.token[this.$store.state.selectedToken.index - refIndex].$el.getBoundingClientRect();
                let annotatorBox = this.$refs.annotator.getBoundingClientRect();
                let lowerWidth = annotatorBox.width*((100-this.annotatorInputWidthPct)/100);
                return {
                    left: `${Math.min(lowerWidth, tokenBox.left)}px`,
                    top: `${tokenBox.top + tokenBox.height + (this.panelIsUp?0:200)}px`
                }
            },

            ...mapGetters(["requiredAnnotationsPresent",
                "getCodesForToken",
                "selectedToken",
                "pos_tags",
                "selected_code",
                "selected_tore_relationship",
                "isLinking",
                "token",
                "docs",
                "selected_doc",
                "tokensInSelectedDoc," +
                "tokenListToString"])
        },

        mounted(){
            this.$store.dispatch("actionGetAllAnnotations")
        },

        methods: {   // NOTE: `token` refers to the Vue Component in these methods

            disambiguateTokenCode(item, i){
                let self = this;
                return function(){
                    if(i === 0){  // create a new code
                        self.disambiguatedTokenCode = null;
                    } else {
                        self.disambiguatedTokenCode = item
                    }
                    self.requestAnnotatorInput = false;  // decision has been made, hide the panel
                    console.log('Code click: '+item)
                    self.addSelectedTokenToCode()
                }
            },
            _Code_user_display_prompt(item){
                return Code_user_display_prompt(item);
            },

            /**
             * perform the assignment of the selected token to a Code
             * Create a new Core if necessary, else use user selected one
             */
            addSelectedTokenToCode(){
                let token = this.selectedToken;
                if(!this.isLinking){
                    let code = null;
                    let new_code = false;

                    if(this.disambiguatedTokenCode === null){
                        new_code = true;
                    } else {
                        code = this.disambiguatedTokenCode;
                        this.disambiguatedTokenCode = null;
                    }
                    code = new_code?new Code(this.$store.state.codes.length):code;

                    this.$store.commit('assignToCode', {token: this.token(token.index),
                        code: code,
                        new_code:new_code});

                    this.$store.commit("set_selected_code", code);

                } else {
                    console.error("addTokenToCode called while linker is open")
                }
            },

            tokenClicked(token){
                if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }
                if(!this.isLinking){
                    this.updateSelectedToken(token);
                    this.requestAnnotatorInput = true;  //  let the panel know we want to open the annotator input

                    if(!this.mustDisambiguateTokenCode){  // else the assignment will be performed after user action
                        this.requestAnnotatorInput = false;
                        this.addSelectedTokenToCode()
                    }
                } else {
                    if(this.selected_tore_relationship === null){
                        this.$store.commit("new_tore_relationship", token)
                    } else {
                        this.$store.commit("add_token_to_selected_relationship", token)
                    }
                }
            },

            expandIncompleteNameKeyDown(evnt){
                const key = evnt.key;
                console.log(evnt)
                if (key === "Enter"){
                    if(this.incompleteNameInput!==""){
                        console.warn("User pressed Enter, persisting new code name: "+this.incompleteNameInput);
                        this.$store.commit("updateCodeName", this.incompleteNameInput);
                        this.incompleteNameInput = "";
                    }
                } else if (key === "Backspace"){
                    this.incompleteNameInput = this.incompleteNameInput.substring(0, Math.max(0, this.incompleteNameInput.length-1))
                } else if(key.length === 1) {
                    this.incompleteNameInput += key;
                }
            },

            /**
             * Set the selected token and show the annotation
             * @param token
             */
            updateSelectedToken(token){
                this.$store.commit("setSelectedToken", token);
                this.$store.commit("setAnnotatorInputVisible", true);
            },

            /**
             * Should not be called if in linking mode
             * @param token
             */
            tokenShiftClicked(token){
                /*if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }*/
                if(this.showingInput){
                    const clickindex = token.index;
                    let endlim = this.$store.state.selected_code.tokens[this.$store.state.selected_code.tokens.length-1];
                    let grow = endlim <= clickindex ? 1 : -1;
                    for(let i = endlim; i !== clickindex + grow; endlim <= clickindex ? i++ : i--){
                        this.$store.commit('assignToCode', {token: this.token(i), code: this.$store.state.selected_code})
                    }
                } else {
                    this.tokenClicked(token)
                }
            },


            /**
             * Should not be called if in linking mode
             * @param token
             */
            tokenCtrlClicked(token){
                /*if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }*/
                if(this.showingInput){
                    this.$store.commit('assignToCode', {token: this.token(token.index), code: this.$store.state.selected_code})
                } else {
                    this.tokenClicked(token)
                }
            },

            annotatorInputFocusOut(event){
                for(let listclass of this.dropdownClassValues){
                    if(event.target.classList.contains(listclass)){
                        console.log("Annotator::annotatorInputFocusOut got click on dropdown, ignoring hide")
                        return;
                    }
                }

                if(!this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }

                // checking if target was another token
                if(!event.target.classList.contains("annotator-token-inner") && !event.target.classList.contains("annotator-token-outer")){
                    this.$store.commit("setAnnotatorInputVisible", false);
                }
            },

            tokenHover(token){
                this.$store.commit("setHoveringToken", this.token(token.index));  // FIXME very slow, leave it out for now
            },

            tokenUnhover(token){
                if(this.$store.state.hoveringToken===null){
                    return;
                }
                if(this.$store.state.hoveringToken.index === token.index){  //  do this check to account for fast mouse movements that may have already called the onHover method
                    this.$store.commit("setHoveringToken", null);
                }
            },

            delete_selected_code(){
                this.$store.commit("delete_selected_code");
                this.$store.commit("setAnnotatorInputVisible", false);
            }
        }
    }
</script>

<style scoped>

.annotator {
    position: relative;
}

.annotator-toolbar, .annotator-settings {
    position: sticky;
    top: 0px;
    display: flex;
    align-items: center;
    width: 100%;
}

.annotator-string-selection {
    margin-top: 14px;
}

.annotator-token-area {
    display: block;
}

.annotator-input, .disambiguation-prompt {
    position: fixed;
}

.annotator-toolbar__document-select {
    width: 300px;
    flex-grow: 1;
    justify-self: flex-start;
}

.annotator-toolbar__algo-results-select{
    width: 300px;
    flex-grow: 1;
    justify-self: flex-end;
}

</style>
