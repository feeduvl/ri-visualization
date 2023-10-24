import axios from 'axios'
import {JIRA_DASHBOARD_BASE_URL} from "@/RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_BASE_URL + "/feedback"

class FeedbackService {
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
    getUnassignedFeedback(issueKey){
        return axios.get(ISSUE_API_BASE_URL + `/get_unassigned_feedback/${issueKey}`);
    }
    getUnassignedToreFeedback(issueKey){
        return axios.get(ISSUE_API_BASE_URL + `/get_unassigned_tore_feedback/${issueKey}`);
    }
    getAssignedFeedback(issueKey){
        return axios.get(ISSUE_API_BASE_URL + `/get_assigned_feedback/${issueKey}`);
    }
    getAssignedToreFeedback(issueKey){
        return axios.get(ISSUE_API_BASE_URL + `/get_assigned_tore_feedback/${issueKey}`);
    }
    deleteFeedback(feedbackId) {
        return axios.delete(ISSUE_API_BASE_URL + `/delete_feedback/${feedbackId}`);
    }
}

export default new FeedbackService()