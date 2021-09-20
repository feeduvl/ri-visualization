<template>
    <v-card
            class="annotator-input"
            :class="[isLinking?'annotator-input-link':'annotator-input-no-link']"
            :style="{width: `${width}%`}">

        <template v-if="!isLinking">

            <v-tooltip bottom>
                <template v-slot:activator="{on: onTooltip}">
                    <v-menu
                            v-on="{onTooltip}"
                            bottom
                            left
                            offset-x
                    >
                        <template v-slot:activator="{on: onMenu}">
                            <v-icon v-on="onMenu">
                                mdi-format-list-bulleted
                            </v-icon>
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

                                        Current token cluster: <b>[{{getSelectedTokenClusterString("name")}}]</b> Current token cluster (lemmas): <b>[{{getSelectedTokenClusterString("lemma")}}]</b>  <br>

                                        Highlighting all similar clusters will <b>only</b> find clusters with <b>adjacent</b> matching tokens/lemmas.
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
                                            token cluster
                                        </v-btn>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="promptHighlightAll = false"
                                        >
                                            token cluster (lemmas)
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>

                                <template v-slot:activator="{on: onDialog}" >
                                    <v-list-item
                                            :disabled="!requiredAnnotationsPresent"
                                            v-on="onDialog"
                                    >
                                        <v-list-item-title>Highlight all similar</v-list-item-title>
                                    </v-list-item>
                                </template>
                            </v-dialog>
                        </v-list>
                    </v-menu>
                </template>
                <span>Show Options</span>
            </v-tooltip>


            <v-tooltip bottom>
                <template #activator="{on}">
                    <v-icon v-on="on"
                            @click="trashClicked" class="annotator-input__trash">
                        mdi-trash-can-outline
                    </v-icon>
                </template>
                <span>Delete This Concept</span>
            </v-tooltip>

            <v-autocomplete
                    required
                    :class="['annotator-input__name']"
                    label="Name"
                    :items="clusterNames"
                    item-text="name"
                    item-value="name"
                    :value="name"
                    @change="updateNote"
                    :rules="[requiredAnnotationsPresent || 'Name is required (Enter to confirm)']"
                    @keydown="$emit('cluster-name-input-keydown', $event)"
                    @keyup="$emit('cluster-name-input-keyup', $event)"
            ></v-autocomplete>

            <v-autocomplete
                    class="annotator-input__tore"
                    @change="updateTore"
                    :items="tore_codes"
                    :value="tore"
                    label="TORE-Code">
            </v-autocomplete>

            <v-tooltip bottom>
                <template #activator="{on}">
                    <v-icon v-on="on"
                            @click="startLinking"
                            :disabled="linkingDisabledNotEnoughClusters">
                        mdi-link
                    </v-icon>
                </template>
                <span>Link This Concept</span>
            </v-tooltip>

        </template>

        <template v-else>
            <v-tooltip bottom>
                <template #activator="{on}">
                    <v-icon v-on="on"
                            @click="stopLinking">
                        mdi-window-close
                    </v-icon>
                </template>
                <span>Stop Linking</span>
            </v-tooltip>


            <v-tooltip bottom>
                <template #activator="{on}">
                    <v-icon v-on="on"
                            @click="$store.commit('deleteClusterRelationship')">
                        mdi-trash-can-outline
                    </v-icon>
                </template>
                <span>Delete This Relationship</span>
            </v-tooltip>

            <v-autocomplete  class="annotator-input__relationship-name"
                             @change="updateRelationshipName"
                             :items="relationship_name_options"
                             :value="relationshipName"
                             label="Relationship Name">
            </v-autocomplete>
        </template>


        <v-card-actions>
            <v-tooltip bottom>
                <template #activator="{on}">
                        <v-icon v-on="on"
                                v-if="panelIsUp"
                                @click="arrowIconClicked">
                            mdi-arrow-down
                        </v-icon>
                        <v-icon
                                v-on="on"
                                v-else
                                @click="arrowIconClicked">
                            mdi-arrow-up
                        </v-icon>
                </template>
                <span>Move this box {{directionCueString}}</span>
            </v-tooltip>

        </v-card-actions>
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
            ...mapGetters(["isLinking",
                "clusterNames",
                "selectedTokenCluster",
                "selectedClusterRelationship",
                "selectedToken",
                "requiredAnnotationsPresent"]),
            linkingDisabledNotEnoughClusters(){
                return this.$store.state.token_clusters.length<=1;
            },
            name(){
                return this.$store.state.selectedTokenCluster.name;
            },
            tore(){
                return this.$store.state.selectedTokenCluster.tore;
            },
            relationshipName(){
                return this.$store.state.selectedClusterRelationship.relationship_names[this.$store.state.selectedTokenCluster.index]
            },
            directionCueString(){
                return this.panelIsUp?"down":"up";
            }
        },
        methods: {
            getSelectedTokenClusterString(field){
                return this.selectedTokenCluster.tokens.map(t => t==null?null:this.$store.state.tokens[t][field]).filter(t => t != null).toString();
            },
            updateRelationshipName(value){
                this.$store.commit("setRelationshipName", value);
            },
            updateNote(value){
                this.$store.commit("updateTokenClusterNote", value);
            },
            updateTore(value){
                this.$store.commit("updateTokenClusterTore", value);
            },
            trashClicked(){
                this.$emit("annotator-input-trash-click");
            },
            startLinking(){
                this.$store.commit("newClusterRelationship");
            },
            stopLinking(){
                this.$store.commit("setIsLinking", false);
            },
            arrowIconClicked(){
                this.$emit("annotator-input__arrow-icon-click");
            }
        },
        props: {
            panelIsUp: {
                type: Boolean
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

    .annotator-input__name {
        float: left;
        flex: 1 1 20em;
    }

    .annotator-input__tore {
        float: left;
        flex: 1 1 20em;
    }

</style>