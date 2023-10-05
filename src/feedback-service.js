import axios from 'axios'
import {JIRA_DASHBOARD_BASE_URL} from "./RESTconf";

const ISSUE_API_BASE_URL = JIRA_DASHBOARD_BASE_URL + "/feedback"

class FeedbackService {

    // saveFeedback(excelData){
    //     return axios.get(ISSUE_API_BASE_URL + `/save_excel_data`, {
    //         params: {
    //             excelData: excelData
    //         }
    //     });
    // }
    assignFeedbackToIssues(){
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
}

export default new FeedbackService()