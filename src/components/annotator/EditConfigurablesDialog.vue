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
                Annotation Settings
            </v-card-title>
            <v-card>
                <v-container>
                <v-layout>
                    <v-select
                            label="Delete a Category Type"
                            v-model="deleteAnnotationToreModel"
                            :items="annotation_tores"
                            :loading="awaitingCallback"
                    >
                    </v-select>

                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!deleteAnnotationToreModel"
                                    v-on="on"
                                    @click="deleteSelectedAnnotationTore" class="annotator-input__trash"
                                    color="red">
                                delete_outline
                            </v-icon>
                        </template>
                        <span
                        >Delete This Category</span>
                    </v-tooltip>

                    <v-text-field
                            v-model="addNewAnnotationToreValue"
                            label="Add a new Category Type"
                            :loading="awaitingCallback"
                    >
                    </v-text-field>
                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!addNewAnnotationToreValue"
                                    v-on="on"
                                    color="blue"
                                    @click="addNewAnnotationTore">
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
                            label="Rename Category" 
                            v-model="oldCategoryName"
                            :items="$store.state.annotation_tores">
                        </v-select>
                        
                        <v-text-field 
                            :disabled="!oldCategoryName" 
                            v-model="newCategoryName" 
                            label="Enter new Name">
                        </v-text-field>

                        <v-tooltip bottom>
                            <template #activator="{ on }">
                                <v-icon 
                                        :disabled="!newCategoryName" 
                                        v-on="on" 
                                        @click="renameSelectedCategory"
                                        color="green">
                                    mode_edit_outline
                                </v-icon>
                            </template>
                            <span>Rename selected Category</span>
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
                            :items="relationshipItems"
                            :loading="awaitingCallback"
                            return-object
                            item-text="name"
                            :style="`width: min-content;
                                    min-width: 230px`"
                    >
                    </v-select>
                        <v-text-field
                        :readonly="true"
                        label="Relationship Owner"
                        :value="deleteRelationshipModel===null?null:deleteRelationshipModel.owner">
                        </v-text-field>
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
                            v-model="addNewRelationshipName"
                            label="Add a new Relationship"
                            :loading="awaitingCallback"
                    >
                    </v-text-field>

                    <v-select
                            v-model="addNewRelationshipOwner"
                            label="Relationship owner (optional)"
                            :loading="awaitingCallback"
                            :items="tores"
                            clearable
                    >
                    </v-select>
                    <v-tooltip
                            bottom>
                        <template #activator="{on}">
                            <v-icon
                                    :disabled="!addNewRelationshipName"
                                    v-on="on"
                                    color="blue"
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

            <v-card>
                <v-container>
                    <v-layout>
                        <label>
                            <input type="checkbox" v-model=isChecked @change="showRecommendationTore(isChecked)"> Show Recommendation
                        </label>
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
                isChecked: false,
                snackbarVisible: false,
                snackbarText: "",

                deleteRelationshipModel: null,
                deleteToreModel: null,
                deleteAnnotationToreModel: null,

                addNewRelationshipName: null,
                addNewRelationshipOwner: null,
                addNewToreValue: null,
                addNewAnnotationToreValue: null,

                newCategoryName: null,
                oldCategoryName: null,

                awaitingCallback: false

            }
        },
        computed: {
            relationshipItems(){
                let items = []
                for(let i = 0; i < this.relationship_names.length; i++){
                    items.push({name: this.relationship_names[i], owner: this.relationship_owners[i]})
                }
                return items;
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
            annotation_tores: {
                type: Array,
                required: true
            },
            relationship_owners: {
                type: Array,
                required: true
            },
            show: {
                type: Boolean,
                required: true
            }
        },
        methods: {
            showRecommendationTore() {
                this.$store.commit("setShowRecommendationTore", this.isChecked);
            },

            deleteSelectedAnnotationTore(){
                this.awaitingCallback = true;
                let i = this.$store.state.annotation_tores.indexOf(this.deleteAnnotationToreModel);
                //let newTores = [...this.annotation_tores]
                //let i = newTores.indexOf(this.deleteAnnotationToreModel);
                if(i===-1){
                    console.error("Couldn't find selected delete tore value: "+this.deleteAnnotationToreModel+" in annotation_tores: "+this.annotation_tores);
                    this.snackbarText = "Failed to update categories";
                    this.snackbarVisible = true;
                } else {
                    this.$store.state.annotation_tores.splice(i, 1);
                    //newTores.splice(i, 1);
                    try {
                        this.snackbarText = "Deleted Category: "+this.deleteAnnotationToreModel;
                    } catch {
                        this.snackbarText = "Failed to update categories";
                    } finally {
                        this.deleteAnnotationToreModel = null;
                        this.snackbarVisible = true;
                        this.awaitingCallback = false;
                    }
                }
            },

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
                let newOwners = [...this.relationship_owners]
                let i = newRelationships.indexOf(this.deleteRelationshipModel.name)
                if(i===-1){
                    console.error("Couldn't find selected delete relationship value: "+this.deleteRelationshipModel.name+" in relationship_names: "+this.relationship_names)
                    this.snackbarText = "Failed to update relationships"
                    this.snackbarVisible = true;
                } else {
                    newRelationships.splice(i, 1);
                    newOwners.splice(i, 1);
                    this.$store.dispatch("actionPostAllRelationships", {newRelationships, newOwners}).then(() => {
                        this.snackbarText = "Deleted Relationship: " + this.deleteRelationshipModel.name + (this.deleteRelationshipModel.owner?" with owner: "+this.deleteRelationshipModel.owner:"")
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
                let newOwners = [...this.relationship_owners]
                newRelationships.push(this.addNewRelationshipName)
                newOwners.push(!this.addNewRelationshipOwner?"":this.addNewRelationshipOwner)
                this.$store.dispatch("actionPostAllRelationships", {newRelationships, newOwners})
                    .then(() => {
                    this.snackbarText = "Added Relationship: " + this.addNewRelationshipName+(this.addNewRelationshipOwner?" with owner: "+this.addNewRelationshipOwner:"")
                }).catch(() => {
                    this.snackbarText = "Failed to update relationships"
                }).finally(() => {
                    this.addNewRelationshipName = null;
                    this.addNewRelationshipOwner = null;
                    this.snackbarVisible = true
                    this.awaitingCallback = false;
                });
            },

            addNewAnnotationTore(){
                this.awaitingCallback = true;
                this.$store.state.annotation_tores.push(this.addNewAnnotationToreValue);
                try {
                this.snackbarText = "Added Category: " + this.addNewAnnotationToreValue;
                } catch {
                this.snackbarText = "Failed to update Categories";
                }
                finally {
                this.addNewAnnotationToreValue = null;
                this.snackbarVisible = true;
                this.awaitingCallback = false;
                }
            },
            
            addNewTore(){
                this.awaitingCallback = true;
                let newTores = [...this.tores]
                newTores.push(this.addNewToreValue)

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

            },
            renameSelectedCategory() {
                let index = this.$store.state.annotation_tores.indexOf(this.oldCategoryName);
                this.$store.state.annotation_tores.push(this.newCategoryName);
                this.$store.state.annotation_tores.splice(index, 1);
                try {
                    this.snackbarText = "Category: " + this.oldCategoryName + " renamed to " + this.newCategoryName;
                }
                catch {
                    this.snackbarText = "Failed to rename Category";
                }
                finally {
                    this.newCategoryName = null;
                    this.snackbarVisible = true;
                    this.oldCategoryName = null;
                }

            }
        }
    }
</script>

<style scoped>

</style>