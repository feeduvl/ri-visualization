<template>
    <div>
        <v-snackbar
                class="saved-snackbar"
                v-model="show_saved_snackbar"
                :timeout="1500"
        >
            {{this.saveSnackbarText}}
        </v-snackbar>

        <v-snackbar
                class="saved-snackbar"
                v-model="show_auto_saved_snackbar"
                :timeout="1500"
        >
            {{this.autoSaveSnackbarText}}
        </v-snackbar>
        <div class="annotator-settings"
        v-if="!$store.state.selected_annotation">
            <v-autocomplete
                    class="annotator-string-selection annotator-settings__annotation-select"
                    :items="$store.state.available_annotations"
                    v-model="annotatorSelectedAnnotation"
                    @change="$store.dispatch('actionGetSelectedAnnotation')"
                    item-text="name"
                    item-value="name"
                    label="Select an Annotation"
                    :disabled="$store.state.isLoadingAvailableAnnotations"
                    :loading="$store.state.isLoadingAvailableAnnotations">
            </v-autocomplete>

            <v-autocomplete
                    class="annotator-string-selection annotator-settings__dataset-select"
                    :items="$store.state.datasets"
                    v-model="createNewAnnotationDataset"
                    label="Create a new Annotation from Dataset">
            </v-autocomplete>
            <v-text-field
                    class="annotator-text-input annotator-settings__name-input"
                    :disabled="!createNewAnnotationDataset"
                    :rules="[!$store.state.datasets.includes(addingAnnotationName) || 'Name is already in use.']"
                    label="Enter a unique annotation name"
                    v-model="addingAnnotationName">
            </v-text-field>
            <v-icon
                    :disabled="!addingAnnotationName || !createNewAnnotationDataset || $store.state.datasets.includes(addingAnnotationName)"
                    color="blue"
                    @click="$store.dispatch('actionGetNewAnnotation', {name: addingAnnotationName, dataset: createNewAnnotationDataset})"
            >
                add
            </v-icon>

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
                        return-object
                        label="Select a Document"
                        :loading="$store.state.isLoadingAnnotation">
                </v-autocomplete>

                <v-autocomplete
                        class="annotator-string-selection annotator-toolbar__algo-results-select"
                        :items="$store.getters.annotationAlgoResults"
                        item-text="name"
                        return-object
                        v-model="annotatorAlgoResult"
                        label="Highlight Algorithm Results"
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

                <v-tooltip bottom>
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                @click="saveAndClose"
                        >
                        exit_to_app
                    </v-icon>
                    </template>
                    <span>Save and exit</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template #activator="{on}">
                        <v-icon v-on="on"
                                @click="doSaveAnnotation(false)"
                        >
                            save
                        </v-icon>
                    </template>
                    <span>Save</span>
                </v-tooltip>

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
            <v-card class="annotator-token-area"
            v-if="!$store.state.isLoadingAnnotation">
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
                        :disabled="mustDisambiguateTokenCode"
                        ref="input_panel"
                        :selectedTokenBoundingRect="selectedTokenBoundingRect"
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
                            {{i > 0 ? `Edit '` + $store.getters.tokenListToString(item.tokens)+`'` : item.name}}
                        </v-list-tile>
                    </v-list>
                </v-card>
            </v-card>
        </div>
    </div>
</template>

<script>
    import Token from "@/components/annotator/Token";
    import AnnotatorInput from "@/components/annotator/AnnotatorInput";
    import {Code} from "@/components/annotator/code";
    import {mapGetters, mapState} from "vuex";

    export default {
        name: "Annotator",
        data: () => {
            return {
                saveSnackbarText: "Annotation saved.",
                autoSaveSnackbarText: "Auto-saved.",
                addingAnnotationName: "",
                createNewAnnotationDataset: null,
                requestAnnotatorInput: false,
                disambiguatedTokenCode: null,

                show_saved_snackbar: false,
                show_auto_saved_snackbar: false,

                algo_lemmas: null,
                annotatorInputWidthPct: 60,
                panelIsUp: true
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

            selectedTokenBoundingRect(){
                if(this.$store.state.selectedToken===null){
                    return null;
                }
                let refIndex = this.$store.state.selected_doc.begin_index
                return this.$refs.token[this.$store.state.selectedToken.index - refIndex].$el.getBoundingClientRect();
            },

            inputFieldPanelLocationStyle(){
                let tokenBox = this.selectedTokenBoundingRect;
                if(tokenBox===null){
                    return {}
                }
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
                "tokenListToString",
                "showingInput"]),

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

            tokenClicked(token){
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
                        if(this.isLinking){
                            this.tokenClicked(this.token(i))
                        } else {
                            this.$store.commit('assignToCode', {token: this.token(i), code: this.$store.state.selected_code})
                            this.$store.commit("updateLastAnnotationEditAt")
                        }
                    }
                } else {
                    this.tokenClicked(token)
                }
            },

            tokenCtrlClicked(token){
                /*if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }*/
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

            tokenHover(token){
                this.$store.commit("setHoveringToken", this.token(token.index));
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

.annotator-settings__name-input {
    margin-top: 14px;
}

</style>
