<template>
    <div>
        <v-snackbar
                class="saved-annotation-snackbar"
                v-model="show_snackbar"
                :timeout="2500"
        >
            {{this.snackbarText}}
        </v-snackbar>

        <EditConfigurablesDialog
                @hide-edit-configurables="hideEditConfigurables"
                :show="showingEditConfigurablesPopup"
                :relationship_names="[...$store.state.relationship_names]"
                :relationship_owners="[...$store.state.relationship_owners]"
                :tores="[...$store.state.tores]"
                :annotation_tores="[...$store.state.annotation_tores]"
                :showRecommendationTore="$store.state.showRecommendationTore">
        </EditConfigurablesDialog>

        <AnnotatorSettings
            v-if="!$store.state.selected_annotation"
            ref="annotatorSettingsRef">
        </AnnotatorSettings>

        <div class="annotator"
        v-else>
            <v-card class="annotator-toolbar"
            >

                <template
                        v-if="!annotatorViewingCodeResults">
                    <v-autocomplete
                            class="annotator-string-selection annotator-toolbar__document-select"
                            :items="$store.state.docs"
                            v-model="annotatorSelectedDoc"
                            @change="$store.commit('updateDocTokens')"
                            item-text="name"
                            return-object
                            label="Select a Document"
                            :disabled="showingInput || $store.state.isLoadingAnnotation"
                            :loading="$store.state.isLoadingAnnotation">
                    </v-autocomplete>

                    <v-pagination v-if="numberOfAvailablePages > 1"
                            v-model="selectedPage"
                            :length="numberOfAvailablePages"
                        :total-visible="Math.min(9, numberOfAvailablePages)">

                    </v-pagination>

                    <v-autocomplete
                            v-if="!$store.state.sentenceTokenizationEnabledForAnnotation"
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

                    <v-autocomplete
                            chips
                            multiple
                            clearable
                            label="Highlight Tore"
                            :items="annotation_tores"
                            :loading="$store.state.isLoadingAnnotation"
                            :disabled="$store.state.annotatorInputVisible || $store.state.isLoadingAnnotation"
                            v-model="annotatorTores"
                    >
                    <template v-slot:selection="data">
                            <v-chip
                                    v-bind="{...data.attrs, color: getToreHighlightColor(data.item)}"
                                    :input-value="data.selected"
                                    close
                                    @input="(function(item) {
                                    const index_selected_tores = $store.state.selected_tores.indexOf(item)
                                    const selectedTores = $store.state.selected_tores
                                    if (index_selected_tores >= 0) {
                                        selectedTores.splice(index_selected_tores, 1)
                                    }
                                    $store.commit('updateSelectedTores', selectedTores)
                                })(data.item)"
                            >{{ data.item }}
                            </v-chip>
                        </template>
                    </v-autocomplete>
                </template>
              <v-layout column>

              <v-card flat class="header">
                  <template
                          v-else>
                      <v-card-title primary-title>
                        <h2>Coding Results View</h2>
                      </v-card-title>
                  </template>

                  <v-tooltip bottom
                             :key="'toolbar_icon'+0">
                      <template #activator="{on}">
                          <v-icon v-on="on"
                                  :disabled="showingInput || $store.state.isLoadingAnnotation"
                                  @click="showEditConfigurablesPopup"
                                  medium>
                              settings
                          </v-icon>
                      </template>
                      Annotation Seoad this tablettings
                  </v-tooltip>

                  <!--<v-tooltip bottom
                             :key="'toolbar_icon'+1">
                      <template #activator="{on}">
                          <v-icon v-on="on"
                                  :disabled="showingInput || $store.state.isLoadingAnnotation"
                                  @click="saveAndClose"
                                  medium>
                              exit_to_app
                          </v-icon>
                      </template>
                      <span>Save and exit</span>
                  </v-tooltip>-->

                  <v-tooltip bottom
                             v-if="!annotatorViewingCodeResults"
                             :key="'toolbar_icon'+2">
                      <template #activator="{on}">
                          <v-icon v-on="on"
                                  :disabled="showingInput || $store.state.isLoadingAnnotation"
                                  @click="doSaveAnnotation(false)"
                                  medium
                          >
                              save
                          </v-icon>
                      </template>
                      <span>Save</span>
                  </v-tooltip>

                  <v-tooltip bottom
                             :key="'toolbar_icon'+3">
                      <template #activator="{on}">
                          <v-icon v-if="!annotatorViewingCodeResults"
                                  v-on="on"
                                  :disabled="showingInput || $store.state.isLoadingAnnotation"
                                  @click="$store.commit('toggleAnnotatorViewingCodes', true)"
                                  medium
                          >
                              visibility
                          </v-icon>
                          <v-icon class="annotate-icon"
                                  v-else
                                  v-on="on"
                                  @click="$store.commit('toggleAnnotatorViewingCodes', false)"
                                  medium
                          >
                              mode
                          </v-icon>
                      </template>
                      <span v-if="!annotatorViewingCodeResults">View Codes</span>
                      <span v-else>Annotate</span>
                  </v-tooltip>
              </v-card>

              <v-container>
                    <v-card class="annotator-token-area"
                            v-if="!$store.state.isLoadingAnnotation && !annotatorViewingCodeResults"
                            ref="annotator">
                        <Token @annotator-token-click="tokenClicked"
                               @annotator-token-click-shift="tokenShiftClicked"
                               @annotator-token-click-ctrl="tokenCtrlClicked"
                               ref="token"
                               v-for="token_number in tokensThisPage"
                               :key="selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1"
                               v-bind="{
                               ...$store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1],
                               inSelectedCode: $store.state.token_in_selected_code[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1],
                               hasName: $store.state.token_num_name_codes[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1] > 0,
                               hasTore: $store.state.token_num_tore_codes[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1] > 0,
                               linkedTogether: isLinking && $store.state.token_linked_together[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1],
                               isLinking: isLinking,
                               algo_lemma: $store.state.selected_algo_result !== null && $store.getters.lemmasFromSelectedResult.includes($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].lemma?$store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].lemma.toLowerCase():''),
                               show_tore: $store.state.selected_tores.includes(getToreFromToken($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1])),
                               toreClass: getToreFromToken(($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1])),
                               show_pos: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos!==null && $store.state.selected_pos_tags.includes($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos),
                               posClass: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos,
                               isSentence: $store.state.sentenceTokenizationEnabledForAnnotation,
                               annotatorInputVisible: $store.state.annotatorInputVisible
                           }">
                        </Token>
                        <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
                            :key = "'emptyline'+emptyLineIndex">
                        <AnnotatorInput
                                class="annotator-input"
                                :disabled="mustDisambiguateTokenCode"
                                ref="input_panel"
                                :panelIsUp="panelIsUp"
                                @annotator-input-trash-click="delete_selected_code"
                                @annotator-input__arrow-icon-click="panelIsUp = !panelIsUp"
                                @remove-dialog-stylerule="removeDialogStylerule"
                                @show-edit-configurables="showEditConfigurablesPopup"
                                @reposition-dialog="positionInput"
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
                                        :style="i===0?'border: red solid 2px':(i===1?'border: green solid 2px':'')"
                                        @click="disambiguateTokenCode(item, i, this)()">
                                    {{i>1?`Edit Code - ` +codeDisplayPrompt(item):item.name}}
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-card>
                    <CodeView
                            @page-to-code="pageToCode"
                            @show-snackbar="doShowSnackbar"
                            v-if="annotatorViewingCodeResults">
                    </CodeView>
                </v-container>
              </v-layout>
            </v-card>
        </div>
    </div>
</template>

<script>
import Token from "@/components/annotator/Token";
import AnnotatorInput from "@/components/annotator/AnnotatorInput";
import CodeView from "@/components/uvlDashboardViews/annotation/CodeView";
import {Code, Code_user_display_prompt} from "@/components/annotator/code";
import {mapGetters, mapState} from "vuex";
import AnnotatorSettings from "@/components/uvlDashboardViews/annotation/AnnotatorSettings";
import EditConfigurablesDialog from "@/components/annotator/EditConfigurablesDialog";
import {getToreHighlightColor} from "@/colors";

export default {
        name: "Annotator",
        props: {
          selectedAnnotation: String,
        },
        created(){
          console.log("started creation function")

          //this.loadAnnotationsOnCreated();
          console.log("executed creation function")

        },
        data: () => {
            return {

                tokensPerPage: 350,

                selectedPage: 1,
                showingEditConfigurablesPopup: false,

                customStyleSheet: null,
                popupPositionStyleRuleIndex: null,

                snackbarText: "",

                requestAnnotatorInput: false,
                disambiguatedTokenCode: null,

                show_snackbar: false,

                algo_lemmas: null,
                annotatorInputWidthPct: 50,
                panelIsUp: true,

                last_code: null,
                last_token: null// used only to prevent unwanted auto-close of dialog on shift+click, ctrl+click
            }
        },
        components: {AnnotatorSettings, AnnotatorInput, Token, CodeView, EditConfigurablesDialog},
        computed: {
            
            tokensThisPage(){
                if((this.selectedPage * this.tokensPerPage) <= (this.selected_doc.end_index - this.selected_doc.begin_index)){
                    return this.tokensPerPage;
                } else {
                    return (this.selected_doc.end_index - this.selected_doc.begin_index) % this.tokensPerPage;
                }
            },

            numberOfAvailablePages(){
                if(!this.selected_doc){
                    return 1
                }
                return Math.floor((this.$store.state.selected_doc.end_index - this.$store.state.selected_doc.begin_index) / this.tokensPerPage) + 1
            },

            dialogPositionStyle(){  //  need to do this because the actual dialog DOM object isn't exposed
                let annotatorBox = this.annotatorBoundingRect;
                let tokenBox = this.selectedTokenBoundingRect;
                let panelIsUp = this.panelIsUp;
                if(annotatorBox === null || tokenBox === null){
                    return ""
                } else {
                    let upperLeft = annotatorBox.width-600;
                    return `.v-dialog{
                                margin: 5px;
                                position: absolute;
                                width: auto;
                                overflow: auto;
                                left: ${Math.min(upperLeft, tokenBox.left)}px;
                                top: ${tokenBox.top + tokenBox.height + (panelIsUp?0:200)}px;
                            }`
                }
            },

            /*
            getDebugTokenInfo(){
                console.log("Recomputing token 0")
                if(!this.$store.state.tokens[0]){
                    return "undefined"
                }
                return "Name: "+this.$store.state.tokens[0].name + "Num codes: "+this.$store.state.token_num_codes[0]
            },*/
            annotatorSelectedDoc: {
                get(){
                    return this.$store.state.selected_doc;
                },
                set(value){
                    this.selectedPage = 1;
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

            annotatorTores: {
                get(){
                    return this.$store.state.selected_tores;
                },
                set(value){
                    this.$store.commit("updateSelectedTores", value)
                }
            },

            mustDisambiguateTokenCode(){
                return this.requestAnnotatorInput && this.multipleCodesPromptList.length > 2 && this.disambiguatedTokenCode === null;
            },
            multipleCodesPromptList () {
                return [{name: "Cancel", tore:""},{name: "Create new Code", tore: ""}].concat(this.selectedToken===null?[]:this.getCodesForToken(this.selectedToken))
            },

            annotatorBoundingRect(){
                if(this.$store.state.selectedToken===null){
                    return null;
                }

                let ret = this.$refs.annotator.$el;
                return ret.getBoundingClientRect();
            },

            selectedTokenBoundingRect(){
                if(this.$store.state.selectedToken===null || this.annotatorViewingCodeResults){
                    return null;
                }
                try{
                  return document.getElementById("token_" + this.$store.state.selectedToken.index).getBoundingClientRect();
                } catch (e) {
                  console.error("Annotator::selectedTokenBoundingRect error getting bounding rect")
                  return null;
                }
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
                    top: `${tokenBox.top + tokenBox.height}px`
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
                "getToreFromToken"]),

            ...mapState([
                "lastAnnotationEditAt",
                "lastAnnotationPostAt",
                "annotatorViewingCodeResults",
                "selected_doc",
                "tores",
                "annotation_tores",
                "showRecommendationTore"
            ])
        },

        watch: {

            annotatorViewingCodeResults(){
                if(this.annotatorViewingCodeResults){
                    this.removeDialogStylerule("Showing code view results");
                }
            },

            selectedTokenBoundingRect(){
                this.positionInput();
            },

            panelIsUp(){
                this.positionInput();
            },

            lastAnnotationEditAt(val){
                let startTimer = false;
                if(this.lastAnnotationPostAt === null){
                    console.log("Starting save timer after first edit")
                    this.$store.commit("postAnnotationCallback")
                    startTimer = true;
                } else {
                    if(val - this.lastAnnotationPostAt > 1000 * 90){
                        console.info("Auto save")
                        this.doSaveAnnotation(true);
                        startTimer = true;
                    }
                }
                if(startTimer){
                    let self = this;
                    setTimeout(function(){
                        if(Date.now() - self.lastAnnotationPostAt > 1000 * 90){
                            console.info("Scheduled autosave")
                            self.doSaveAnnotation(true);
                        }
                    },1000 * 91)
                }
            }
        },

        mounted(){
          this.$store.commit("updateSelectedAnnotation", this.$props.selectedAnnotation)
          /*console.log("annotator loaded")
          console.log(this.$props.selectedAnnotation)
          console.log(this.$store.state.selected_annotation)
          console.log(this.$store.state.available_annotations)
          let currentAnnotation = this.$store.state.available_annotations.find(a => a.name === this.$props.selectedAnnotation)
          console.log(currentAnnotation)
          this.$refs.annotatorSettingsRef.viewCodeResults(currentAnnotation)*/

        },

        methods: {
            async loadAnnotationsOnCreated (){
              try {
                console.log("trying to get annotations async")
                await this.$store.dispatch('actionGetAllAnnotations')
                console.log("got all annotations async")
              } catch (error) {
                console.error('Error loading annotations:', error);
              }
            },
            getToreHighlightColor,
            hideEditConfigurables(){
                this.showingEditConfigurablesPopup = false;
                if(this.showingInput){
                    this.positionInput();
                }
            },

            showEditConfigurablesPopup(){
                this.removeDialogStylerule("Showing 'edit configurables' dialog");
                this.showingEditConfigurablesPopup = true;
            },

            removeDialogStylerule(reason){
                console.log(reason+", clearing old stylesheet")
                this.deleteStyleruleIfNecessary();
                this.popupPositionStyleRuleIndex = null;
            },

            codeDisplayPrompt(item){
                return Code_user_display_prompt(item)
            },

            deleteStyleruleIfNecessary(){
                if(!this.customStyleSheet){
                    this.customStyleSheet = (function() {
                        // Create the <style> tag
                        let style = document.createElement("style");

                        // Add a media (and/or media query) here if you'd like!
                        // style.setAttribute("media", "screen")
                        // style.setAttribute("media", "only screen and (max-width : 1024px)")

                        // WebKit hack :(
                        style.appendChild(document.createTextNode(""));

                        // Add the <style> element to the page
                        document.head.appendChild(style);

                        return style.sheet;
                    })();
                }
                let sheet = this.customStyleSheet;
                if(sheet && this.popupPositionStyleRuleIndex !== null){
                    try{
                        sheet.deleteRule(this.popupPositionStyleRuleIndex)
                    } catch (e) {
                        console.error("Failed to delete style rule! Sheet and error: ")
                        console.error(sheet)
                        console.error(e)
                    }
                }
                return sheet;
            },

            positionInput(){
                if(this.selectedTokenBoundingRect === null || this.selectedTokenBoundingRect.width === 0){
                    return;
                }

                let style_ = this.dialogPositionStyle;
                if(style_===""){
                    return;
                }

                let sheet = this.deleteStyleruleIfNecessary()
                let css_rules_num = sheet.cssRules.length;
                //console.log("Inserting style: "+style_)
                sheet.insertRule(style_, css_rules_num)
                this.popupPositionStyleRuleIndex = css_rules_num;
            },

            disambiguateTokenCode(item, i){
                let self = this;
                return function(){
                    if(i === 0){  // cancel
                        self.requestAnnotatorInput = false;
                        self.$store.commit("setAnnotatorInputVisible", false);
                        return;
                    }
                    else if(i === 1){  // create a new code
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
                    this.last_code = code;
                    this.last_token = this.selectedToken;

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
                let toreFromToken = this.getToreFromToken(token);
                this.$store.commit("setRecommendationTores", "");
                
                if(this.showRecommendationTore && toreFromToken === ""){
                    this.$store.dispatch('actionGetRecommendationTores',token);
                }
                if(this.selected_code && !this.requiredAnnotationsPresent){  // codes need some kind of label
                    console.log("Missing required input, ignoring focus out")
                    return;
                }
                //let token = this.token(index)
                this.updateSelectedToken(token);
                if(!this.isLinking){
                    if(this.selected_code && this.selected_code.tokens.includes(index)){
                      let code = this.selected_code;
                      let new_token_index = 0;
                      if(code.tokens.length > 1){
                        new_token_index = Math.max(0, code.tokens.indexOf(index)-1)
                      }
                      this.$store.commit("removeTokenFromSelectedCode", token)
                      setTimeout(() => {

                        let newSelectedToken = this.$store.state.tokens[code.tokens[new_token_index]]
                        console.warn("Setting new selected token: ")
                        console.warn(newSelectedToken)


                        console.warn("Simulating original token click to reopen dialog")
                        this.updateSelectedToken(newSelectedToken)
                        this.$store.commit("set_selected_code", code);
                        this.$store.commit("updateLastAnnotationEditAt")
                        //this.$store.commit("setAnnotatorInputVisible", true);
                      });
                      return;
                    }

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
                if(this.isLinking){
                    this.tokenClicked(index);
                    return;
                }

                if(this.showingInput){
                    const clickindex = index;
                    if(this.$store.state.selected_code.tokens.includes(clickindex)){
                      console.log("Got click within token codes, returning")
                    } else {
                      let endlim = this.$store.state.selected_code.tokens[this.$store.state.selected_code.tokens.length-1];
                      let grow = endlim <= clickindex ? 1 : -1;
                      for(let i = endlim + grow; i !== clickindex + grow; i += grow){
                        this.$store.commit('assignToCode', {token: this.token(i), code: this.$store.state.selected_code})
                        this.$store.commit("updateLastAnnotationEditAt")
                      }
                    }

                    setTimeout(() => {
                        console.warn("Simulating original token click to reopen dialog")
                        this.updateSelectedToken(this.last_token)
                        this.disambiguatedTokenCode = this.last_code
                        this.addSelectedTokenToCode()
                    });
                } else {
                    let token = this.token(index)
                    this.tokenClicked(token)
                }
            },

            tokenCtrlClicked(index){
                if(this.isLinking){
                    this.tokenClicked(index);
                    return;
                }
                if(!this.isLinking) {
                  if (this.selected_code && this.selected_code.tokens.includes(index)) {
                    this.tokenClicked(index);
                    return;
                  }
                }

                let token = this.token(index)
                if(this.showingInput){

                    this.$store.commit('assignToCode', {token, code: this.$store.state.selected_code})
                    this.$store.commit("updateLastAnnotationEditAt")
                    setTimeout(() => {
                        console.warn("Simulating original token click to reopen dialog")
                        this.updateSelectedToken(this.last_token)
                        this.disambiguatedTokenCode = this.last_code
                        this.addSelectedTokenToCode()
                    });

                } else {
                    this.tokenClicked(index)
                }
            },

            delete_selected_code(){
                this.$store.commit("delete_selected_code");
                this.$store.commit("updateLastAnnotationEditAt")
                this.$store.commit("setAnnotatorInputVisible", false);
            },

            doSaveAnnotation(autosave){
                this.$store.dispatch('actionPostCurrentAnnotationAndSaveDashboard')
              if(autosave){
                    this.doShowSnackbar({msg:"Auto-saved."})
                } else {
                    this.doShowSnackbar({msg:"Annotation saved."})
                }
            },

            doShowSnackbar({msg}){
                this.snackbarText = msg;
                this.show_snackbar = true;
            },

            saveAndClose(){
                console.log("saveAndClose Annotator")
                this.doSaveAnnotation(false)
                this.$store.commit("resetAnnotator")
                this.$store.dispatch("actionGetAllAnnotations")
            },

            pageToCode(code){
                console.log("pageToCode: "+Code_user_display_prompt(code))
                if(!code){
                    console.error("pageToCode Cannot page to null/undefined code");
                }
                else if (!code.tokens.length > 0){
                    console.error("pageToCode Code doesn't have any tokens");
                } else {
                    let first_token_index = code.tokens[0];
                    let first_doc = true;
                    for(let d of this.$store.state.docs){
                        if(first_doc){
                            first_doc = false;
                        } else {
                            if(d.begin_index <= first_token_index && d.end_index > first_token_index){
                                let page = 1 + Math.floor((first_token_index - d.begin_index )/this.tokensPerPage);
                                this.annotatorSelectedDoc = d;
                                this.selectedPage = page;
                                this.$store.commit("toggleAnnotatorViewingCodes", false);
                                return;
                            }
                        }
                    }
                    console.error("pageToCode didn't find document for code")
                }
            },
            updateAnnotation(annotation){
                console.log("Let me show you something")
                //this.$store.commit("resetAnnotator")
                console.log(this.$store.state.selected_annotation)
                console.log(this.$refs.annotatorSettingsRef)
                this.$refs.annotatorSettingsRef.viewCodeResults(annotation)
                //this.$refs.annotatorSettingsRef2.startAnnotating(annotation)
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
    padding: 20px
}

.view-codes-header{
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: bold;
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

.annotator-toolbar__algo-results-select input {
    color: #ff6781;
}


</style>
