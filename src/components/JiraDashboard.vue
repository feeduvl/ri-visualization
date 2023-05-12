<template>
    <div class="container">
        <v-toolbar class="banner">
            Jira Dashboard
        </v-toolbar>
        <div class="row">
            <p style="color: dodgerblue; font-size: 18px; margin-left: 15px" >Select already used projects or search for new:</p>
            <div class="project-import" >
                <v-select
                    class="select-issueTypes"
                    v-model="projectName"
                    :items="projectNames"
                    label="Select project"
                    item-text="name"
                    style="width: 25%; margin-left: 20px"

                ></v-select>
                <v-text-field v-model="projectName" append-icon="mdi-magnify" label="type project name ..." style="margin-left: 55px; width: 35%"></v-text-field>
                <v-btn dark color="blue" @click="getIssueTypesByProjectName()" style="margin-left: 50px"> SEARCH </v-btn>
                <p v-if="!isProjectSelected" style="color: red">No project selected. Please select a project</p>
            </div>
        </div>
        <v-dialog v-model="dialogIssueTypes" width="70%" >
            <div class="overlay" v-if="loading" >
                <v-progress-circular indeterminate size="64">
                    Loading...
                </v-progress-circular>
                <v-btn @click="closeDialogIssueTypes()" style="margin-top: 200px">CLOSE</v-btn>
            </div>
            <div v-if="!loading">
                <v-data-table
                    v-model="selectedIssuesTypes"
                    :headers="headersIssueTypes"
                    :items="getIssueTypes"
                    item-key="item"
                    select-all
                    class="elevation-1"
                    rows-per-page-text="IssueTypes per page"
                >
                    <template v-slot:items="props">
                        <td>
                            <v-checkbox
                                v-model="props.selected"
                                primary
                                hide-details
                            ></v-checkbox>
                        </td>
                        <td>{{ props.item.item }}</td>
                    </template>
                </v-data-table>
                <v-btn @click="getIssuesByTypes()">Search</v-btn>
                <v-btn @click="closeDialogIssueTypes()">Close</v-btn>
            </div>

        </v-dialog>
        <v-dialog v-model="dialogIssues" width="70%" >
            <div class="overlay" v-if="loading" >
                <v-progress-circular indeterminate size="64" style="margin-left: 30px">
                    Loading...
                </v-progress-circular>
                <v-btn @click="closeDialogIssues()" style="margin-top: 200px">CLOSE</v-btn>
            </div>
            <div v-if="!loading">
                <v-card>
                    <v-card-title>
                        <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
                    </v-card-title>
                    <v-data-table
                        v-model="selectedIssues"
                        :headers="headers"
                        :items="getIssuesToSelect"
                        select-all
                        item-key="key"
                        class="elevation-1"
                        rows-per-page-text="Issues per page"
                    >
                        <template v-slot:items="props">
                            <td>
                                <v-checkbox
                                    v-model="props.selected"
                                    primary
                                    hide-details
                                ></v-checkbox>
                            </td>
                            <td>{{ props.item.key }}</td>
                            <td>{{ props.item.summary }}</td>
                            <td>{{ props.item.issueType }}</td>
                            <td>{{ props.item.projectName }}</td>

                        </template>
                    </v-data-table>
                </v-card>
                <v-btn @click="importSelectedIssues()">Import</v-btn>
                <v-btn @click="addSelectedIssues()">Add</v-btn>
                <v-btn @click="closeDialogIssues()">Close</v-btn>
            </div>
        </v-dialog>
        <div>
            <v-card class="v-card">
                <v-card-title>
                    <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
                </v-card-title>
                <v-data-table
                    :headers="headers"
                    :items="getIssues"
                    item-key="key"
                    class="elevation-1"
                    :total-items="totalItems"
                    rows-per-page-text="Issues per page"
                    :rows-per-page-items="pagination.rowsPerPageItems"
                    :pagination.sync="pagination"
                    @update:pagination.self="getAllIssues()"
                >
                    <template v-slot:items="props">
                        <td>{{ props.item.key }}</td>
                        <td>{{ props.item.summary }}</td>
                        <td>{{ props.item.issueType }}</td>
                        <td>{{ props.item.projectName }}</td>
                    </template>
                </v-data-table>
            </v-card>
        </div>
    </div>
</template>

<script>
import IssuesService from "/src/jira-service";
export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: "Issue",
    data() {
        return {
            headersIssueTypes: [
                {text: "Issue Type", value: "issueType"},
            ],
            headers: [
                {text: "Issue Name", value: "key"},
                {text: "Summary", value: "summary"},
                {text: "Issue Type", value: "issueType"},
                {text: "Project Name", value: "projectName"},
            ],
            issues: [],
            issueTypes: [],
            issuesToImportOrAdd: [],
            search:"",
            totalItems: 0,
            pageNum: 1,
            pageSize: 10,
            projectName: "",
            dialogIssueTypes: false,
            dialogIssues: false,
            selectedIssuesTypes: [],
            selectedIssues: [],
            loading: false,
            projectNames: [],
            selectProjectName: "",
            isProjectSelected: true,
            pagination: {
                sortBy: "key",
                descending: false,
                page: 1,
                rowsPerPage: 10,
                rowsPerPageItems: [5,10,25,50,100,{"text":"All","value":-1}]
            },
        }
    },
    methods: {
        getIssueTypesByProjectName(){
            if(this.projectName === ""){
                return this.isProjectSelected = false
            }else{
                this.isProjectSelected = true
                this.dialogIssueTypes = true
                this.loading = true
                IssuesService.getIssueTypesByProjectName(this.projectName).then((response) => {
                    this.issueTypes = response.data
                    this.loading = false
                })
            }

        },
        getIssuesByTypes(){
            this.dialogIssueTypes = false
            this.dialogIssues = true
            this.loading = true
            IssuesService.getIssuesByTypes(this.projectName, this.selectedIssuesTypes).then((response) => {
                this.issuesToImportOrAdd = response.data
                this.loading = false
            })
        },
        importSelectedIssues(){
            this.dialogIssues = false
            IssuesService.importIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                this.selectedIssues = []
                this.getAllIssues()
            })
        },
        addSelectedIssues(){
            this.dialogIssues = false
            IssuesService.addIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                this.selectedIssues = []
                this.getAllIssues()
            })
        },
        closeDialogIssueTypes(){
            this.dialogIssueTypes = false;
        },
        closeDialogIssues(){
            this.dialogIssues = false;
        },
        getAllIssues() {
            IssuesService.getAllIssues(this.pagination.page, this.pagination.rowsPerPage).then((response) => {
                const {issues, totalItems} = response.data;
                this.issues = issues
                this.totalItems = totalItems
                console.log(this.issues)
            })
        },
        getProjectNames(){
            IssuesService.getProjectNames().then((response) => {
                this.projectNames = JSON.parse(JSON.stringify(response.data))
                console.log(this.projectNames)
            })
        }
    },
    computed: {
        getIssueTypes() {
            return this.issueTypes.map(item => ({
                item }));
        },
        getIssues(){
            if(this.search === ""){
                return this.issues
            }else{
                return this.filterIssues
            }
        },
        getIssuesToSelect(){
            if(this.search === ""){
                return this.issuesToImportOrAdd
            }else{
                return this.filterIssuesToSelect
            }
        },
        filterIssues(){
            return this.issues.filter(item =>{
                return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            })
        },
        filterIssuesToSelect(){
            return this.issuesToImportOrAdd.filter(item =>{
                return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            })
        }
    },
    created() {
        this.getAllIssues()
        this.getProjectNames()
    },

}
</script>

<style>
.row{
    margin-top: 30px;
}
.project-import{
    display: -webkit-box;
    display: -moz-box;
}
.overlay{
    margin-top: 20px;
    margin-left: 45%;
}
</style>