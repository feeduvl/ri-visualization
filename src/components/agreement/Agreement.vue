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
                                  ref="token"
                                  v-for="token_number in tokensThisPage"
                                  :key="selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1"
                                  v-bind="{
                       ...$store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1],
                       isClicked: isClicked,
                       isResolved: tokenIsResolved[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1],
                       algo_lemma: $store.state.selected_algo_result !== null && $store.getters.lemmasFromSelectedResult.includes($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].lemma?$store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].lemma.toLowerCase():''),
                       show_pos: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos!==null && $store.state.selected_pos_tags.includes($store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos),
                       posClass: $store.state.tokens[selected_doc.begin_index + (tokensPerPage * (selectedPage - 1)) + token_number - 1].pos,
                       agreementInputVisible: $store.state.agreementInputVisible
                   }">
                </TokenAlternative>
                <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
                    :key="'emptyline'+emptyLineIndex">
                <AgreementAlternatives
                    class="agreement-alternative-selection"
                    ref="input_panel"
                    @agreement-input__arrow-icon-click="panelIsUp = !panelIsUp"
                    @remove-dialog-stylerule="removeDialogStylerule"
                    @reposition-dialog="positionInput"
                    @resolvedStatusOfTokensUpdated="calculateIsResolved"
                    v-bind="{token:selectedToken, panelIsUp:panelIsUp}">
                </AgreementAlternatives>
            </v-card>
            <AgreementCodeView
                @page-to-code="pageToCode"
                @show-snackbar="doShowSnackbar"
                @resolvedStatusOfTokensUpdated="calculateIsResolved"
                v-if="agreementViewingCodeResults">
            </AgreementCodeView>
        </div>
    </div>
</template>

<script>
import TokenAlternative from "@/components/agreement/TokenAlternative";
import AgreementAlternatives from "@/components/agreement/AgreementAlternatives";
import AgreementCodeView from "@/components/agreement/AgreementCodeView";
import {mapGetters, mapState} from "vuex";
import AgreementSettings from "@/components/agreement/AgreementSettings";

export default {
    name: "Agreement",
    data: () => {
        return {
            isClicked: null,
            primaryIsClicked: null,

            tokensPerPage: 350,

            selectedPage: 1,

            customStyleSheet: null,
            popupPositionStyleRuleIndex: null,

            snackbarText: "",

            requestAgreementInput: false,

            show_snackbar: false,

            algo_lemmas: null,
            agreementInputWidthPct: 50,
            panelIsUp: true,

            last_code: null,
            last_token: null,// used only to prevent unwanted auto-close of dialog on shift+click, ctrl+click
            tokenIsResolved: []

        }
    },
    components: {TokenAlternative, AgreementSettings: AgreementSettings, AgreementAlternatives, AgreementCodeView},
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
            let tokenBox = this.selectedTokenBoundingRectAgreement;
            let panelIsUp = this.panelIsUp;
            if (agreementBox === null || tokenBox === null) {
                return ""
            } else {
                let upperLeft = agreementBox.width - 1000;
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

        agreementBoundingRect() {
            if (this.$store.state.selectedToken === null) {
                return null;
            }
            console.log("Directly in agreementBoundingRect")

            let ret = this.$refs.agreement.$el;
            return ret.getBoundingClientRect();
        },

        selectedTokenBoundingRectAgreement() {
            if (this.$store.state.selectedToken === null || this.agreementViewingCodeResults) {
                return null;
            }
            try {
                return document.getElementById("token_" + this.$store.state.selectedToken.index).getBoundingClientRect();
            } catch (e) {
                console.error("Agreement::selectedTokenBoundingRectAgreement error getting bounding rect")
                return null;
            }
        },

        inputFieldPanelLocationStyle() {
            let tokenBox = this.selectedTokenBoundingRectAgreement;
            if (tokenBox === null) {
                return {}
            }
            let agreementBox = this.$refs.agreement.$el.getBoundingClientRect();
            let lowerWidth = agreementBox.width * ((100 - this.agreementInputWidthPct) / 100);
            return {
                left: `${Math.min(lowerWidth, tokenBox.left)}px`,
                top: `${tokenBox.top + tokenBox.height}px`
            }
        },

        ...mapGetters(["requiredAgreementsPresent",
            "selectedToken",
            "pos_tags",
            "selected_tore_relationship",
            "isLinking",
            "isAddingToken",
            "token",
            "docs",
            "selected_doc",
            "tokensInSelectedDoc",
            "tokenListToString",
            "new_tore_relationship",
            "showingInput"]),

        ...mapState([
            "lastAgreementEditAt",
            "lastAgreementPostAt",
            "agreementViewingCodeResults",
            "selected_doc",
            "unResolvedCodesPerToken",
        ])
    },

    watch: {
        unResolvedCodesPerToken() {
            console.log("Watching unresolved Codes per Token")
            this.calculateIsResolved()
        },

        agreementViewingCodeResults() {
            console.log("Watching agreement code results")
            if (this.agreementViewingCodeResults) {
                this.removeDialogStylerule("Showing code view results");
            }
        },

        selectedTokenBoundingRectAgreement() {
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

        calculateIsResolved() {
            console.log("Calculating isResolved")
            this.tokenIsResolved = this.unResolvedCodesPerToken.map(obj => {
                if (obj[0] === null) {
                    return null
                } else {
                    return obj.length === 0
                }
            })
        },

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
            if (this.selectedTokenBoundingRectAgreement === null || this.selectedTokenBoundingRectAgreement.width === 0) {
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

        /**
         * Set the selected token and show the agreement
         * @param token
         */
        updateSelectedToken(token) {
            this.$store.commit("setSelectedToken", token);
            if (this.tokenIsResolved[token.index] !== null) {
                this.$store.commit("setAgreementInputVisible", true);
            }
            this.$refs.input_panel.goBackToList()
        },

        tokenClicked(index) {
            let token = this.token(index)
            this.isClicked = index
            let primaryClicked = this.primaryIsClicked
            if(!this.isLinking && !this.isAddingToken) {
                this.updateSelectedToken(token);
                this.primaryIsClicked = index
            } else if (this.isLinking && !this.isAddingToken) {
                if(this.new_tore_relationship === null){
                    this.$store.commit("new_tore_relationship_in_agreement", token)
                } else {
                    this.$store.commit("add_or_remove_token_selected_relationship_in_agreement", token)
                }
                this.isClicked = primaryClicked
            } else {
                console.log("Token clicked to add to code")
                this.$store.commit("new_added_token_in_agreement", index)
                this.isClicked = primaryClicked
            }
        },

        doSaveAgreement(autosave) {
            this.$store.dispatch('actionPostCurrentAgreement')
            this.$store.commit("updateIsCompleted");
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
            console.log("pageToCode: ")
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

.agreement-string-selection {
    margin-top: 14px;
}

.agreement-token-area {
    display: block;
}

.agreement-alternative-selection {
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
