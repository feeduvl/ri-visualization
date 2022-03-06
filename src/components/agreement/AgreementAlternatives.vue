<template>
    <v-dialog
        :hide-overlay="true"
        v-model="wrapInputVisible"
        v-if="wrapInputVisible"
        id="agreement-alternatives-dialog"
        class="agreement-alternatives-dialog"
        :scrollable="true"
        :max-width="1300"
    >
        <v-card v-if="!createNewClicked" key="input">
            <v-layout row justify-left align-center>
                <v-flex>
                    <v-btn
                        @click="goToInputPanel">
                        Create new
                    </v-btn>
                </v-flex>
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
            </v-layout>
            <v-data-table
                :headers="headers"
                :items="alternativesForToken"
                disable-pagination
                class="elevation-1"
                :hide-default-footer="true"
                :hide-actions="true"
            >
                <template v-slot:items="props">
                    <tr v-bind:class="props.item.merge_status">
                        <td :key="'header_column_0_0'"
                            :class="{'text-xs-left': 0 > 0}"
                        >{{ props.item.code.name }}</td>
                        <td :key="'header_column_0_1'"
                            :class="{'text-xs-left': 1 > 0}"
                        >{{ props.item.code.tore }}</td>
                        <td :key="'header_column_0_2'"
                            :class="{'text-xs-left': 2 > 0}"
                        >
                            <ul style="list-style-type: none">
                                <li v-for="relationship in props.item.code.relationship_memberships">
                                    {{ getRelationshipString(relationship) }}
                                </li>
                            </ul>
                        </td>
                        <td :key="'header_column_0_3'"
                            :class="{'text-xs-left': 3 > 0}"
                        >{{ props.item.annotation_name }}</td>
                        <td :key="'header_column_0_4'"
                            :class="{'text-xs-left': 4 > 0}"
                        >
                            <ul style="list-style-type: none">
                                <li v-for="alternativeToken in props.item.code.tokens.filter(value => value !== token.index)">
                                    {{ getTokenString(alternativeToken) }}
                                </li>
                            </ul>
                        </td>
                        <td>
                            <span class="icon-column"
                                  v-if="props.item.merge_status ==='Pending'">
                                <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      @click="acceptCode(props.item)"
                                      v-bind="attrs"
                                      v-on="on"
                                  >
                                    check
                                  </v-icon>
                                </template>
                                <span>Accept</span>
                              </v-tooltip>
                                <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      @click="rejectCode(props.item)"
                                      v-bind="attrs"
                                      v-on="on"
                                  >
                                    close
                                  </v-icon>
                                </template>
                                <span>Reject</span>
                              </v-tooltip>
                            </span>
                        </td>
                    </tr>

                </template>

            </v-data-table>

        </v-card>
        <v-card v-else-if="createNewClicked" key="creation">

            <v-layout row justify-left align-center>
                <v-flex>
                    <v-btn
                        @click="goBackToList">
                        Cancel
                    </v-btn>
                </v-flex>
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
            </v-layout>

            <div class="agreement-input__input-fields">
                <template v-if="!isLinking"
                          class="agreement-input-no-link">
                    <v-combobox
                        required
                        :class="['agreement-input__name']"
                        label="Name"
                        :items="codeNames"
                        v-model="newWordCode"
                        :rules="[requiredAgreementsPresent || 'Either a name or a category is required']"
                        ref="nameInput"
                        autofocus
                        id="agreement-input__name"
                    ></v-combobox>

                    <v-autocomplete
                        class="agreement-input__tore"
                        @change="updateTore"
                        :rules="[requiredAgreementsPresent || 'Either a name or a category is required']"
                        :items="tores"
                        :value="newCategory"
                        label="Category">
                    </v-autocomplete>

                    <v-tooltip bottom>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    :disabled="!newCategory || (newCategory === '') || allowedRelationshipNames.length === 0"
                                    @click="startLinking">
                                link
                            </v-icon>
                        </template>
                        <span>New Relationship</span>
                    </v-tooltip>

<!--                    <v-tooltip bottom>-->
<!--                        <template #activator="{on}">-->
<!--                            <v-icon v-on="on"-->
<!--                                    @click="addOtherTokens">-->
<!--                                add-->
<!--                            </v-icon>-->
<!--                        </template>-->
<!--                        <span>Add other Tokens</span>-->
<!--                    </v-tooltip>-->
                </template>
                <template v-else
                          class="agreement-input-link">
                    <v-tooltip bottom>
                        <template #activator="{on}"
                                  v-if="new_tore_relationship">
                            <v-icon v-on="on"
                                    @click="stopLinking">
                                done
                            </v-icon>
                        </template>
                        <span v-if="new_tore_relationship">Finish Linking</span>
                        <template #activator="{on}">
                            <v-icon v-on="on"
                                    @click="stopLinking">
                                close
                            </v-icon>
                        </template>
                        <span v-else>Stop Linking</span>
                    </v-tooltip>

                    <v-autocomplete  class="agreement-input__relationship-name"
                                     @change="updateRelationshipName"
                                     :items="allowedRelationshipNames"
                                     :value="relationshipName"
                                     :disabled="!new_tore_relationship"
                                     :label="new_tore_relationship?'Relationship Name':'Select a target token'">
                    </v-autocomplete>
                </template>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            small
                            @click="createCode"
                            v-bind="attrs"
                            v-on="on"
                        >
                            add
                        </v-icon>
                    </template>
                    <span>Add and Accept</span>
                </v-tooltip>
            </div>

            <div class="agreement-input__relationships" v-if="!isLinking && $store.state.newToreRelationships.length > 0">
                <v-list class="agreement-input__relationships-list">
                    <v-subheader>Edit a relationship</v-subheader>
                    <v-list-tile
                        @click="setNewToreRelationship(item)"
                        v-for="(item, i) in newToreRelationships"
                        :key="'relationships_'+i">
                        {{(item.relationship_name?item.relationship_name:'[TORE Relationship]') +' -> '+tokenListToString(item.target_tokens)}}
                    </v-list-tile>
                </v-list>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>

import {mapGetters, mapState} from "vuex";

export default {
    name: "AgreementAlternatives",
    props: {
        token: {
            type: Object
        },
        panelIsUp: {
            type: Boolean
        },
    },
    data: () => {
        return {
            createNewClicked: false,

            newWordCode: "",
            newCategory: "",
            newRelationships: [],
            newConnectedTokens: [],
            newRelationshipTargetToken: "",
            newRelationshipName: "",

            visible: true,
            headers: [
                {
                    text: 'Word Code',
                    align: "left",
                    width: "30%",
                    sortable: false

                },
                {
                    text: 'Category',
                    align: "left",
                    width: "25%",
                    sortable: false
                },
                {
                    text: 'Relationships',
                    align: "left",
                    width: "25%",
                    sortable: false
                },
                {
                    text: 'Annotation Name',
                    align: "left",
                    width: "10%",
                    sortable: false
                },
                {
                    text: 'Linked tokens',
                    align: "left",
                    width: "8%",
                    sortable: false
                },
                {
                    text: '',
                    align: "right",
                    width: "9%",
                    sortable: false
                },
            ]
        }
    },
    computed: {
        relationshipName(){
            let r = this.$store.state.newToreRelationship
            return r ? r.relationship_name : ""
        },
        allowedRelationshipNames(){
            return this.$store.state.relationship_names.filter((name, index) => {
                return !this.$store.state.relationship_owners[index] || this.$store.state.relationship_owners[index] === this.tore;
            } )
        },

        codeNames() {
          let wordCodes = []
            this.alternativesForToken.forEach(function (value) {
                if (value.code.name !== "" && !wordCodes.find(value1 => value.code.name === value1)) {
                    wordCodes.push(value.code.name)
                }
            })
            return wordCodes
        },

        requiredAgreementsPresent() {
            return (this.newWordCode !== null && this.newWordCode !== "") || (this.newCategory !== null && this.newCategory !== "")
        },

        wrapInputVisible: {
            get(){
                return this.agreementInputVisible;
            },

            set(bool){
                this.$store.commit("setAgreementInputVisible", bool);  // should always be false
            }
        },

        alternativesForToken() {
            return this.getAllAlternativesOfToken()
        },

        ...mapGetters([
            "tokenListToString",
            "isLinking",
            "new_tore_relationship"
        ]),
        ...mapState([
            "agreement_code_alternatives",
            "agreementInputVisible",
            "agreement_tore_relationships",
            "tores",
            "maxIndexCodeAlternatives",
            "maxIndexCodes",
            "relationship_names",
            "newToreRelationships"
        ]),
    },
    methods: {

        setNewToreRelationship(relationship){
            console.log("Set new tore relationship frontend");
            console.log("relationship: " + relationship);
            this.startLinking()
            this.$store.commit("setNewToreRelationship", relationship)
        },
        updateRelationshipName(value){
            if(this.$store.state.newToreRelationship){
                this.$store.commit("setNewRelationshipName", value);
                this.$store.commit("updateLastAgreementEditAt")
            }
        },

        startLinking(){
            this.$store.commit("setIsLinking", true);
        },
        stopLinking(){
            this.$store.commit("setIsLinking", false);
        },

        updateTore(value) {
            this.newCategory = value
        },

        createCode() {
            let newCode = {
                tokens: [this.token.index],
                name: this.newWordCode,
                tore: this.newCategory,
                index: this.maxIndexCodes + 1,
                relationship_memberships: []
            }
            let newCodeAlternative = {
                annotation_name: "",
                merge_status: "Accepted",
                index: this.maxIndexCodeAlternatives + 1,
                code: newCode
            }
            this.$store.commit("incrementMaxCodeIndices")
            this.$store.commit("addNewCodeAlternative", newCodeAlternative)
            this.createNewClicked = false
        },
        goToInputPanel() {
            this.createNewClicked = true
        },
        goBackToList() {
            this.createNewClicked = false
            this.newWordCode = ""
            this.newCategory = ""
            this.newRelationships = []
            this.newConnectedTokens = []
            this.newRelationshipTargetToken = ""
            this.newRelationshipName = ""
            // this.$store.commit("setIsLinking", false);
            this.newToreRelationships = []
            this.new_tore_relationship = null
        },
        getRelationshipString(relRef) {
            let toreRelationships = this.agreement_tore_relationships
            for (let toreRel of toreRelationships) {
                if (toreRel.index === relRef) {
                    let targetTokenString = []
                    for (let targetToken of toreRel.target_tokens) {
                        targetTokenString.push(targetToken)
                    }
                    return toreRel.relationship_name + "->" + this.tokenListToString(targetTokenString)
                }
            }
        },

        getTokenString(token) {
            return this.tokenListToString([token])
        },

        myCustomSort() {
            return function(a, b) {
                if (a.merge_status === "Pending") {
                    return false
                } else {
                    if (b.merge_status === "Pending") {
                        return true
                    } else {
                        if (a.merge_status === "Accepted") {
                            return false
                        } else {
                            return b.merge_status === "Accepted";
                        }
                    }
                }
            }
        },

        getAllAlternativesOfToken() {
            console.log("Getting all alternatives for token " + this.token.index);
            let tokenIndex = this.token.index
            let alternatives = [];
            this.agreement_code_alternatives.forEach(function (item1){
                let alternativeCode = item1.code;
                if (alternativeCode.tokens.includes(tokenIndex)){
                    alternatives.push(item1);
                }
            });
            console.log("alternatives for token: " + alternatives)
            return alternatives.sort(this.myCustomSort());
        },

        directionCueString(){
            return this.panelIsUp?"down":"up";
        },

        arrowIconClicked(){
            this.$emit("agreement-input__arrow-icon-click");
        },

        acceptCode(alternative) {
            this.$store.commit('changeStatusOfCodeAlternative', {
                status: "Accepted",
                index: alternative.index
            })
            this.$store.commit("updateResolvedStatusOfTokens", {
                tokens: alternative.code.tokens,
                codeIndex: alternative.index
            })
            this.$emit('resolvedStatusOfTokensUpdated')
        },

        rejectCode(alternative) {
            this.$store.commit('changeStatusOfCodeAlternative', {
                status: "Declined",
                index: alternative.index
            })
            this.$store.commit("updateResolvedStatusOfTokens", {
                tokens: alternative.code.tokens,
                codeIndex: alternative.index
            })
            this.$emit('resolvedStatusOfTokensUpdated')
        },
    },
}
</script>

<style>

.Accepted{
    border-left: 20px solid rgb(160, 231, 144);

}

.Declined{
    border-left: 20px solid rgb(231, 144, 157);
}

.Pending{
    border-left: 20px solid white;
}

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