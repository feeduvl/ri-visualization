<template>
    <v-container>
        <v-card class="userStoryCard" v-for="result in results.topics.completeness_results" v-bind:key="result.id">
            <v-row>
                <span>{{ result.id }}</span>
            </v-row>
            <v-row class="usAnnotationRow">
                <v-card class="singleWord" v-for="annotation in result.mapping" v-bind:key="annotation.text">
                    <v-tooltip bottom content-class="ac-completeness-tooltip">
                        <template v-slot:activator="{ on, attrs }">
                            <span v-bind:class='annotation.annotation' v-bind="attrs" v-on="on">
                                {{ annotation.text }} {{ " " }}
                            </span>
                        </template>
                        <p>Annotation: <b>{{ annotation.annotation }}</b> </p>
                        <p>Token: <b>{{ annotation.token }}</b> </p>
                        <p v-if="annotation.mapping">Acceptance Criteria Concept: <b>{{ annotation.mapping }}</b></p>
                    </v-tooltip>
                </v-card>
            </v-row>
            <v-divider class="usAcDivider">
            </v-divider>
            <v-row class="acceptance-criteria usAnnotationRow">
                <v-card class="singleWord" v-for="annotation in result.acMapping" v-bind:key="annotation.text">
                    <v-tooltip bottom content-class="ac-completeness-tooltip">
                        <template v-slot:activator="{ on, attrs }">
                            <span v-bind:class='annotation.annotation' v-bind="attrs" v-on="on">
                                {{ annotation.text }} {{ " " }}
                            </span>
                        </template>
                        <p>Annotation: <b>{{ annotation.annotation }}</b> </p>
                        <p v-if="annotation.mapping">Acceptance Criteria Concept: <b>{{ annotation.mapping }}</b></p>
                    </v-tooltip>
                </v-card>
            </v-row>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: 'AnnotationResultACCompleteness',

    props: {
        results: Object,
    },

}
</script>

<style>
.complete {
    background-color: #1E88E5;
    border-radius: 5px;
}

.non-complete {
    background-color: #D81B60;
    border-radius: 5px;
}

.singleWord {
    margin: 5px;
}

.userStoryCard {
    margin: 15px;
    padding: 15px;
}

.usAcDivider {
    margin: 15px;
}

.ac-completeness-tooltip {
    opacity: 1 !important;
}

.acceptance-criteria {
    margin-left: 10px;
}

.usAnnotationRow {
    display: flex;
    flex-wrap: wrap;
}
</style>
