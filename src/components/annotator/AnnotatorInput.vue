<template>
    <v-card
            class="annotator-input"
            :style="{width: `${width}%`}"
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

                                <v-card-text>
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
                                <v-list-item
                                        v-on="onDialog"
                                >
                                    <v-list-item-title>Highlight all similar</v-list-item-title>
                                </v-list-item>
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

                <v-autocomplete
                        required
                        :class="['annotator-input__name']"
                        label="Name"
                        :items="codeNames"
                        item-text="name"
                        item-value="name"
                        :value="name"
                        autofocus
                        :rules="[requiredAnnotationsPresent || 'Either a name or a TORE code is required']"
                        @change="updateName"
                        @keydown="$emit('code-name-input-keydown', $event)"
                        @keyup="$emit('code-name-input-keyup', $event)"
                        ref="nameInput"
                ></v-autocomplete>

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

        <div class="annotator-input__relationships" v-if="!isLinking">
            <v-list class="annotator-input__relationships-list">
                <v-subheader>Edit a relationship</v-subheader>
                <v-list-item>
                    <v-list-item
                            @click="setSelectedToreRelationship(item)"
                            v-for="(item, i) in selectedCodeRelationships"
                            :key="'relationships_'+i">
                        {{(item.relationship_name?item.relationship_name:'[TORE Relationship]') +' -> '+tokenListToString(item.target_tokens)}}
                    </v-list-item>
                </v-list-item>
            </v-list>
        </div>

    </v-card>
</template>

<script>
    import {_tore_codes, _tore_relationship_names} from "./TORE_codes";

    import {mapGetters} from "vuex";

    export default {
        name: "AnnotatorInput",

        data(){
            return {
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
                "tokenListToString"]),
            name(){
                return this.selected_code.name;
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

            selectedCodeRelationships(){
                let r = []
                for (let rel of this.selected_code.relationship_memberships){
                    r.push(this.$store.state.tore_relationships[rel])
                }
                return r
            }
        },
        methods: {

            getselected_codeString(field){
                return this.selected_code.tokens.map(t => t==null?null:this.$store.state.tokens[t][field]).filter(t => t != null).toString();
            },
            updateRelationshipName(value){
                if(this.$store.state.selected_tore_relationship){
                    this.$store.commit("setRelationshipName", value);
                    this.$store.commit("updateLastAnnotationEditAt")
                }
            },
            updateName(value){
                this.$store.commit("updateCodeName", value);
                this.$store.commit("updateLastAnnotationEditAt")
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
            }
        },

    }
</script>

<style scoped>

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

    .annotator-input__relationships-list .v-list-item{
        min-height: 28px;
    }

    .annotator-input__relationships-list .v-subheader {
        justify-content: center;
        height: 14px;
    }

</style>