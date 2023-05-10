import axios from 'axios'
import {JIRA_DASHBOARD_GET_ALL_ISSUES} from "./RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_GET_ALL_ISSUES +'/issues'

class IssuesService {

    saveIssues(issues){
        var parsedobj = JSON.parse(JSON.stringify(issues))
        return axios.post(ISSUE_API_BASE_URL, {
            jsonObject: parsedobj,
        })
    }
    getIssuesByProjectName(projectName){
        return axios.get(ISSUE_API_BASE_URL + `/load/proj/${projectName}`);
    }
    getAllIssues = ({commit}, page, size) => {
    // getAllIssues(page, size){
        return new Promise(() => {
            console.log("Initialize Jira issues");
            axios.get(ISSUE_API_BASE_URL + `/all`, {
                params: {
                    page: page,
                    size: size
                }
            }).then(response => {
                // eslint-disable-next-line camelcase
                const {issues} = response.data;
                console.log("Got all relationships");
                commit("setJiraIssues", issues);
                // commit("setRelationshipOwners", totalItems);
            }).catch(e => console.error("Error: "+e));
        });
        // return axios.get(ISSUE_API_BASE_URL + `/all`, {
        //     params: {
        //         page: page,
        //         size: size
        //     }
        // });
    }
}

export default new IssuesService()