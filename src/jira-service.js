import axios from 'axios'
import {JIRA_DASHBOARD_GET_ALL_ISSUES} from "./RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_GET_ALL_ISSUES + '/issues'

class JiraService {

    saveIssues(issues){
        var parsedobj = JSON.parse(JSON.stringify(issues))
        return axios.post(ISSUE_API_BASE_URL, {
            jsonObject: parsedobj,
        })
    }
    getIssuesByProjectName(projectName){
        return axios.get(ISSUE_API_BASE_URL + `/load/proj/${projectName}`);
    }
    getAllIssues(page, size){
        return axios.get(ISSUE_API_BASE_URL + `/all`, {
            params: {
                page: page,
                size: size
            }
        });
    }
}

export default new JiraService()