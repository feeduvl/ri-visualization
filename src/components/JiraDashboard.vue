<template>
    <div class="container">
        <div class="banner">
            <v-banner style="background-color: dodgerblue">
                Jira Connection
            </v-banner>
        </div>
        <div class="project-import">
            <v-text-field v-model="projectName" append-icon="mdi-magnify" label="which project do you want to import ..."></v-text-field>
            <v-btn dark color="blue" @click="getIssuesByProjectName()"> SEARCH </v-btn>
        </div>
        <v-dialog v-model="dialog" width="70%" >
            <v-overlay v-if="loading">
                <v-progress-circular indeterminate size="64">
                    Loading...
                </v-progress-circular>
                <v-btn @click="closeDialog()" style="margin-top: 200px">CLOSE</v-btn>
            </v-overlay>
            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="getData"
                item-key="issueId"
                show-select
                class="elevation-1"
            >
                <template v-slot:top>
                    <v-text-field v-model="search" append-icon="mdi-magnify" label=" Search in table..."></v-text-field>
                </template>
            </v-data-table>
            <v-btn @click="saveSelectedIssues()">Import</v-btn>
            <v-btn @click="closeDialog()">Close</v-btn>
        </v-dialog>
        <div>
            <v-card class="v-card">
                <v-data-table
                    :headers="headers"
                    :items="getData"
                    item-key="issueId"
                    class="elevation-1"
                    :footer-props="{
               'items-per-page-text':'Issues per Page',
               'items-per-page-options': [5, 10, 20, 50, -1],
             }"
                    :items-per-page="this.pageSize"
                    :page="pageNum"
                    :server-items-length="this.totalItems"
                    @update:items-per-page="getItemPerPage"
                    @update:page="getPageNum"
                >
                    <template v-slot:top>
                        <v-text-field v-model="search" append-icon="mdi-magnify" label=" Search in table..."></v-text-field>
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
            headers: [
                {
                    title: "Issues",
                    align: "start",
                    sortable: true,
                },
                {text: "Issue ID", value: "issueId"},
                {text: "Issue Name", value: "key"},
                {text: "Issue Type", value: "issueType"},
                {text: "Project Name", value: "projectName"},
            ],
            issues: [],
            search:"",
            totalItems: 0,
            pageNum: 1,
            pageSize: 10,
            projectName: "",
            dialog: false,
            selected: [],
            loading: false,
        }
    },
    methods: {
        getIssuesByProjectName(){
            this.dialog = true
            this.loading = true
            IssuesService.getIssuesByProjectName(this.projectName).then((response) => {
                this.issues = response.data
                this.loading = false
            })
        },
        saveSelectedIssues(){
            this.dialog = false
            IssuesService.saveIssues(this.selected).then((response) => {
                this.issues = response.data
                this.getAllIssues()
            })
        },
        closeDialog(){
            this.dialog = false;
        },
        getAllIssues() {
            // console.log("JA")
            // console.log(this.search)
            IssuesService.getAllIssues(this.pageNum, this.pageSize).then((response) => {
                const {issues, totalItems} = response.data;
                // console.log("NEIN")
                if(this.search === ""){
                    this.issues = issues
                    console.log(issues)
                    console.log(this.issues)
                    this.totalItems = totalItems
                }else{
                    this.filterData()
                }
                // console.log(this.issues + " ALLLL")
                // console.log(totalItems)
            })
        },
        getItemPerPage(val) {
            this.pageSize = val;
            this.getAllIssues()
        },
        getPageNum(val) {
            this.pageNum = val
            this.getAllIssues()
        },
    },
    computed: {
        getData(){
            if(this.search === ""){
                return this.issues
            }else{
                return this.filterData
            }
        },
        filterData(){
            return this.issues.filter(item =>{
                return item.issueId.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.key.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.issueType.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                    || item.projectName.toLowerCase().indexOf(this.search.toLowerCase()) > -1
            })
        }
    },
    created() {
        this.getAllIssues()
    },

}
</script>

<style>
.v-card{
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 80px;
}
.project-import{
    margin-top: 40px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}
.banner{
    color: wheat;
}
</style>