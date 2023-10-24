import axios from 'axios'
import {JIRA_DASHBOARD_BASE_URL} from "@/RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_BASE_URL + "/issues"

class IssueService {
    getAssignedIssues(feedback_id){
        return axios.get(ISSUE_API_BASE_URL + `/get_assigned_issues/${feedback_id}`);
    }
    getToreAssignedIssues(feedback_id){
        return axios.get(ISSUE_API_BASE_URL + `/get_tore_assigned_issues/${feedback_id}`);
    }
    // importIssues(issues){
    //     var parsedobj = JSON.parse(JSON.stringify(issues))
    //     return axios.post(ISSUE_API_BASE_URL + '/import', {
    //         jsonObject: parsedobj,
    //     })
    // }
    deleteAllIssues(){
        return axios.delete(ISSUE_API_BASE_URL + '/remove_all_issues')
    }
    addIssues(issues){
        var parsedobj = JSON.parse(JSON.stringify(issues))
        return axios.post(ISSUE_API_BASE_URL + '/add', {
            jsonObject: parsedobj,
        })
    }
    getIssueTypesByProjectName(projectName){
        return axios.get(ISSUE_API_BASE_URL + `/load/issueTypes/${projectName}`);
    }
    getProjectNames(){
        return axios.get(ISSUE_API_BASE_URL + `/projectNames`);
    }
    getAllJiraProjects(){
        return axios.get(ISSUE_API_BASE_URL + `/get_all_jira_projects`);
    }
    getIssuesByTypes(projectName, issueTypes){
        console.log(projectName)
        var parsedobj = JSON.parse(JSON.stringify(issueTypes))
        console.log(parsedobj)
        return axios.post(ISSUE_API_BASE_URL + `/load/issues/${projectName}`, {
            jsonObject: parsedobj,
        });
    }
    getAllIssues(page, size){
        return axios.get(ISSUE_API_BASE_URL + `/all`, {
            params: {
                page: page,
                size: size
            }
        });
    }
    filterIssuesToAssign(selectedProjects){
        return axios.post(ISSUE_API_BASE_URL + `/issues_to_assign`, {
            selectedProjects: selectedProjects
        });
    }
    deleteProject(projectName) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_project/${projectName}`);
    }
    deleteIssue(projectName, issueKey) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_issue/${projectName}/${issueKey}`);
    }
    getUnassignedIssues(feedback_id){
        console.log(feedback_id)
        return axios.get(ISSUE_API_BASE_URL + `/get_unassigned_issues/${feedback_id}`);
    }
    getUnassignedToreIssues(feedback_id){
        return axios.get(ISSUE_API_BASE_URL + `/get_tore_unassigned_issues/${feedback_id}`);
    }

}

export default new IssueService()