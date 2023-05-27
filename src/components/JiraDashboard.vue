<template>
    <div class="container">
        <v-toolbar class="banner">
            Jira Dashboard
        </v-toolbar>
        <div class="row">
            <p style="color: dodgerblue; font-size: 18px; margin-left: 15px">Select already used projects or search for new:
            </p>
            <v-radio-group v-model="searchForProject">
                <div class="project-import">
                    <v-select class="select-issueTypes" v-model="projectNameBySelect" :items="projectNames"
                              label="Select project" item-text="name" style="margin-left: 15px"
                              :disabled="searchForProject === '1'"></v-select>
                    <v-radio value="0"></v-radio>
                    <v-text-field v-model="projectNameBySearch" append-icon="mdi-magnify" label="type project key ..."
                                  style="margin-left: 30px; width: 30%" :disabled="searchForProject === '0'">
                    </v-text-field>
                    <v-radio value="1"></v-radio>
                    <v-btn dark color="blue" @click="getIssueTypesByProjectName()" style="margin-left: 40px"> SEARCH
                    </v-btn>
                </div>
            </v-radio-group>
            <p v-if="!isProjectSelected" style="color: red">{{ warning }}</p>
        </div>
        <v-dialog v-model="dialogIssueTypes" width="70%">
            <div class="overlay" v-if="loading">
                <v-progress-circular indeterminate size="64">
                    Loading...
                </v-progress-circular>
                <v-btn dark color="black" @click="closeDialogIssueTypes()"
                       style="margin-top: 200px; margin-left: 85%">CLOSE</v-btn>
            </div>
            <div v-if="!loading">
                <v-card>
                    <v-card-title>
                        choose the issue-types you want to show of project: {{ projectName }}
                    </v-card-title>
                    <v-data-table v-model="selectedIssuesTypes" :headers="headersIssueTypes" :items="getIssueTypes"
                                  item-key="item" select-all class="elevation-1" rows-per-page-text="IssueTypes per page">
                        <template v-slot:items="props">
                            <td>
                                <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                            </td>
                            <td>{{ props.item.item }}</td>
                        </template>
                    </v-data-table>
                    <v-btn dark color="blue" @click="getIssuesByTypes()" style="margin-left: 75%">Search</v-btn>
                    <v-btn dark color="black" @click="closeDialogIssueTypes()">Close</v-btn>
                </v-card>
            </div>
        </v-dialog>
        <v-dialog v-model="dialogIssues" width="70%">
            <div class="overlay" v-if="loading">
                <v-progress-circular indeterminate size="64" style="margin-left: 30px">
                    Loading...
                </v-progress-circular>
                <v-btn dark color="black" @click="closeDialogIssues()"
                       style="margin-top: 200px; margin-left: 85%">CLOSE</v-btn>
            </div>
            <div v-if="!loading">
                <v-card>
                    <v-card-title>
                        <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
                    </v-card-title>
                    <v-data-table v-model="selectedIssues" :headers="headers" :items="getIssuesToSelect" select-all
                                  item-key="key" class="elevation-1" rows-per-page-text="Issues per page">
                        <template v-slot:items="props">
                            <td>
                                <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                            </td>
                            <td>{{ props.item.key }}</td>
                            <td>{{ props.item.summary }}</td>
                            <td>{{ props.item.issueType }}</td>
                            <td>{{ props.item.projectName }}</td>
                        </template>
                    </v-data-table>
                </v-card>
                <v-btn dark color="blue" @click="importSelectedIssues()" style="margin-left: 65%">Import</v-btn>
                <v-btn dark color="blue" @click="addSelectedIssues()">Add to existing</v-btn>
                <v-btn dark color="black" @click="closeDialogIssues()">Close</v-btn>
            </div>
        </v-dialog>
        <div>
            <v-card class="v-card">
                <v-card-title>
                    <div style="width: 40%">
                        <v-select
                            v-model="filterProjectName"
                            :items="projectNames"
                            label="Filter by project name"
                            item-text="name"
                        ></v-select>
                    </div>
                    <div style="width: 50%; margin-left: 25px">
                        <v-text-field v-model="search" append-icon="search" label=" Search in table..."></v-text-field>
                    </div>
                </v-card-title>
                <v-data-table :headers="headers" :items="getIssues" item-key="key" class="elevation-1"
                              :total-items="totalItems" rows-per-page-text="Issues per page"
                              :rows-per-page-items="pagination.rowsPerPageItems" :pagination.sync="pagination"
                              @update:pagination.self="getAllIssues()">
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
import IssuesService from "@/jira-service";
export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: "Issue",
    data() {
        return {
            headersIssueTypes: [
                { text: "Issue Type", value: "issueType" },
            ],
            headers: [
                { text: "Issue Name", value: "key" },
                { text: "Summary", value: "summary" },
                { text: "Issue Type", value: "issueType" },
                { text: "Project Name", value: "projectName" },
            ],
            issues: [],
            issueTypes: [],
            issuesToImportOrAdd: [],
            search: "",
            filterProjectName: "",
            totalItems: 0,
            projectNameBySearch: "",
            projectNameBySelect: "",
            projectName: "",
            searchForProject: "0",
            dialogIssueTypes: false,
            dialogIssues: false,
            selectedIssuesTypes: [],
            selectedIssues: [],
            loading: false,
            projectNames: [],
            isProjectSelected: true,
            warning: "",
            pagination: {
                sortBy: "key",
                descending: false,
                page: 1,
                rowsPerPage: 10,
                rowsPerPageItems: [5, 10, 25, 50, 100, { "text": "All", "value": -1 }]
            },
        }
    },
    methods: {
        getIssueTypesByProjectName() {
            if (this.searchForProject === "0") {
                console.log("select")
                this.projectName = this.projectNameBySelect
            } else if (this.searchForProject === "1") {
                console.log("search")
                this.projectName = this.projectNameBySearch
            }
            if (this.projectName === "" || this.projectName === "-") {
                this.warning = "No project selected. Please select a project"
                return this.isProjectSelected = false
            } else {
                this.isProjectSelected = true
                this.dialogIssueTypes = true
                this.loading = true
                IssuesService.getIssueTypesByProjectName(this.projectName).then((response) => {
                    this.issueTypes = response.data
                    this.loading = false
                    console.log(this.issueTypes)
                    console.log("get issueTypes jira")
                    if (this.issueTypes.length === 0) {
                        this.dialogIssueTypes = false
                        this.isProjectSelected = false
                        this.warning = "No project or issues in project found"
                    }
                    this.getProjectNames()
                })
            }
        },
        getIssuesByTypes() {
            this.dialogIssueTypes = false
            this.dialogIssues = true
            this.loading = true
            IssuesService.getIssuesByTypes(this.projectName, this.selectedIssuesTypes).then((response) => {
                this.issuesToImportOrAdd = response.data
                this.loading = false
                console.log(this.issuesToImportOrAdd)
                console.log("get issues jira")
            })
        },
        importSelectedIssues() {
            this.dialogIssues = false
            IssuesService.importIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                this.selectedIssues = []
                this.getAllIssues()
            })
        },
        addSelectedIssues() {
            this.dialogIssues = false
            IssuesService.addIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                this.selectedIssues = []
                this.getAllIssues()
            })
        },
        closeDialogIssueTypes() {
            this.dialogIssueTypes = false;
        },
        closeDialogIssues() {
            this.dialogIssues = false;
        },
        getAllIssues() {
            console.log(this.pagination.rowsPerPage)
            IssuesService.getAllIssues(this.pagination.page, this.pagination.rowsPerPage).then((response) => {
                const { issues, totalItems } = response.data;
                this.issues = issues
                console.log(this.issues)
                console.log("get from db")
                this.totalItems = totalItems
            })
        },
        getProjectNames() {
            IssuesService.getProjectNames().then((response) => {
                this.projectNames = JSON.parse(JSON.stringify(response.data))
                console.log(this.projectNames)
            })
        },
    },
    computed: {
        getIssueTypes() {
            return this.issueTypes.map(item => ({
                item
            }));
        },
        getIssues(){
            if(this.filterProjectName !== "" && this.filterProjectName !== "-"){
                console.log(this.filterProjectName)
                if(this.search !== ""){
                    console.log(this.search)
                    return this.filterIssues
                }
                return this.filterIssuesByProjectName
            }
            else if(this.search !== ""){
                this.getAllIssues()
                return this.filterIssues
            }
            else{
                this.getAllIssues()
                return this.issues
            }
        },
        getIssuesToSelect() {
            if (this.search === "") {
                return this.issuesToImportOrAdd
            } else {
                return this.filterIssuesToSelect
            }
        },
        filterIssues() {
            return this.issues.filter(item => {
                return item.summary.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            })
        },
        filterIssuesByProjectName(){
            this.issues = this.issues.filter(item =>{
                return item.projectName.toLowerCase().indexOf(this.filterProjectName.toLowerCase()) > -1
            })
            return this.issues
        },
        filterIssuesToSelect() {
            return this.issuesToImportOrAdd.filter(item => {
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
.row {
    margin-top: 30px;
}

.project-import {
    display: -webkit-box;
    display: -moz-box;
}

.overlay {
    margin-top: 20px;
    margin-left: 45%;
    width: 50%;
    height: 50%;
}

body {
    font-family: arial;
}

p {
    font-weight: bold;
}
</style>