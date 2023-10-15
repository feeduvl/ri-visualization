import axios from 'axios'
import {JIRA_DASHBOARD_BASE_URL} from "./RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_BASE_URL + "/feedback"

class FeedbackService {

    assignFeedbackToIssues(){
        return axios.post(ISSUE_API_BASE_URL + `/assign_feedback_to_issues`);
    }

    assignFeedbackToIssuesByTore(){
        return axios.post(ISSUE_API_BASE_URL + `/assign_feedback_to_issues_by_tore`);
    }
    saveSelectedFeedback(feedback_name){
        return axios.get(ISSUE_API_BASE_URL + `/load/${feedback_name}` );
    }

    assignToreCategoriesToFeedback(annotation_name){
        return axios.get(ISSUE_API_BASE_URL + `/assign_tore_to_feedback/${annotation_name}` );
    }

    getFeedbackNames(){
        return axios.get(ISSUE_API_BASE_URL + `/get_feedback_names`);
    }

    getAnnotationsNames(){
        return axios.get(ISSUE_API_BASE_URL + `/get_annotations_names`);
    }

    getFeedback(){
        return axios.get(ISSUE_API_BASE_URL + `/get_feedback`);
    }

    addFeedback(issueKey, selectedFeedback) {
        return axios.post(ISSUE_API_BASE_URL + `/add_feedback_to_issues_list`, {
            issue_key: issueKey,
            selected_feedback: selectedFeedback,
        });
    }

    addToreFeedback(issueKey, selectedFeedback) {
        return axios.post(ISSUE_API_BASE_URL + `/add_tore_feedback_to_issues_list`, {
            issue_key: issueKey,
            selected_feedback: selectedFeedback,
        });
    }

    deleteFeedback(issueKey, feedbackId) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_feedback/${issueKey}/${feedbackId}`);
    }

    deleteToreFeedback(issueKey, feedbackId) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_tore_feedback/${issueKey}/${feedbackId}`);
    }
}

export default new FeedbackService()