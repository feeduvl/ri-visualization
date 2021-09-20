<template>
    <span class="annotator-token-outer" :class="[applyPosStyle ? posClass:'token-outer-default',
    {
        whitespace: index < $store.state.tokens.length - 1, // whitespace after this token
        notEligibleForLink: notEligibleForLink,  //  not allowed for linking
        //notEligibleForClusterMembership: notEligibleForClusterMembership,  // only one cluster per token
        hoveringLinkable: hoveringLinkable,
        linkedTogetherHovering: linkedTogetherHovering,  // indicates that a token is part of the currently hovering cluster
        isAlgoLemma: algo_lemma
    }]"
          :style="applyPosStyle ? posStyle: ''"
          @mouseover="onMouseover"
          @mouseleave="onMouseleave"
          @click.exact="onClick"
          @click.shift="onShiftClick"
          @click.ctrl="onCtrlClick">
            <span class="annotator-token-inner"
                  :class="['token-inner-default', {
                    hasClusterHighlighted: hasCluster,  // indicates that a token has been assigned to a cluster
                    assignedToSelectedTokenCluster: assignedToSelectedTokenCluster,  // is part of the currently selected cluster
                    currentlyHoveringCluster: currentlyHoveringCluster // indicates membership of 'currently hovering' cluster
            }]">
                {{this.name}}
            </span>
    </span>
</template>

<script>

    import {mapGetters} from "vuex";
    import {NOUN_COLOR, VERB_COLOR, ADJECTIVE_COLOR} from "@/components/annotator/resources/color";

    export default {
        name: "Token",
        data(){
            return {
            }
        },
        computed: {
            ...mapGetters(["isLinking",
                "selectedClusterRelationship",
                "selectedTokenCluster",
                "hoveringTokenCluster",
                "hoveringToken",  // used only to prevent token assignment to multiple clusters
                "hoveringClusterRelationship",
                "requiredAnnotationsPresent"]),

            hoveringLinkable(){
                return this.isLinking && !this.notEligibleForLink && this.isHovering
            },

            hoveringClusterIsNonTrivial(){
                return this.hoveringTokenCluster !== null && this.hoveringTokenCluster.tokens.length > 1;
            },

            currentlyHoveringCluster(){
                return this.isHovering && this.hoveringClusterIsNonTrivial &&!this.hoveringLinkable;
            },

            notEligibleForLink(){
                return this.isLinking && (!this.hasCluster || this.assignedToSelectedClusterRelationship);
            },

            /*
            notEligibleForClusterMembership(){
                return !this.isLinking && this.hasCluster && this.isHovering && this.selectedTokenCluster != null && !this.assignedToSelectedTokenCluster;
            },*/

            assignedToSelectedTokenCluster(){
                return this.selectedTokenCluster && this.token_cluster === this.selectedTokenCluster.index;
            },

            assignedToSelectedClusterRelationship(){
                return this.selectedClusterRelationship && this.hasCluster && this.selectedClusterRelationship.token_clusters.includes(this.token_cluster)
            },

            applyPosStyle(){
                return this.show_pos && !this.isLinking && (!this.isHovering || !this.currentlyHoveringCluster)
            },

            hasCluster(){
                return this.token_cluster !== null;
            },
            linkedTogetherHovering(){
                return !this.isLinking && this.hoveringClusterRelationship!==null
                    && this.hasCluster && this.hoveringClusterRelationship.token_clusters.includes(this.token_cluster)
            },
            isHovering(){
                return this.hoveringTokenCluster !== null && this.hoveringTokenCluster.tokens.includes(this.index)
            },

            posStyle(){
                let border_color = "border-color: ";
                switch (this.pos) {
                    case "V":
                        return border_color+VERB_COLOR;
                    case "N":
                        return border_color+NOUN_COLOR;
                    case "ADJ":
                        return border_color+ADJECTIVE_COLOR;
                }
                return "";
            },

            posClass(){
                switch (this.pos) {
                    case "V":
                        return "verb-token";
                    case "N":
                        return "noun-token";
                    case "ADJ":
                        return "adjective-token";
                }
                return "";
            }
        },
        methods: {
            onMouseover(){
                this.$emit('annotator-token-mouseover', this)
            },
            onMouseleave(){
                this.$emit('annotator-token-mouseleave', this)
            },
            onClick(){
                if(this.requiredAnnotationsPresent) {
                    this.$emit('annotator-token-click', this);
                }
            },

            onShiftClick(){
                if(!this.isLinking){
                    if(this.requiredAnnotationsPresent) {
                        this.$emit('annotator-token-click-shift', this);
                    }
                }
            },

            onCtrlClick(){
                if(!this.isLinking){
                    if(this.requiredAnnotationsPresent) {
                        this.$emit('annotator-token-click-ctrl', this);
                    }
                }
            }

        },
        props: {
            name: {
                type: String,
                required: true
            },
            lemma: String,
            pos: String,
            show_pos : {
                type: Boolean,
                required: false,
                default: false
            },
            tore: String,
            index: {
                type: Number,
                required: true
            },
            token_cluster: {
                type: Number
            },
            algo_lemma: {
                type: Boolean,
                default: false
            }
        }
    }
</script>

<style scoped>

    .annotator-token-outer {
        color: black;
        font-size: 20px;
        border-radius: 2px;
    }

    .token-inner-default, .token-outer-default{
        border: 2px solid transparent;
    }

    .noun-token, .verb-token, .adjective-token{
        border: 2px solid;
    }

    .whitespace {
        margin-right: 0.7em;
    }

    .currentlyHoveringCluster {
        border: black solid 2px;
    }

    .hasClusterHighlighted{
        background-color: #dbdb30;
    }

    .assignedToSelectedTokenCluster{
        background-color: #BC3823;
    }

    .notEligibleForLink, .notEligibleForClusterMembership {
        border: 2px solid transparent;
        opacity: 0.5;
    }

    .hoveringLinkable {
        border: #0066ff solid 2px;
    }

    .linkedTogetherHovering{
        border: red solid 2px;
    }

    .isAlgoLemma {
        background-color: lightgreen;
    }

</style>