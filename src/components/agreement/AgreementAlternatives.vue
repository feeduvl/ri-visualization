<template>
    <v-dialog
        :hide-overlay="true"
        v-model="isEnabled"
        id="agreement-alternatives-dialog"
        class="agreement-alternatives-dialog"
        :scrollable="true"
        :max-width="1000"
    >
        <v-card>
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
                :sort-icon="false"
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
                        <td :key="'header_column_0_1'"
                            :class="{'text-xs-left': 1 > 0}"
                        >{{ props.item.annotation_name }}</td>
                        <!--                        <td :key="'header_column_0_5'"-->
                        <!--                            :class="{'text-xs-left': 5 > 0}"-->
                        <!--                        >-->
                        <!--                            <ul style="list-style-type: none">-->
                        <!--                                <li v-for="relationship in props.item.relationships">-->
                        <!--                                    {{ relationship }}-->
                        <!--                                </li>-->
                        <!--                            </ul>-->
                        <!--                        </td>-->
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
    </v-dialog>
</template>

<script>

import {mapState} from "vuex";

export default {
    name: "AgreementAlternatives",
    props: {
        token: {
            type: Object
        },
        isEnabled: {
            type: Boolean,
        },
    },
    data: () => {
        return {
            visible: true,
            headers: [
                {
                    text: 'Word Code',
                    align: "left",
                    width: "40%"

                },
                {
                    text: 'Category',
                    align: "left",
                    width: "40%"
                },
                // {
                //     text: 'Category',
                //     align: "left",
                //     sortable: true,
                //     value: 'category'
                // },
                {
                    text: 'Annotation Name',
                    align: "left",
                    width: "15%"
                },
                {
                    text: '',
                    align: "right",
                    width: "5%"
                },
            ]
        }
    },
    computed: {
        alternativesForToken() {
            return this.getAllAlternativesOfToken()
        },
        ...mapState([
            "agreement_code_alternatives"
        ])
    },
    methods: {
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
            return alternatives.sort(this.myCustomSort());
        }
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

</style>