import axios from 'axios'

const ISSUE_API_BASE_URL ='http://localhost:8080/hitec/jira/issues'

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
    getAllIssues(page, size){
        return axios.get(ISSUE_API_BASE_URL + `/all`, {
            params: {
                page: page,
                size: size
            }
        });
    }
}

export default new IssuesService()