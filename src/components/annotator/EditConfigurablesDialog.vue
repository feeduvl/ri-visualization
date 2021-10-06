<template>
    <v-dialog
            :persistent="true"
            v-model="show"
            v-if="show">
        <v-snackbar
        v-model="snackbarVisible"
        :timeout="4000"
        >
            {{snackbarText}}
        </v-snackbar>
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">
                Edit Categories and Relationships
            </v-card-title>
            <v-card>
                <v-container>
                <v-layout>
                    <v-select
                            label="Delete a Category Type"
                            v-model="deleteToreModel"
                            :items="tores"
                            :loading="awaitingCallback"
                    >
                    </v-select>

                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!deleteToreModel"
                                    v-on="on"
                                    @click="deleteSelectedTore" class="annotator-input__trash"
                                    color="red">
                                delete_outline
                            </v-icon>
                        </template>
                        <span
                        >Delete This Category</span>
                    </v-tooltip>

                    <v-text-field
                            v-model="addNewToreValue"
                            label="Add a new Category Type"
                            :loading="awaitingCallback"
                    >
                    </v-text-field>
                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!addNewToreValue"
                                    v-on="on"
                                    @click="addNewTore">
                                add
                            </v-icon>
                        </template>
                        <span
                        >Add this Category</span>
                    </v-tooltip>

                </v-layout>
            </v-container>
            </v-card>

            <v-card>
                <v-container>
                    <v-layout>
                    <v-select
                            label="Delete a Relationship Type"
                            v-model="deleteRelationshipModel"
                            :items="relationship_names"
                            :loading="awaitingCallback"
                    >
                    </v-select>
                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!deleteRelationshipModel"
                                    v-on="on"
                                    @click="deleteSelectedRelationship" class="annotator-input__trash"
                                    color="red">
                                delete_outline
                            </v-icon>
                        </template>
                        <span
                        >Delete This Relationship</span>
                    </v-tooltip>
                    <v-text-field
                            v-model="addNewRelationshipValue"
                            label="Add a new Relationship"
                            :loading="awaitingCallback"
                    >
                    </v-text-field>
                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!addNewRelationshipValue"
                                    v-on="on"
                                    @click="addNewRelationship">
                                add
                            </v-icon>
                        </template>
                        <span
                        >Add this Relationship</span>
                    </v-tooltip>

                    </v-layout>
                </v-container>
            </v-card>

            <v-card-actions>
                <v-btn
                        @click="$emit('hide-edit-configurables')"
                >
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "EditConfigurablesDialog",
        data(){
            return {
                snackbarVisible: false,
                snackbarText: "",

                deleteRelationshipModel: null,
                deleteToreModel: null,

                addNewRelationshipValue: null,
                addNewToreValue: null,

                awaitingCallback: false

            }
        },
        props: {
            relationship_names: {
                type: Array,
                required: true
            },
            tores: {
                type: Array,
                required: true
            },
            show: {
                type: Boolean,
                required: true
            }
        },
        methods: {
            deleteSelectedTore(){
                this.awaitingCallback = true;
                let newTores = [...this.tores]
                let i = newTores.indexOf(this.deleteToreModel)
                if(i===-1){
                    console.error("Couldn't find selected delete tore value: "+this.deleteToreModel+" in tores: "+this.tores)
                    this.snackbarText = "Failed to update categories"
                    this.snackbarVisible = true;
                } else {
                    newTores.splice(i, 1);
                    this.$store.dispatch("actionPostAllTores", newTores).then(() => {
                        this.snackbarText = "Deleted Category: "+this.deleteToreModel
                    }).catch(() => {
                        this.snackbarText = "Failed to update categories"
                    }).finally(() => {
                        this.deleteToreModel = null;
                        this.snackbarVisible = true
                        this.awaitingCallback = false;
                    });
                }
            },

            deleteSelectedRelationship(){
                this.awaitingCallback = true;
                let newRelationships = [...this.relationship_names]
                let i = newRelationships.indexOf(this.deleteRelationshipModel)
                if(i===-1){
                    console.error("Couldn't find selected delete relationship value: "+this.deleteRelationshipModel+" in relationship_names: "+this.relationship_names)
                    this.snackbarText = "Failed to update relationships"
                    this.snackbarVisible = true;
                } else {
                    newRelationships.splice(i, 1);
                    this.$store.dispatch("actionPostAllRelationships", newRelationships).then(() => {
                        this.snackbarText = "Deleted Relationship: " + this.deleteRelationshipModel
                    }).catch(() => {
                        this.snackbarText = "Failed to update relationships"
                    }).finally(() => {
                        this.deleteRelationshipModel = null;
                        this.snackbarVisible = true
                        this.awaitingCallback = false;
                    });
                }
            },

            addNewRelationship(){
                this.awaitingCallback = true;
                let newRelationships = [...this.relationship_names]
                newRelationships.push(this.addNewRelationshipValue)
                newRelationships.sort();

                this.$store.dispatch("actionPostAllRelationships", newRelationships)
                    .then(() => {
                    this.snackbarText = "Added Relationship: " + this.addNewRelationshipValue
                }).catch(() => {
                    this.snackbarText = "Failed to update relationships"
                }).finally(() => {
                    this.addNewRelationshipValue = null;
                    this.snackbarVisible = true
                    this.awaitingCallback = false;
                });

            },

            addNewTore(){
                this.awaitingCallback = true;
                let newTores = [...this.tores]
                newTores.push(this.addNewToreValue)
                newTores.sort();

                this.$store.dispatch("actionPostAllTores", newTores)
                    .then(() => {
                    this.snackbarText = "Added Category: " + this.addNewToreValue
                     }).catch(() => {
                        this.snackbarText = "Failed to update Categories"
                    }).finally(() => {
                    this.addNewToreValue = null;
                    this.snackbarVisible = true
                    this.awaitingCallback = false;
                });

            }
        }
    }
</script>

<style scoped>

</style>