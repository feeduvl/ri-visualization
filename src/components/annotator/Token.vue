<template functional>
    <span   :id="'token_'+props.index"
            class="annotator-token-outer" :class="[props.show_pos && !props.isLinking ? props.posClass:'token-outer-default', 'whitespace',
    {
        linkedTogether: props.linkedTogether,
        isAlgoLemma: props.algo_lemma
    }]"

          @click.exact="listeners['annotator-token-click'](props.index)"
          @click.shift="listeners['annotator-token-click-shift'](props.index)"
          @click.ctrl="listeners['annotator-token-click-ctrl'](props.index)">
            <span class="annotator-token-inner"
                  :class="['token-inner-default', {
                    hasOnlyName: props.hasName && !props.hasTore,  // indicates that a token has been assigned to a code
                    hasOnlyTore: !props.hasName && props.hasTore,
                    hasBoth: props.hasName && props.hasTore
                  }]">
                {{props.name}}
            </span>
    </span>
</template>

<script>
    /*
    @mouseover="listeners['annotator-token-mouseover'](props.index)"  FIXME comment this out to activate hover
    @mouseleave="listeners['annotator-token-mouseleave'](props.index)"
    */

    import {mapGetters} from "vuex";
    import {NOUN_COLOR, VERB_COLOR, ADJECTIVE_COLOR} from "@/components/annotator/resources/color";

    export default {
        name: "Token",
        functional:true,
        /*
        computed: {

            ...mapGetters(["isLinking",
                "selected_tore_relationship",
                "selected_code",
                "hovering_codes",
                "hoveringToken",  // used only to prevent token assignment to multiple codes
                ]),

            hoveringLinkable(){
                return this.isLinking && this.isHoveringToken
            },


            isHoveringToken(){
                console.log("isHoveringToken: "+this.name)
                return this.hoveringToken && this.index === this.hoveringToken.index;
            },*/

            /*
            linkedTogether(){
                let ret = this.isLinking && this.$store.state.token_linked_together[this.index];
                console.log("linkedTogether computed: "+ret)
                return ret
            },

            applyPosStyle(){
                console.log("applyPosStyle")
                return this.show_pos && !this.isLinking
            },*/

            /*
            hasCode(){
                console.log("hasCode")
                return this.$store.state.tokens[this.index].num_codes > 0;  // need to do it like this because this is the only attribute of token that can change
            },*/

            /*
            inSelectedCode(){
                console.log("inSelectedCode: "+this.name)
                //return this.hasCode && this.selected_code.tokens.includes(this.index)
                return this.$store.state.token_in_selected_code[this.index]
            },*/

            /*
            isHoveringCode(){
                console.log("isHoveringCode")
                if(!this.hasCode || this.hovering_codes.length === 0){
                    return false
                } else {
                    for(let code of this.hovering_codes){
                        if(code.tokens.includes(this.index)){  // more efficient that filtering because we can stop asap
                            return true;
                        }
                    }
                }
                return false;
            },*/
/*
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
                console.log("show_pos")
                return this.pos && this.$store.state.selected_pos_tags.includes(this.pos)
            },

            algo_lemma(){
                console.log("algo_lemma")
                return this.$store.state.selected_algo_result !== null && this.$store.getters.lemmasFromSelectedResult.includes(this.lemma)
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
        watch: {
            inSelectedCode(){
                console.log("inSelectedCode")
            },
            isHoveringCode(){
                console.log("isHoveringCode")
            },

            linkedTogether(){
                console.log("linkedTogether")
            },
            isHoveringToken(){
                console.log("isHoveringToken")
            }
        }*/
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
            },
            inSelectedCode: {
                type: Boolean,
                required: true
            },

            hasName: {
                type: Boolean,
                required: true
            },
            hasTore: {
                type: Boolean,
                required: true
            },

            linkedTogether: {
                type: Boolean,
                required: true
            },
            isLinking: {
                type: Boolean,
                required: true
            },
            algo_lemma: {
                type: Boolean,
                required: true
            },
            show_pos: {
                type: Boolean,
                required: true
            },
            posClass: {
                type: String,
                required: true
            },
            annotatorInputVisible: {
                type: Boolean,
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

    .noun-token {
        border-color: green;
    }

    .verb-token {
        border-color: #30D5C8;
    }

    .adjective-token {
        border-color: blue;
    }

    .whitespace {
        margin-right: 0.7em;
    }

    .hasOnlyName {
        background-color: lightblue;
    }

    .hasOnlyTore {
        background-color: #fff668;
    }

    .hasBoth {
        background-color: #66f877;
    }

    .assignedToselected_code{
        background-color: #BC3823;
    }

    .notEligibleForCodeMembership {
        border: 2px solid transparent;
        opacity: 0.5;
    }

    .linkedTogether {
        border: #0066ff solid 2px;
    }

    .isAlgoLemma {
        background-color: #FFC0CB;
    }

</style>