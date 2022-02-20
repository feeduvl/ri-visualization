<template>
  <div>
    <v-snackbar
        class="saved-agreement-snackbar"
        v-model="show_snackbar"
        :timeout="2500"
    >
      {{ this.snackbarText }}
    </v-snackbar>

    <AgreementSettings
        v-if="!$store.state.selected_agreement">
    </AgreementSettings>

    <div class="agreement"
         v-else>
      <v-card class="agreement-toolbar"
      >

        <template
            v-if="!agreementViewingCodeResults">
          <v-autocomplete
              class="agreement-string-selection agreement-toolbar__document-select"
              :items="$store.state.docs"
              v-model="agreementSelectedDoc"
              @change="$store.commit('updateDocTokens')"
              item-text="name"
              return-object
              label="Select a Document"
              :disabled="showingInput || $store.state.isLoadingAgreement"
              :loading="$store.state.isLoadingAgreement">
          </v-autocomplete>

          <v-pagination v-if="numberOfAvailablePages > 1"
                        v-model="selectedPage"
                        :length="numberOfAvailablePages"
                        :total-visible="Math.min(9, numberOfAvailablePages)">

          </v-pagination>

          <v-autocomplete
              class="agreement-string-selection agreement-toolbar__algo-results-select"
              :items="$store.getters.agreementAlgoResults"
              item-text="name"
              return-object
              v-model="agreementAlgoResult"
              label="Highlight Algorithm Results"
              :disabled="showingInput || $store.state.isLoadingAgreement"
              :loading="$store.state.isLoadingAgreement"
              clearable>
          </v-autocomplete>

          <v-autocomplete
              chips
              multiple
              clearable
              label="Part of Speech Highlights"
              class="agreement-toolbar__pos-select"
              :items="pos_tags"
              item-text="name"
              item-value="tag"
              :loading="$store.state.isLoadingAgreement"
              :disabled="$store.state.agreementInputVisible || $store.state.isLoadingAgreement"
              v-model="agreementPosTags"
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
                        Coding Results View
                    </span>
        </template>

        <v-tooltip bottom
                   :key="'toolbar_icon'+1">
          <template #activator="{on}">
            <v-icon v-on="on"
                    :disabled="showingInput || $store.state.isLoadingAgreement"
                    @click="saveAndClose"
                    medium>
              exit_to_app
            </v-icon>
          </template>
          <span>Save and exit</span>
        </v-tooltip>

        <v-tooltip bottom
                   v-if="!agreementViewingCodeResults"
                   :key="'toolbar_icon'+2">
          <template #activator="{on}">
            <v-icon v-on="on"
                    :disabled="showingInput || $store.state.isLoadingAgreement"
                    @click="doSaveAgreement(false)"
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
            <v-icon v-if="!agreementViewingCodeResults"
                    v-on="on"
                    :disabled="showingInput || $store.state.isLoadingAgreement"
                    @click="$store.commit('toggleAgreementViewingCodes', true)"
                    medium
            >
              visibility
            </v-icon>
            <v-icon class="annotate-icon"
                    v-else
                    v-on="on"
                    @click="$store.commit('toggleAgreementViewingCodes', false)"
                    medium
            >
              mode
            </v-icon>
          </template>
          <span v-if="!agreementViewingCodeResults">View Codes</span>
          <span v-else>Annotate</span>
        </v-tooltip>

      </v-card>
      <v-card class="agreement-token-area"
              v-if="!$store.state.isLoadingAgreement && !agreementViewingCodeResults"
              ref="agreement">
        <TokenAlternative @agreement-token-click="tokenClicked"
               @agreement-token-click-shift="tokenShiftClicked"
               @agreement-token-click-ctrl="tokenCtrlClicked"
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
                       show_pos: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos!==null && $store.state.selected_pos_tags.includes($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos),
                       posClass: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos,
                       agreementInputVisible: $store.state.agreementInputVisible
                   }">
        </TokenAlternative>
        <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
            :key="'emptyline'+emptyLineIndex">
        <AgreementInput
            class="agreement-input"
            :disabled="mustDisambiguateTokenCode"
            ref="input_panel"
            :panelIsUp="panelIsUp"
            @agreement-input-trash-click="delete_selected_code"
            @agreement-input__arrow-icon-click="panelIsUp = !panelIsUp"
            @remove-dialog-stylerule="removeDialogStylerule"
            @reposition-dialog="positionInput"
        />
        <v-card
            class="disambiguation-prompt"
            :style="inputFieldPanelLocationStyle"
            v-if="mustDisambiguateTokenCode">
          <v-list>
            <v-subheader>Do something with this token:</v-subheader>
            <v-list-tile
                v-for="(item, i) in multipleCodesPromptList"
                :key="'prompt_'+i"
                :style="i===0?'border: red solid 2px':(i===1?'border: green solid 2px':'')"
                @click="disambiguateTokenCode(item, i, this)()">
              {{ i > 1 ? `Edit Code - ` + codeDisplayPrompt(item) : item.name }}
            </v-list-tile>
          </v-list>
        </v-card>
      </v-card>
      <AgreementCodeView
          @page-to-code="pageToCode"
          @show-snackbar="doShowSnackbar"
          v-if="agreementViewingCodeResults">
      </AgreementCodeView>
    </div>
  </div>
</template>

<script>
import TokenAlternative from "@/components/agreement/TokenAlternative";
import AgreementInput from "@/components/agreement/AgreementInput";
import AgreementCodeView from "@/components/agreement/AgreementCodeView";
import {Code, Code_user_display_prompt} from "@/components/agreement/code";
import {mapGetters, mapState} from "vuex";
import AgreementSettings from "@/components/agreement/AgreementSettings";

export default {
  name: "Agreement",
  data: () => {
    return {

      tokensPerPage: 350,

      selectedPage: 1,

      customStyleSheet: null,
      popupPositionStyleRuleIndex: null,

      snackbarText: "",

      requestAgreementInput: false,
      disambiguatedTokenCode: null,

      show_snackbar: false,

      algo_lemmas: null,
      agreementInputWidthPct: 50,
      panelIsUp: true,

      last_code: null,
      last_token: null// used only to prevent unwanted auto-close of dialog on shift+click, ctrl+click
    }
  },
  components: {TokenAlternative, AgreementSettings: AgreementSettings, AgreementInput, AgreementCodeView},
  computed: {

    tokensThisPage() {
      if ((this.selectedPage * this.tokensPerPage) <= (this.selected_doc.end_index - this.selected_doc.begin_index)) {
        return this.tokensPerPage;
      } else {
        return (this.selected_doc.end_index - this.selected_doc.begin_index) % this.tokensPerPage;
      }
    },

    numberOfAvailablePages() {
      if (!this.selected_doc) {
        return 1
      }
      return Math.floor((this.$store.state.selected_doc.end_index - this.$store.state.selected_doc.begin_index) / this.tokensPerPage) + 1
    },

    dialogPositionStyle() {  //  need to do this because the actual dialog DOM object isn't exposed
      let agreementBox = this.agreementBoundingRect;
      let tokenBox = this.selectedTokenBoundingRect;
      let panelIsUp = this.panelIsUp;
      if (agreementBox === null || tokenBox === null) {
        return ""
      } else {
        let upperLeft = agreementBox.width - 600;
        return `.v-dialog{
                                margin: 5px;
                                position: absolute;
                                width: auto;
                                overflow: auto;
                                left: ${Math.min(upperLeft, tokenBox.left)}px;
                                top: ${tokenBox.top + tokenBox.height + (panelIsUp ? 0 : 200)}px;
                            }`
      }
    },

    agreementSelectedDoc: {
      get() {
        return this.$store.state.selected_doc;
      },
      set(value) {
        this.selectedPage = 1;
        this.$store.commit("updateSelectedDoc", value)
      }
    },

    agreementAlgoResult: {
      get() {
        return this.$store.state.selected_algo_result;
      },

      set(value) {
        this.$store.commit("updateSelectedAlgoResult", value === undefined ? null : value)
      }
    },

    agreementPosTags: {
      get() {
        return this.$store.state.selected_pos_tags;
      },
      set(value) {
        this.$store.commit("updateSelectedPosTags", value)
      }
    },

    mustDisambiguateTokenCode() {
      return this.requestAgreementInput && this.multipleCodesPromptList.length > 2 && this.disambiguatedTokenCode === null;
    },
    multipleCodesPromptList() {
      return [{name: "Cancel", tore: ""}, {
        name: "Create new Code",
        tore: ""
      }].concat(this.selectedToken === null ? [] : this.getCodesForToken(this.selectedToken))
    },

    agreementBoundingRect() {
      if (this.$store.state.selectedToken === null) {
        return null;
      }

      let ret = this.$refs.agreement.$el;
      return ret.getBoundingClientRect();
    },

    selectedTokenBoundingRect() {
      if (this.$store.state.selectedToken === null || this.agreementViewingCodeResults) {
        return null;
      }
      try {
        return document.getElementById("token_" + this.$store.state.selectedToken.index).getBoundingClientRect();
      } catch (e) {
        console.error("Agreement::selectedTokenBoundingRect error getting bounding rect")
        return null;
      }
    },

    inputFieldPanelLocationStyle() {
      let tokenBox = this.selectedTokenBoundingRect;
      if (tokenBox === null) {
        return {}
      }
      let agreementBox = this.$refs.agreement.$el.getBoundingClientRect();
      let lowerWidth =agreementBox.width * ((100 - this.agreementInputWidthPct) / 100);
      return {
        left: `${Math.min(lowerWidth, tokenBox.left)}px`,
        top: `${tokenBox.top + tokenBox.height}px`
      }
    },

    ...mapGetters(["requiredAgreementsPresent",
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
      "lastAgreementEditAt",
      "lastAgreementPostAt",
      "agreementViewingCodeResults",
      "selected_doc"
    ])
  },

  watch: {

    agreementViewingCodeResults() {
        console.log("Watching agreement code results")
      if (this.agreementViewingCodeResults) {
        this.removeDialogStylerule("Showing code view results");
      }
    },

    selectedTokenBoundingRect() {
      this.positionInput();
    },

    panelIsUp() {
      this.positionInput();
    },

    lastAgreementEditAt(val) {
      let startTimer = false;
      if (this.lastAgreementPostAt === null) {
        console.log("Starting save timer after first edit")
        this.$store.commit("postAgreementCallback")
        startTimer = true;
      } else {
        if (val - this.lastAgreementPostAt > 1000 * 90) {
          console.info("Auto save")
          this.doSaveAgreement(true);
          startTimer = true;
        }
      }
      if (startTimer) {
        let self = this;
        setTimeout(function () {
          if (Date.now() - self.lastAgreementPostAt > 1000 * 90) {
            console.info("Scheduled autosave")
            self.doSaveAgreement(true);
          }
        }, 1000 * 91)
      }
    }
  },

  mounted() {
  },

  methods: {

    removeDialogStylerule(reason) {
      console.log(reason + ", clearing old stylesheet")
      this.deleteStyleruleIfNecessary();
      this.popupPositionStyleRuleIndex = null;
    },

    codeDisplayPrompt(item) {
      return Code_user_display_prompt(item)
    },

    deleteStyleruleIfNecessary() {
      if (!this.customStyleSheet) {
        this.customStyleSheet = (function () {
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
      if (sheet && this.popupPositionStyleRuleIndex !== null) {
        try {
          sheet.deleteRule(this.popupPositionStyleRuleIndex)
        } catch (e) {
          console.error("Failed to delete style rule! Sheet and error: ")
          console.error(sheet)
          console.error(e)
        }
      }
      return sheet;
    },

    positionInput() {
      if (this.selectedTokenBoundingRect === null || this.selectedTokenBoundingRect.width === 0) {
        return;
      }

      let style_ = this.dialogPositionStyle;
      if (style_ === "") {
        return;
      }

      let sheet = this.deleteStyleruleIfNecessary()
      let css_rules_num = sheet.cssRules.length;
      //console.log("Inserting style: "+style_)
      sheet.insertRule(style_, css_rules_num)
      this.popupPositionStyleRuleIndex = css_rules_num;
    },

    disambiguateTokenCode(item, i) {
      let self = this;
      return function () {
        if (i === 0) {  // cancel
          self.requestAgreementInput = false;
          return;
        } else if (i === 1) {  // create a new code
          self.disambiguatedTokenCode = null;
        } else {
          self.disambiguatedTokenCode = item
        }
        self.requestAgreementInput = false;  // decision has been made, hide the panel
        console.log('Code click: ' + item)
        self.addSelectedTokenToCode()
      }
    },

    /**
     * perform the assignment of the selected token to a Code
     * Create a new Core if necessary, else use user selected one
     */
    addSelectedTokenToCode() {
      let token = this.selectedToken;
      if (!this.isLinking) {
        let code = null;
        let new_code = false;

        if (this.disambiguatedTokenCode === null) {
          new_code = true;
        } else {
          code = this.disambiguatedTokenCode;
          this.disambiguatedTokenCode = null;
        }
        code = new_code ? new Code(this.$store.state.codes.length) : code;

        this.$store.commit('assignToCode', {
          token: this.token(token.index),
          code: code,
          new_code: new_code
        });
        this.$store.commit("updateLastAgreementEditAt")

        this.$store.commit("set_selected_code", code);
        this.last_code = code;
        this.last_token = this.selectedToken;

      } else {
        console.error("addTokenToCode called while linker is open")
      }
    },

    /**
     * Set the selected token and show the agreement
     * @param token
     */
    updateSelectedToken(token) {
      this.$store.commit("setSelectedToken", token);
      this.$store.commit("setAgreementInputVisible", true);
    },

    tokenClicked(index) {
      if (this.selected_code && !this.requiredAgreementsPresent) {  // codes need some kind of label
        console.log("Missing required input, ignoring focus out")
        return;
      }
      let token = this.token(index)
      this.updateSelectedToken(token);
      if (!this.isLinking) {
        if (this.selected_code && this.selected_code.tokens.includes(index)) {
          let code = this.selected_code;
          let new_token_index = 0;
          if (code.tokens.length > 1) {
            new_token_index = Math.max(0, code.tokens.indexOf(index) - 1)
          }
          this.$store.commit("removeTokenFromSelectedCode", token)
          setTimeout(() => {

            let newSelectedToken = this.$store.state.tokens[code.tokens[new_token_index]]
            console.warn("Setting new selected token: ")
            console.warn(newSelectedToken)


            console.warn("Simulating original token click to reopen dialog")
            this.updateSelectedToken(newSelectedToken)
            this.$store.commit("set_selected_code", code);
            this.$store.commit("updateLastAgreementEditAt")
            //this.$store.commit("setAgreementInputVisible", true);
          });
          return;
        }

        this.requestAgreementInput = true;  //  let the panel know we want to open the agreement input

        if (!this.mustDisambiguateTokenCode) {  // else the assignment will be performed after user action
          this.requestAgreementInput = false;
          this.addSelectedTokenToCode()
        }
      } else {
        if (this.selected_tore_relationship === null) {
          this.$store.commit("new_tore_relationship", token)
        } else {
          this.$store.commit("add_or_remove_token_selected_relationship", token)
        }
        this.$store.commit("updateLastAgreementEditAt")
      }
    },

    tokenShiftClicked(index) {
      /*if(this.selected_code && !this.requiredAgreementsPresent){  // codes need some kind of label
          console.log("Missing required input, ignoring focus out")
          return;
      }*/
      if (this.isLinking) {
        this.tokenClicked(index);
        return;
      }

      if (this.showingInput) {
        const clickindex = index;
        if (this.$store.state.selected_code.tokens.includes(clickindex)) {
          console.log("Got click within token codes, returning")
        } else {
          let endlim = this.$store.state.selected_code.tokens[this.$store.state.selected_code.tokens.length - 1];
          let grow = endlim <= clickindex ? 1 : -1;
          for (let i = endlim + grow; i !== clickindex + grow; i += grow) {
            this.$store.commit('assignToCode', {token: this.token(i), code: this.$store.state.selected_code})
            this.$store.commit("updateLastAgreementEditAt")
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

    tokenCtrlClicked(index) {
      if (this.isLinking) {
        this.tokenClicked(index);
        return;
      }
      if (!this.isLinking) {
        if (this.selected_code && this.selected_code.tokens.includes(index)) {
          this.tokenClicked(index);
          return;
        }
      }

      let token = this.token(index)
      if (this.showingInput) {

        this.$store.commit('assignToCode', {token, code: this.$store.state.selected_code})
        this.$store.commit("updateLastAgreementEditAt")
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

    delete_selected_code() {
      this.$store.commit("delete_selected_code");
      this.$store.commit("updateLastAgreementEditAt")
      this.$store.commit("setAgreementInputVisible", false);
    },

    doSaveAgreement(autosave) {
      this.$store.dispatch('actionPostCurrentAgreement')
      if (autosave) {
        this.doShowSnackbar({msg: "Auto-saved."})
      } else {
        this.doShowSnackbar({msg: "Agreement saved."})
      }
    },

    doShowSnackbar({msg}) {
      this.snackbarText = msg;
      this.show_snackbar = true;
    },

    saveAndClose() {
      this.doSaveAgreement(false)
      this.$store.commit("resetAgreement")
      this.$store.dispatch("actionGetAllAgreements")
    },

    pageToCode(code) {
      console.log("pageToCode: " + Code_user_display_prompt(code))
      if (!code) {
        console.error("pageToCode Cannot page to null/undefined code");
      } else if (!code.tokens.length > 0) {
        console.error("pageToCode Code doesn't have any tokens");
      } else {
        let first_token_index = code.tokens[0];
        let first_doc = true;
        for (let d of this.$store.state.docs) {
          if (first_doc) {
            first_doc = false;
          } else {
            if (d.begin_index <= first_token_index && d.end_index > first_token_index) {
              let page = 1 + Math.floor((first_token_index - d.begin_index) / this.tokensPerPage);
              this.agreementSelectedDoc = d;
              this.selectedPage = page;
              this.$store.commit("toggleAgreementViewingCodes", false);
              return;
            }
          }
        }
        console.error("pageToCode didn't find document for code")
      }
    }
  }
}
</script>


<style>

.saved-snackbar .v-snack__wrapper {
  min-width: 0px;
}
</style>

<style scoped>
.agreement {
  position: relative;
}

.agreement-toolbar {
  justify-content: flex-end;
  position: sticky;
  top: 0px;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 78px;
}

.view-codes-header {

  letter-spacing: normal;
  font-weight: 300;
  font-size: 20px;
  font-family: Roboto, sans-serif;
  flex-grow: 1;
}

.agreement-icon {
  margin-right: 10px;
}

.agreement-string-selection {
  margin-top: 14px;
}

.agreement-token-area {
  display: block;
}

.agreement-input, .disambiguation-prompt {
  position: fixed;
}

.agreement-toolbar__document-select {
  width: 300px;
  flex-grow: 1;
  justify-self: flex-start;
}

.agreement-toolbar__algo-results-select {
  width: 300px;
  flex-grow: 1;
  justify-self: flex-end;
}

.agreement-toolbar__algo-results-select input {
  color: #ff6781;
}


</style>
