<template>
    <v-dialog
            :hide-overlay="true"
            :persistent="!requiredAnnotationsPresent || isLinking"
            :no-click-animation="isLinking"
            v-model="wrapInputVisible"
            v-if="wrapInputVisible"
            id="annotator-input-dialog"
            :scrollable="false"
        >
        <v-card
                :elevation="0"
                class="annotator-input"
                :disabled="disabled">

            <div class="annotator-input__input-fields">
                <template v-if="!isLinking"
                          class="annotator-input-no-link">
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
                                        Highlight all similar
                                    </v-card-title>

                                    <v-card-text
                                    >
                                        Current token: <b>{{selectedToken.name}}</b> Current token lemma: <b>{{selectedToken.lemma}}</b><br>

                                        Current code: <b>[{{getselected_codeString("name")}}]</b> Current code (lemmas): <b>[{{getselected_codeString("lemma")}}]</b>  <br>

                                        Highlighting all similar codes will <b>only</b> find codes with <b>adjacent</b> matching tokens/lemmas.
                                    </v-card-text>

                                    <v-text-field></v-text-field>

                                    <v-divider></v-divider>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            token
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            lemma
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            code
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            code (lemmas)
                                        </v-btn>
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

                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    @click="trashClicked" class="annotator-input__trash">
                                delete_outline
                            </v-icon>
                        </template>
                        <span>Delete This Concept</span>
                    </v-tooltip>

                    <v-combobox
                            required
                            :class="['annotator-input__name']"
                            label="Name"
                            :items="codeNames"
                            v-model="name"
                            item-text="name"
                            item-value="name"
                            :rules="[requiredAnnotationsPresent || 'Either a name or a TORE code is required']"
                            ref="nameInput"
                            v-if="wrapInputVisible"
                            autofocus
                            id="annotator-input__name"
                    ></v-combobox>

                    <v-autocomplete
                            class="annotator-input__tore"
                            @change="updateTore"
                            :rules="[requiredAnnotationsPresent || 'Either a name or a TORE code is required']"
                            :items="tore_codes"
                            :value="tore"
                            label="TORE-Code">
                    </v-autocomplete>

                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    :disabled="!selected_code.tore"
                                    @click="startLinking">
                                link
                            </v-icon>
                        </template>
                        <span>New TORE Relationship</span>
                    </v-tooltip>
                </template>
                <template v-else
                          class="annotator-input-link">
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

                    <v-autocomplete  class="annotator-input__relationship-name"
                                     @change="updateRelationshipName"
                                     :items="relationship_name_options"
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
            </div>

            <div class="annotator-input__relationships" v-if="!isLinking && $store.state.selected_code && $store.state.selected_code.relationship_memberships.length > 0">
                <v-list class="annotator-input__relationships-list">
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
    </v-dialog>
</template>

<script>
    import {_tore_codes, _tore_relationship_names} from "./TORE_codes";

    import {mapGetters} from "vuex";

    export default {
        name: "AnnotatorInput",

        data(){
            return {
                customStyleSheet: null,

                popupPositionStyleRuleIndex: null,
                promptHighlightAll: false,
                tore_codes: Object.keys(_tore_codes).map(function(key) {
                        return _tore_codes[key];
                    }),
                relationship_name_options: Object.keys(_tore_relationship_names).map(function(key) {
                    return _tore_relationship_names[key];
                })
            }
        },
        computed: {
            ...mapGetters(["requiredAnnotationsPresent",
                "isLinking",
                "codeNames",
                "selected_code",
                "selected_tore_relationship",
                "selectedToken",
                "tokenListToString",
                "showingInput"]),

            dialogPositionStyle(){  //  need to do this because the actual dialog DOM object isn't exposed
                let annotatorBox = this.annotatorBoundingRect;
                let tokenBox = this.selectedTokenBoundingRect;
                let panelIsUp = this.panelIsUp;
                if(annotatorBox === null || tokenBox === null){
                    return ""
                } else {
                    let lowerWidth = annotatorBox.width*((100-this.width)/100);
                    return `.v-dialog{
                                margin: 5px;
                                position: absolute;
                                width: ${this.width}%;
                                overflow: hidden;
                                left: ${Math.min(lowerWidth, tokenBox.left)}px;
                                top: ${tokenBox.top + tokenBox.height + (panelIsUp?0:200)}px;
                            }`
                }
            },

            wrapInputVisible: {
                get(){
                    return this.showingInput;
                },

                set(bool){
                    if(!this.requiredAnnotationsPresent){  // codes need some kind of label
                        console.log("Missing required input, ignoring dialog hide")
                    } else {
                        console.log(this.selected_code)
                        this.$store.commit("setAnnotatorInputVisible", bool);  // should always be false
                    }
                }
            },

            name: {
                get(){
                    return this.selected_code.name;
                },
                set(value){
                    this.$store.commit("updateCodeName", value);
                    this.$store.commit("updateLastAnnotationEditAt")
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
            selectedTokenBoundingRect(){
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
            }
        },
        methods: {
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
                    sheet.deleteRule(this.popupPositionStyleRuleIndex)
                }
                return sheet;
            },

            getselected_codeString(field){
                return this.selected_code.tokens.map(t => t==null?null:this.$store.state.tokens[t][field]).filter(t => t != null).toString();
            },
            updateRelationshipName(value){
                if(this.$store.state.selected_tore_relationship){
                    this.$store.commit("setRelationshipName", value);
                    this.$store.commit("updateLastAnnotationEditAt")
                }
            },
            updateTore(value){
                this.$store.commit("updateCodeTore", value);
                this.$store.commit("updateLastAnnotationEditAt")
            },
            trashClicked(){
                this.$emit("annotator-input-trash-click");
            },
            startLinking(){
                this.$store.commit("setIsLinking", true);
            },
            stopLinking(){
                this.$store.commit("setIsLinking", false);
            },
            arrowIconClicked(){
                this.$emit("annotator-input__arrow-icon-click");
            },
            deleteRelationshipClicked(){
                if(this.selected_tore_relationship){
                    this.$store.commit('delete_tore_relationship', this.selected_tore_relationship)
                    this.$store.commit("updateLastAnnotationEditAt")
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

            width: {
                type: Number,
                required: true
            },

            selectedTokenBoundingRect: {
                type: DOMRect
            },

            annotatorBoundingRect: {
                type: DOMRect
            }
        },

    }
</script>

<style>

    .annotator-input{
        display: flex;
        width: fit-content;
        flex-direction: column;
        align-items: center;
    }

    .annotator-input__input-fields {
        display: flex;
        width: 100%;
        flex-direction: row;
    }

    .annotator-input-no-link{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 10px;
        margin: 10px;
    }

    .annotator-input__trash {
        float: left;
        margin-right: 10px;
    }

    .annotator-input__relationship-name {
        float: left;
        flex: 1 1 20em;
    }

    .annotator-input__tore {
        float: left;
        flex: 1 1 20em;
    }

    .annotator-input__relationships-list .v-list__tile{
        display: flex;
        justify-content: center;
        height: 28px;
    }

    .annotator-input__relationships-list .v-subheader {
        display: flex;
        justify-content: center;
        height: 14px;
    }

</style>