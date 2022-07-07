<template>
    <v-card>
        <v-container>
            <v-data-table
                :headers="headers"
                :items="codes"
                :items-per-page="10"
                class="elevation-1"
            ></v-data-table>
      </v-container>
    </v-card>
</template>

<script>
export default {
    name: "ClassifierTOREResult",
    data: () => ({
        headers: [
            {
                text: 'Token',
                align: 'start',
                sortable: true,
                value: 'token',
            },
            {
                text: 'Code',
                align: 'start',
                sortable: true,
                value: 'code',
            },        
        ],
        codes: [
            {
            token: 'Chrome',
            code: 'Software',
            },
            {
            token: 'open',
            code: 'Interaction',
            },
            {
            token: 'Window',
            code: 'Workspace',
            },
        ],
    }),

}
</script>

<style scoped>

</style>