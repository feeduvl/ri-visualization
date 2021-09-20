<template>
    <div class="annotator" ref="annotator">
        <v-card class="annotator-toolbar">

            <v-autocomplete
                    class="annotator-toolbar__selected-document"
                    :items="$store.state.availableDocuments"
                    item-text="name"
                    label="Select a Document"
                    clearable>
            </v-autocomplete>

            <v-autocomplete
                    class="annotator-toolbar__algo-results"
                    :items="$store.state.algo_results"
                    item-text="name"
                    item-value="lemmas"
                    v-model="algo_lemmas"
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
                    v-model="selected_pos_tags"
            >
                <template v-slot:selection="data">
                    <v-chip
                            v-bind="{...data.attrs, color: data.item.color}"
                            :input-value="data.selected"
                            close
                            @click:close="(function(item) {
                                const index = selected_pos_tags.indexOf(item.tag)
                                if (index >= 0) selected_pos_tags.splice(index, 1)
                            })(data.item)"
                            @click="data.select"
                    >{{ data.item.name }}
                    </v-chip>
                </template>
            </v-autocomplete>

        </v-card>
        <v-card v-if="false" class="annotator-debug-panel">
            <v-textarea v-for="(t, index) in $store.state.token_clusters"
                        :key="index"
                        :label="JSON.stringify(t)"
                        outlined
                        dense
                        rows="2"
            ></v-textarea>
            <v-textarea v-for="(c, index) in $store.state.cluster_relationships"
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
                   v-for="(t, index) in $store.state.tokens"
                   :key="index"
                   v-bind="{
                       ...t,
                       show_pos: selected_pos_tags.filter((tag) => tag === t.pos).length > 0,
                       algo_lemma: algo_lemmas && algo_lemmas.includes(t.lemma),
                       index: index  // FIXME remove this in deployment
                   }">
            </Token>
            <br v-for="(_, emptyLineIndex) of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]"
                :key = "'emptyline'+emptyLineIndex">
            <AnnotatorInput
                    class="annotator-input"
                    v-if="showingInput"
                    v-click-outside="annotatorInputFocusOut"
                    ref="input_panel"
                    :style="inputFieldPanelLocationStyle"
                    :panelIsUp="panelIsUp"
                    :width="annotatorInputWidthPct"
                    :requiredAnnotationsPresent="requiredAnnotationsPresent"
                    @annotator-input-trash-click="deleteSelectedTokenCluster"
                    @annotator-input__arrow-icon-click="panelIsUp = !panelIsUp"
                    @cluster-name-input-keydown="expandIncompleteNameKeyDown"
            />
        </v-card>
        <v-snackbar v-model="displaySnackbarNoMultiClusters" bottom >
            Tokens cannot be assigned to more than one concept
        </v-snackbar>
    </div>
</template>

<script>
    import Token from "@/components/annotator/Token";
    import AnnotatorInput from "@/components/annotator/AnnotatorInput";
    import {TokenCluster} from "@/components/annotator/token_cluster";

    import {mapGetters} from "vuex";
    import {GET_EXAMPLE_ANNOTATION_POST_ENDPOINT} from "../../RESTconf";

    export default {
        name: "Annotator",
        data: () => {
            return {
                selected_pos_tags: [],
                incompleteNameInput: "",  // workaround to allow the user to type new names within autocomplete, should reflect current input value

                algo_lemmas: null,
                annotatorInputWidthPct: 60,
                panelIsUp: true,
                dropdownClassValues: ["annotator-input__tore", "v-list-item__content", "v-list-item", "v-list-item__title"]  // these aren't correctly identified as part of v-autocomplete
            }
        },
        components: {AnnotatorInput, Token},
        computed: {
            showingInput(){
                return this.selectedTokenCluster && this.$store.state.annotatorInputVisible;
            },
            inputFieldPanelLocationStyle(){
                if(this.$store.state.selectedToken===null){
                    return {}
                }
                let tokenBox = this.$refs.token[this.$store.state.selectedToken.index].$el.getBoundingClientRect();
                let annotatorBox = this.$refs.annotator.getBoundingClientRect();
                let lowerWidth = annotatorBox.width*((100-this.annotatorInputWidthPct)/100);
                return {
                    left: `${Math.min(lowerWidth, tokenBox.left)}px`,
                    top: `${tokenBox.top + tokenBox.height + (this.panelIsUp?0:200)}px`
                }
            },

            displaySnackbarNoMultiClusters: {
                get: function() {
                    return this.$store.state.displaySnackbarNoMultiClusters;
                },
                set: function(){
                    this.$store.commit("setDisplaySnackbarNoMultiClusters", false);
                }
            },
            ...mapGetters(["pos_tags","selectedTokenCluster", "selectedClusterRelationship", "isLinking", "token", "requiredAnnotationsPresent"])
        },
        created(){
            this.$store.commit("resetAnnotator")
        },

        mounted() {
            this.$store.dispatch(GET_EXAMPLE_ANNOTATION_POST_ENDPOINT).then(response => console.log("Annotator callback")).catch(e => {
                console.error("Error getting annotation: "+e);
            })
        },

        methods: {   // NOTE: `token` refers to the Vue Component in these methods

            expandIncompleteNameKeyDown(evnt){
                console.log(evnt)

                const key = evnt.key;
                if (key === "Enter"){
                    console.warn("User pressed Enter, persisting new token cluster name: "+this.incompleteNameInput);
                    this.$store.commit("updateTokenClusterNote", this.incompleteNameInput);
                    this.incompleteNameInput = ""
                } else if(key.length === 1) {
                    this.incompleteNameInput += key;
                }
            },

            /**
             * Will implicitly set the selectedTokenCluster
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
                if(this.showingInput){
                    const clickindex = token.index;
                    let endlim = this.$store.state.selectedTokenCluster.tokens[this.$store.state.selectedTokenCluster.tokens.length-1];
                    let grow = endlim <= clickindex ? 1 : -1;
                    for(let i = endlim; i !== clickindex + grow; endlim <= clickindex ? i++ : i--){
                        if(this.$refs.token[i].token_cluster === null){
                            this.$store.commit('assignToCluster', {token: this.token(i), token_cluster: this.$store.state.selectedTokenCluster})
                        }
                    }
                } else {
                    this.tokenClicked(token)
                }
            },

            tokenClicked(token){
                this.incompleteNameInput = token.token_cluster !== null ? this.$store.state.token_clusters[token.token_cluster].name : "";
                if(!this.isLinking){
                    if(token.token_cluster===null){
                        this.$store.commit('assignToCluster', {token: this.token(token.index),
                            token_cluster: new TokenCluster(this.$store.state.token_clusters.length),
                            new_cluster:true});
                    }
                    this.updateSelectedToken(token);
                } else {
                    if(token.token_cluster !== null){
                        this.$store.commit("addClusterToSelectedRelationship", this.$store.state.token_clusters[token.token_cluster]);
                        this.updateSelectedToken(token);
                    }
                }
            },

            /**
             * Should not be called if in linking mode
             * @param token
             */
            tokenCtrlClicked(token){
                if(this.showingInput){
                    this.$store.commit('assignToCluster', {token: this.token(token.index), token_cluster: this.$store.state.selectedTokenCluster})
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

                if(!this.requiredAnnotationsPresent){
                    return;  // don't focus out
                }

                // checking if target was another token
                if(!event.target.classList.contains("annotator-token-inner") && !event.target.classList.contains("annotator-token-outer")){
                    this.$store.commit("setAnnotatorInputVisible", false);
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

            deleteSelectedTokenCluster(){
                this.$store.commit("deleteSelectedTokenCluster");
                this.$store.commit("setAnnotatorInputVisible", false);
            }
        }
    }
</script>

<style scoped>

.annotator {
    position: relative;
}

.annotator-toolbar {
    z-index: 20;
    position: sticky;
    top: 0px;
    display: flex;
    align-items: center;
    width: 100%;
}

.annotator-token-area {
    display: block;
}

.annotator-input {
    position: fixed;
}

.annotator-toolbar__selected-document {
    width: 300px;
    flex-grow: 1;
    justify-self: flex-start;
}

.annotator-toolbar__algo-results{
    width: 300px;
    flex-grow: 1;
    justify-self: flex-end;
}

</style>
