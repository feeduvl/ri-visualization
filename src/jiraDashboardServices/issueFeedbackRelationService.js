import axios from 'axios'
import {JIRA_DASHBOARD_BASE_URL} from "@/RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_BASE_URL + "/issue_feedback"

class IssueFeedbackRelationService {
    assignFeedbackToIssues(){
        return axios.post(ISSUE_API_BASE_URL + `/assign_feedback_to_issues`);
    }
    assignFeedbackToIssuesByTore(){
        return axios.post(ISSUE_API_BASE_URL + `/assign_feedback_to_issues_by_tore`);
    }
    deleteIssueFeedbackRelation(issueKey, feedbackId) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_feedback/${issueKey}/${feedbackId}`);
    }
    deleteToreIssueFeedbackRelation(issueKey, feedbackId) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_tore_feedback/${issueKey}/${feedbackId}`);
    }
    addFeedbackToIssue(projectName, issueKey, selectedFeedback) {
        return axios.post(ISSUE_API_BASE_URL + `/add_feedback_to_issue`, {
            projectName: projectName,
            issue_key: issueKey,
            selected_feedback: selectedFeedback,
        });
    }
    addToreFeedbackToIssue(projectName, issueKey, selectedFeedback) {
        return axios.post(ISSUE_API_BASE_URL + `/add_tore_feedback_to_issue`, {
            projectName: projectName,
            issue_key: issueKey,
            selected_feedback: selectedFeedback,
        });
    }
    addIssueToFeedback(feedback_id, selectedIssues) {
        return axios.post(ISSUE_API_BASE_URL + `/add_issue_to_feedback`, {
            feedback_id: feedback_id,
            selected_issues: selectedIssues,
        });
    }
    addIssueToToreFeedback(feedback_id, selectedIssues) {
        return axios.post(ISSUE_API_BASE_URL + `/add_issue_to_tore_feedback`, {
            feedback_id: feedback_id,
            selected_issues: selectedIssues,
        });
    }

}

export default new IssueFeedbackRelationService()