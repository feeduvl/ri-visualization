<template>
    <v-dialog
            :hide-overlay="true"
            :persistent="!requiredAgreementsPresent || isLinking"
            :no-click-animation="isLinking"
            v-model="wrapInputVisible"
            v-if="wrapInputVisible"
            id="agreement-input-dialog"
            :scrollable="false"
            class="agreement-input-dialog"
        >
        <v-card
                :elevation="0"
                class="agreement-input"
                :disabled="disabled"
                ref="agreement_input">

            <div class="agreement-input__input-fields">
                <template class="agreement-input-no-link">

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

<!--            <div class="agreement-input__relationships" v-if="!isLinking && $store.state.selected_code && $store.state.selected_code.relationship_memberships.length > 0">-->
<!--                <v-list class="agreement-input__relationships-list">-->
<!--                    <v-subheader>Edit a relationship</v-subheader>-->
<!--                    <v-list-tile-->
<!--                                @click="setSelectedToreRelationship(item)"-->
<!--                                v-for="(item, i) in selectedToreRelationships"-->
<!--                                :key="'relationships_'+i">-->
<!--                            {{(item.relationship_name?item.relationship_name:'[TORE Relationship]') +' -> '+tokenListToString(item.target_tokens)}}-->
<!--                    </v-list-tile>-->
<!--                </v-list>-->
<!--            </div>-->
        </v-card>
        <v-snackbar
            :timeout="4000"
            v-model="showSnackbar"
        >
            {{snackbarText}}
        </v-snackbar>
    </v-dialog>
</template>

<script>
    export default {
        name: "AgreementAlternativeSelection",
        props: {
            tokenIndex: {
                type: Number
            },
            panelIsUp: {
                type: Boolean
            },

            disabled: {
                type: Boolean,
                default: false
            },
        },

        data(){
            return {
                showSnackbar: false,
                snackbarText: "",
                promptHighlightAll: false
            }
        },
        computed: {

            wrapInputVisible: {
                get(){
                    return this.showingInput;
                },

                set(bool){
                    if(!this.requiredAgreementsPresent){  // codes need some kind of label
                        console.log("Missing required input, ignoring dialog hide")
                    } else {
                        this.$store.commit("setAgreementInputVisible", bool);  // should always be false
                    }
                }
            },

        },

        methods: {

            arrowIconClicked(){
                this.$emit("agreement-input__arrow-icon-click");
            },
        }
    }
</script>

<style>

    .agreement-input{
        display: flex;
        width: fit-content;
        flex-direction: column;
        align-items: center;
        border-radius: 20px !important;
    }

    .agreement-input__input-fields {
        display: flex;
        width: 100%;
        flex-direction: row;
    }

    .agreement-input-no-link{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 10px;
        margin: 10px;
    }

    .agreement-input__trash {
        float: left;
        margin-right: 10px;
    }

    .agreement-input__relationship-name {
        float: left;
        flex: 1 1 20em;
    }

    .agreement-input__tore {
        float: left;
        flex: 1 1 20em;
    }

    .agreement-input__relationships-list .v-list__tile{
        display: flex;
        justify-content: center;
        height: 28px;
    }

    .agreement-input__relationships-list .v-subheader {
        display: flex;
        justify-content: center;
        height: 14px;
    }
    .agreement-input__cancel{
        margin-top: 15px !important;
    }

</style>