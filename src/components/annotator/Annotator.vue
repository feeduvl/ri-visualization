<template>
    <div>
        <v-snackbar
                class="saved-annotation-snackbar"
                v-model="show_saved_snackbar"
                :timeout="1500"
        >
            {{this.saveSnackbarText}}
        </v-snackbar>

        <v-snackbar
                class="saved-annotation-snackbar"
                v-model="show_auto_saved_snackbar"
                :timeout="1500"
        >
            {{this.autoSaveSnackbarText}}
        </v-snackbar>

        <AnnotatorSettings
                v-if="!$store.state.selected_annotation">
        </AnnotatorSettings>

        <div class="annotator"
             v-else>
            <v-card class="annotator-toolbar"
            >

                <template
                        v-if="!viewingCodes">
                    <v-autocomplete
                            class="annotator-string-selection annotator-toolbar__document-select"
                            :items="$store.state.docs"
                            v-model="annotatorSelectedDoc"
                            @change="$store.commit('updateDocTokens')"
                            item-text="name"
                            return-object
                            label="Select a Document"
                            :disabled="$store.state.annotatorInputVisible || $store.state.isLoadingAnnotation"
                            :loading="$store.state.isLoadingAnnotation">
                    </v-autocomplete>

                    <v-autocomplete
                            class="annotator-string-selection annotator-toolbar__algo-results-select"
                            :items="$store.getters.annotationAlgoResults"
                            item-text="name"
                            return-object
                            v-model="annotatorAlgoResult"
                            label="Highlight Algorithm Results"
                            :disabled="$store.state.annotatorInputVisible || $store.state.isLoadingAnnotation"
                            :loading="$store.state.isLoadingAnnotation"
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
                            :loading="$store.state.isLoadingAnnotation"
                            :disabled="$store.state.annotatorInputVisible || $store.state.isLoadingAnnotation"
                            v-model="annotatorPosTags"
                    >
                        <template v-slot:selection="data">
                            <v-chip
                                    v-bind="{...data.attrs, color: data.item.color}"
                                    :input-value="data.selected"
                                    close
                                    @input="(function(item) {
                                    const index = $store.state.selected_pos_tags.indexOf(item.tag)
                                    const tags = $store.state.selected_pos_tags
                                    if (index >= 0) {
                                        tags.splice(index, 1)
                                    }
                                    $store.commit('updateSelectedPosTags', tags)
                                })(data.item)"
                            >{{ data.item.name }}
                            </v-chip>
                        </template>
                    </v-autocomplete>
                </template>
                <template
                        v-else>
                    <span class="view-codes-header"
                    >
                        Code View
                    </span>
                </template>

                <v-tooltip bottom
                           v-if="!viewingCodes">
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                :disabled="$store.state.annotatorInputVisible"
                                @click="saveAndClose"
                                medium>
                            exit_to_app
                        </v-icon>
                    </template>
                    <span>Save and exit</span>
                </v-tooltip>

                <v-tooltip bottom
                           v-if="!viewingCodes">
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                :disabled="$store.state.annotatorInputVisible"
                                @click="doSaveAnnotation(false)"
                                medium
                        >
                            save
                        </v-icon>
                    </template>
                    <span>Save</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template #activator="{on}">
                        <v-icon v-if="!viewingCodes"
                                v-on="on"
                                :disabled="$store.state.annotatorInputVisible"
                                @click="viewingCodes = !viewingCodes"
                                medium
                        >
                            visibility
                        </v-icon>
                        <v-icon class="annotate-icon"
                                v-else
                                v-on="on"
                                @click="viewingCodes = !viewingCodes"
                                medium
                        >
                            mode
                        </v-icon>
                    </template>
                    <span v-if="!viewingCodes">View Codes</span>
                    <span v-else>Annotate</span>
                </v-tooltip>

            </v-card>
            <v-card class="annotator-token-area"
                    v-if="!$store.state.isLoadingAnnotation && !viewingCodes"
                    ref="annotator">
                <Token @annotator-token-click="tokenClicked"
                       @annotator-token-click-shift="tokenShiftClicked"
                       @annotator-token-click-ctrl="tokenCtrlClicked"
                       @annotator-token-mouseover="tokenHover"
                       @annotator-token-mouseleave="tokenUnhover"
                       ref="token"
                       v-for="(t, index) in $store.state.doc_tokens"
                       :key="index"
                       v-bind="{
                       ...t,
                       inSelectedCode: $store.state.token_in_selected_code[t.index],
                       hasCode: $store.state.tokens[t.index].num_codes > 0,
                       isHoveringCode: $store.state.token_is_hovering_code[t.index],
                       linkedTogether: isLinking && $store.state.token_linked_together[t.index],
                       isHoveringToken: $store.state.token_is_hovering_token[t.index],
                       isLinking: isLinking,
                       algo_lemma: $store.state.selected_algo_result !== null && $store.getters.lemmasFromSelectedResult.includes(t.lemma?t.lemma.toLowerCase():''),
                       show_pos: t.pos!==null && $store.state.selected_pos_tags.includes(t.pos),
                       posClass: getPosClass(t.pos),
                       annotatorInputVisible: $store.state.annotatorInputVisible
                   }">
                </Token>
                <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
                    :key = "'emptyline'+emptyLineIndex">
                <AnnotatorInput
                        class="annotator-input"
                        :disabled="mustDisambiguateTokenCode"
                        ref="input_panel"
                        :selectedTokenBoundingRect="selectedTokenBoundingRect"
                        :annotatorBoundingRect="annotatorBoundingRect"
                        :panelIsUp="panelIsUp"
                        :width="annotatorInputWidthPct"
                        @annotator-input-trash-click="delete_selected_code"
                        @annotator-input__arrow-icon-click="panelIsUp = !panelIsUp"
                />
                <v-card
                        class="disambiguation-prompt"
                        :style="inputFieldPanelLocationStyle"
                        v-if="mustDisambiguateTokenCode">
                    <v-list>
                        <v-subheader>Do something with this token: </v-subheader>
                        <v-list-tile
                                v-for="(item, i) in multipleCodesPromptList"
                                :key="'prompt_'+i"
                                :style="i===0?'border: green solid 2px':''"
                                @click="disambiguateTokenCode(item, i, this)()">
                            {{i > 0 ? `Edit '` + $store.getters.tokenListToString([...item.tokens].sort())+`'` : item.name}}
                        </v-list-tile>
                    </v-list>
                </v-card>
            </v-card>
            <CodeView
                    v-else-if="viewingCodes">
            </CodeView>
        </div>
    </div>
</template>

<script>
    import Token from "@/components/annotator/Token";
    import AnnotatorInput from "@/components/annotator/AnnotatorInput";
    import CodeView from "@/components/annotator/CodeView";
    import {Code} from "@/components/annotator/code";
    import {mapGetters, mapState} from "vuex";
    import AnnotatorSettings from "@/components/annotator/AnnotatorSettings";

    export default {
        name: "Annotator",
        data: () => {
            return {

                saveSnackbarText: "Annotation saved.",
                autoSaveSnackbarText: "Auto-saved.",

                requestAnnotatorInput: false,
                disambiguatedTokenCode: null,

                viewingCodes: false,

                show_saved_snackbar: false,
                show_auto_saved_snackbar: false,

                algo_lemmas: null,
                annotatorInputWidthPct: 50,
                panelIsUp: true,

                hoverDelayMillis: 110,  // time to wait before dispatching hover event
                currentlyHoveringTokenIndexLocal: null,
                hoverEnterTime: null,
            }
        },
        components: {AnnotatorSettings, AnnotatorInput, Token, CodeView},
        computed: {

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
                    this.$store.commit("updateSelectedAlgoResult", value===undefined?null:value)
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

            annotatorBoundingRect(){
                if(this.$store.state.selectedToken===null){
                    return null;
                }

                let ret = this.$refs.annotator.$el;
                return ret.getBoundingClientRect();
            },

            selectedTokenBoundingRect(){
                if(this.$store.state.selectedToken===null){
                    return null;
                }
                let elem = document.getElementById("token_"+this.$store.state.selectedToken.index).getBoundingClientRect();
                return elem;
                //return this.$refs.token[this.$store.state.selectedToken.index - refIndex].$el.getBoundingClientRect();
            },

            inputFieldPanelLocationStyle(){
                let tokenBox = this.selectedTokenBoundingRect;
                if(tokenBox===null){
                    return {}
                }
                let annotatorBox = this.$refs.annotator.$el.getBoundingClientRect();
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
                "tokenListToString",
                "showingInput",
                "hoveringToken"]),

            ...mapState([
                "lastAnnotationEditAt",
                "lastAnnotationPostAt"
            ])
        },

        watch: {
            lastAnnotationEditAt(val){
                if(this.lastAnnotationPostAt === null){
                    console.log("Starting save timer after first edit")
                    this.$store.commit("postAnnotationCallback")
                } else {
                    if(val - this.lastAnnotationPostAt > 1000 * 60){
                        console.info("Auto save")
                        this.doSaveAnnotation(true);
                    }
                }
            }
        },

        mounted(){
            this.$store.dispatch("actionGetAllAnnotations")
        },

        methods: {
            getPosClass(pos){
                switch (pos) {
                    case "v":
                        return "verb-token";
                    case "n":
                        return "noun-token";
                    case "a":
                        return "adjective-token";
                }
                return "";
            },

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
                    this.$store.commit("updateLastAnnotationEditAt")

                    this.$store.commit("set_selected_code", code);

                } else {
                    console.error("addTokenToCode called while linker is open")
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

            tokenClicked(index){
                let token = this.token(index)
                if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }
                this.updateSelectedToken(token);
                if(!this.isLinking){
                    this.requestAnnotatorInput = true;  //  let the panel know we want to open the annotator input

                    if(!this.mustDisambiguateTokenCode){  // else the assignment will be performed after user action
                        this.requestAnnotatorInput = false;
                        this.addSelectedTokenToCode()
                    }
                } else {
                    if(this.selected_tore_relationship === null){
                        this.$store.commit("new_tore_relationship", token)
                    } else {
                        this.$store.commit("add_or_remove_token_selected_relationship", token)
                    }
                    this.$store.commit("updateLastAnnotationEditAt")
                }
            },

            tokenShiftClicked(index){
                /*if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }*/


                if(this.showingInput){
                    const clickindex = index;
                    let endlim = this.$store.state.selected_code.tokens[this.$store.state.selected_code.tokens.length-1];
                    let grow = endlim <= clickindex ? 1 : -1;
                    for(let i = endlim; i !== clickindex + grow; endlim <= clickindex ? i++ : i--){
                        if(this.isLinking){
                            this.tokenClicked(this.token(i))
                        } else {
                            this.$store.commit('assignToCode', {token: this.token(i), code: this.$store.state.selected_code})
                            this.$store.commit("updateLastAnnotationEditAt")
                        }
                    }
                } else {

                    let token = this.token(index)
                    this.tokenClicked(token)
                }
            },

            tokenCtrlClicked(index){
                /*if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }*/
                let token = this.token(index)
                if(this.showingInput){
                    if(this.isLinking){
                        this.tokenClicked(token)
                    } else {
                        this.$store.commit('assignToCode', {token, code: this.$store.state.selected_code})
                        this.$store.commit("updateLastAnnotationEditAt")
                    }
                } else {
                    this.tokenClicked(token)
                }
            },

            getSetHoveringTokenCommit(){
                let tk = this.token(this.currentlyHoveringTokenIndexLocal);
                let self = this;
                return function(){
                    if(self.currentlyHoveringTokenIndexLocal === tk.index){
                        //console.log("Setting hovering token: "+tk.name)
                        self.$store.commit("setHoveringToken", tk)
                    } /*else {
                        console.log(tk.name+" hovered out before callback. Currently hovering: "+self.currentlyHoveringTokenIndexLocal)
                    }*/
                }
            },

            tokenHover(token_index){
                this.hoverEnterTime = Date.now();
                this.currentlyHoveringTokenIndexLocal = token_index;

                setTimeout(this.getSetHoveringTokenCommit(), this.hoverDelayMillis);
            },

            tokenUnhover(token_index){
                this.currentlyHoveringTokenIndexLocal = null;
                if(this.$store.state.hoveringToken===null){
                    return;
                }
                if(this.$store.state.hoveringToken.index === token_index){  //  do this check to account for fast mouse movements that may have already called the onHover method
                    this.$store.commit("setHoveringToken", null);
                }
            },

            delete_selected_code(){
                this.$store.commit("delete_selected_code");
                this.$store.commit("updateLastAnnotationEditAt")
                this.$store.commit("setAnnotatorInputVisible", false);
            },

            doSaveAnnotation(autosave){
                this.$store.dispatch('actionPostCurrentAnnotation')
                if(autosave){
                    this.show_auto_saved_snackbar = true;
                } else {
                    this.show_saved_snackbar = true;
                }
            },

            saveAndClose(){
                this.doSaveAnnotation(false)
                this.$store.commit("resetAnnotator")
                this.$store.dispatch("actionGetAllAnnotations")
            },

            viewCodes(){

            }
        }
    }
</script>


<style>

    .saved-snackbar .v-snack__wrapper{
        min-width: 0px;
    }
</style>

<style scoped>
.annotator {
    position: relative;
}

.annotator-toolbar {
    justify-content: flex-end;
    position: sticky;
    top: 0px;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 78px;
}

.view-codes-header{

    letter-spacing: normal;
    font-weight: 300;
    font-size: 20px;
    font-family: Roboto, sans-serif;
    flex-grow: 1;
}

.annotate-icon {
    margin-right: 10px;
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
