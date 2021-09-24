<template>
    <span class="annotator-token-outer" :class="[applyPosStyle ? posClass:'token-outer-default',
    {
        // whitespace after this token
        whitespace: index < $store.state.tokens.length - 1,
        hoveringLinkable: hoveringLinkable,
        linkedTogether: linkedTogether,
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
                    hasCodeHighlighted: hasCode,  // indicates that a token has been assigned to a code
                    currentlyHoveringCode: currentlyHoveringCode // indicates membership of 'currently hovering' code
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
        mounted(){
            //console.log("Token mounted: "+this.name)
        },
        computed: {

            ...mapGetters(["isLinking",
                "selected_tore_relationship",
                "selected_code",
                "hovering_codes",
                "hoveringToken",  // used only to prevent token assignment to multiple codes
                "hovering_tore_relationships"]),

            hoveringLinkable(){
                return this.isLinking && this.isHoveringToken
            },

            isHoveringToken(){
                return this.hoveringToken && this.index === this.hoveringToken.index;
            },

            currentlyHoveringCode(){
                return this.isHoveringCode;
            },

            linkedTogether(){
                return this.isLinking && this.selected_tore_relationship && this.selected_tore_relationship.target_tokens.includes(this.index)
            },

            applyPosStyle(){
                return this.show_pos && !this.isLinking && (!this.isHoveringCode || !this.currentlyHoveringCode)
            },

            hasCode(){
                return this.$store.state.tokens[this.index].num_codes > 0;
            },


            hoveringCodesList(){
                return this.hasCode ? this.hovering_codes.filter(c => c && c.tokens.includes(this.index)): [];
            },

            isHoveringCode(){
                return this.hoveringCodesList.length > 0;
            },

            posStyle(){
                let border_color = "border-color: ";
                switch (this.pos) {
                    case "v":
                        return border_color+VERB_COLOR;
                    case "n":
                        return border_color+NOUN_COLOR;
                    case "a":
                        return border_color+ADJECTIVE_COLOR;
                }
                return "";
            },

            posClass(){
                switch (this.pos) {
                    case "v":
                        return "verb-token";
                    case "n":
                        return "noun-token";
                    case "a":
                        return "adjective-token";
                }
                return "";
            },
            show_pos() {
                return this.pos && this.$store.state.selected_pos_tags.includes(this.pos)
            },

            algo_lemma(){
                return this.$store.state.selected_algo_result && this.$store.getters.lemmasFromSelectedResult.includes(this.lemma)
            }
        },
        methods: {
            toString(){
                return "Name: "+this.name+", tore: "+this.tore+", index: "+this.index+", relationship memberships: "+this.relationship_memberships;
            },
            onMouseover(){
                this.$emit('annotator-token-mouseover', this)
            },
            onMouseleave(){
                this.$emit('annotator-token-mouseleave', this)
            },
            onClick(){
                this.$emit('annotator-token-click', this);
            },

            onShiftClick(){
                this.$emit('annotator-token-click-shift', this);
            },

            onCtrlClick(){
                this.$emit('annotator-token-click-ctrl', this);
            }

        },
        props: {
            name: {
                type: String,
                required: true
            },
            lemma: String,
            pos: String,
            tore: String,
            index: {
                type: Number,
                required: true
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
        user-select: none;
        border: 2px solid transparent;
    }

    .noun-token, .verb-token, .adjective-token{
        border: 2px solid;
    }

    .whitespace {
        margin-right: 0.7em;
    }

    .currentlyHoveringCode {
        border: black solid 2px;
    }

    .hasCodeHighlighted{
        background-color: #dbdb30;
    }

    .assignedToselected_code{
        background-color: #BC3823;
    }

    .notEligibleForCodeMembership {
        border: 2px solid transparent;
        opacity: 0.5;
    }

    .hoveringLinkable, .linkedTogether {
        border: #0066ff solid 2px;
    }

    .linkedTogetherHovering{
        border: red solid 2px;
    }

    .isAlgoLemma {
        background-color: lightgreen;
    }

</style>