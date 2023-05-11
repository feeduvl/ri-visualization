<template>
    <div class="container">
        <v-toolbar class="banner" >
            Jira Connection
        </v-toolbar>
        <div class="project-import">
            <v-select
                v-model="projectName"
                :items="projectNames"
                box
                label="Select project"
                item-text="name"
            ></v-select>
            <v-text-field v-model="projectName" append-icon="mdi-magnify" label="which project do you want to import ..."></v-text-field>
            <v-btn dark color="blue" @click="getIssueTypesByProjectName()"> SEARCH </v-btn>
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
                    :items="myItemsTransformed"
                    item-key="item"
                    select-all
                    class="elevation-1"
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
                        :items="getData"
                        select-all
                        item-key="key"
                        class="elevation-1"
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
                    :items="getData"
                    item-key="key"
                    class="elevation-1"
                    :footer-props="{
               'rows-per-page-text':'Issues per Page',
               'rows-per-page-items': [5, 10, 20, 50, -1],
             }"
                    :items-per-page="this.pageSize"
                    :page="pageNum"
                    :total-items="totalItems"
                    @update:items-per-page="getItemPerPage"
                    @update:page="getPageNum"
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
        }
    },
    methods: {
        getIssueTypesByProjectName(){
            this.dialogIssueTypes = true
            this.loading = true
            IssuesService.getIssueTypesByProjectName(this.projectName).then((response) => {
                this.issueTypes = response.data
                this.loading = false
                console.log(response.data)
                console.log(this.issueTypes)
                console.log("get issueTypes jira")
            })
        },
        getIssuesByTypes(){
            this.dialogIssueTypes = false
            this.dialogIssues = true
            this.loading = true
            IssuesService.getIssuesByTypes(this.projectName, this.selectedIssuesTypes).then((response) => {
                this.issues = response.data
                this.loading = false
                this.selectedIssuesTypes = ""
                console.log(response.data)
                console.log(this.issues)
                console.log("get issues jira")
            })
        },
        importSelectedIssues(){
            this.dialogIssues = false
            IssuesService.importIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                this.getAllIssues()
            })
        },
        addSelectedIssues(){
            this.dialogIssues = false
            IssuesService.addIssues(this.selectedIssues).then((response) => {
                this.issues = response.data
                console.log(this.issues)
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
            IssuesService.getAllIssues(this.pageNum, this.pageSize).then((response) => {
                const {issues, totalItems} = response.data;
                if(this.search === ""){
                    this.issues = issues
                    console.log(issues)
                    console.log(this.issues)
                    console.log("get from db")
                    this.totalItems = totalItems
                    this.selectedIssues = "";
                }else{
                    this.filterData()
                }
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
        getProjectNames(){
            IssuesService.getProjectNames().then((response) => {
                this.projectNames = JSON.parse(JSON.stringify(response.data))
            })
        }
    },
    computed: {
        myItemsTransformed() {
            return this.issueTypes.map(item => ({
                item }));
        },
        getData(){
            if(this.search === ""){
                return this.issues
            }else{
                return this.filterData
            }
        },
        filterData(){
            return this.issues.filter(item =>{
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
.project-import{
    margin-top: 40px;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
}
.overlay{
    margin-top: 20px;
    margin-left: 45%;
}
</style>