/* eslint-disable */
export const BASE_URL = process.env.VUE_APP_BASE_URL;
export const BACKUP_URL = process.env.VUE_APP_BACKUP_URL;
const axios = require('axios');
axios.defaults.headers.common = {
  'Authorization': 'Bearer ' + process.env.VUE_APP_BEARER_TOKEN
};
export default axios;

// feeduvl

// annotation and agreement
export const GET_EXAMPLE_ANNOTATION_POST_ENDPOINT = BASE_URL+`/hitec/annotation/tokenize/`;

export const ANNOTATION_INITIALIIZE_ENDPOINT = `${BASE_URL}/hitec/orchestration/concepts/annotationinit/`;
export const AGREEMENT_INITIALIIZE_ENDPOINT = `${BASE_URL}/hitec/orchestration/concepts/agreementinit/`;
export const AGREEMENT_EXPORT_ENDPOINT = `${BASE_URL}/hitec/orchestration/concepts/agreementexport/`;
export const ANNOTATION_POST_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/annotation/`;
export const AGREEMENT_POST_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/agreement/`;
export const AGREEMENT_REFRESH_STATISTICS_ENDPOINT = `${BASE_URL}/hitec/orchestration/concepts/statistics/refresh/`;

export const GET_ALL_RELATIONSHIPS_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/annotation/relationships`

export const GET_ALL_TORES_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/annotation/tores`
export const GET_RECOMMENDATIONTORES_ENDPOINT = function(codename){
  return `${BASE_URL}/hitec/repository/concepts/annotation/recommendationTores/${encodeURIComponent(codename)}`
};
export const POST_UPDATE_RECOMMENDATION_DATABASE_ENDPOINT = BASE_URL+`/hitec/annotation/recommendation/rebuild/`;


export const POST_ALL_RELATIONSHIPS_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/annotation/relationships/`
export const POST_ALL_TORES_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/annotation/tores/`
export const ANNOTATION_GET_ENDPOINT = function(name){
  return `${BASE_URL}/hitec/repository/concepts/annotation/name/${encodeURIComponent(name)}`
};
export const AGREEMENT_GET_ENDPOINT = function(name){
  return `${BASE_URL}/hitec/repository/concepts/agreement/name/${encodeURIComponent(name)}`
};
export const ANNOTATION_GET_ALL_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/annotation/all`
export const AGREEMENT_GET_ALL_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/agreement/all`

export const ANNOTATION_DELETE_ENDPOINT = function (name) {
  return `${BASE_URL}/hitec/repository/concepts/annotation/name/${encodeURIComponent(name)}`
}
export const AGREEMENT_DELETE_ENDPOINT = function (name) {
  return `${BASE_URL}/hitec/repository/concepts/agreement/name/${encodeURIComponent(name)}`
}

export const ANNOTATOR_STATUS_ENDPOINT = `${BASE_URL}/hitec/annotation/status`

// concept detection
export const GET_DATASET_ENDPOINT = function (dataset) {
  return `${BASE_URL}/hitec/repository/concepts/dataset/name/${dataset}`;
};

export const GET_ALL_DATASETS_ENDPOINT = `/hitec/repository/concepts/dataset/all`;

export const GET_RESULT_ENDPOINT = function (result) {
  return `${BASE_URL}/hitec/repository/concepts/detection/result/${result}`;
};

export const GET_ALL_RESULTS_ENDPOINT = `/hitec/repository/concepts/detection/result/all`;

export const GET_SERVICE_STATUS_ENDPOINT = function (service) {
  if (`${service}` == "acceptance-criteria") {
    return `${BASE_URL}/hitec/generate/${service}/status`;
  }
  return `${BASE_URL}/hitec/classify/concepts/${service}/status`;
};

export const DELETE_DATASET_ENDPOINT = function (dataset) {
  return `${BASE_URL}/hitec/repository/concepts/dataset/name/${dataset}`;
};

export const DELETE_RESULT_ENDPOINT = function (result) {
  return `${BASE_URL}/hitec/repository/concepts/detection/result/${result}`;
};

export const POST_START_DETECTION_ENDPOINT = `/hitec/orchestration/concepts/detection/`;

export const POST_UPLOAD_DATASET_ENDPOINT =  `/hitec/orchestration/concepts/store/dataset/`;

export const POST_ADD_GROUNDTRUTH_ENDPOINT = `/hitec/orchestration/concepts/store/groundtruth/`;

export const POST_UPDATE_RESULT_NAME_ENDPOINT = `/hitec/repository/concepts/store/detection/result/name`;

// feedai
export const GET_ALL_TWEETS_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/hitec/repository/twitter/account_name/${twitterAccount}/all`;
};
export const GET_TWITTER_ACCOUNT_EXISTS_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/hitec/crawl/tweets/${twitterAccount}/exists`;
};
export const GET_TWITTER_OBSERVABLES_ENDPOINT = function (twitterAccount) {
  return `${BASE_URL}/hitec/repository/twitter/observables`;
};
export const POST_TWITTER_OBSERVABLE_ENDPOINT = function (accountName, interval, lang) {
  return `${BASE_URL}/hitec/orchestration/twitter/observe/tweet/account/${accountName}/interval/${interval}/lang/${lang}`;
};
export const DELETE_TWITTER_OBSERVABLE_ENDPOINT = function (accountName) {
  return `${BASE_URL}/hitec/orchestration/twitter/observe/account/${accountName}`;
};
export const POST_TWEET_LABEL_ENDPOINT = function () {
  return `${BASE_URL}/hitec/repository/twitter/label/tweet/`;
};
export const POST_TWEET_LABEL_PAYLOAD = function (data) {
  let payload = {
    status_id: data.status_id,
    label: data.label,
    date: data.date,
    previous_label: data.previous_label
  };
  return JSON.stringify(payload);
};
export const POST_UPDATE_ACCESS_KEY_CONFIGURATION_ENDPOINT = function () {
  return `${BASE_URL}/hitec/repository/twitter/access_key/update`;
};
export const POST_UPDATE_ACCESS_KEY_CONFIGURATION_PAYLOAD = function (accessKey, accessKeyConfiguration) {
  let payload = {
    access_key: accessKey,
    configuration: accessKeyConfiguration
  };
  return JSON.stringify(payload);
};
export const POST_TWEET_LABEL_BACKUP_ENDPOINT = function () {
  if (BACKUP_URL) {
    return `${BACKUP_URL}/windtretrial/labeledtweet`;
  } else {
    return null;
  }
};
export const POST_TWEET_LABEL_BACKUP_PAYLOAD = function (data) {
  let payload = {
    status_id: data.status_id,
    label: data.label,
    text: data.text,
    date: data.date,
    previous_label: data.previous_label
  };
  return JSON.stringify(payload);
};
export const POST_RETRIEVE_ACCESS_KEY_CONFIGURATION = function (accessKey) {
  return `${BASE_URL}/hitec/repository/twitter/access_key/configuration`;
};
export const POST_RETRIEVE_ACCESS_KEY_CONFIGURATION_PAYLOAD = function (accessKey) {
  let payload = {
    access_key: accessKey,
  };
  return JSON.stringify(payload);
};

// reddit crawler
export const REDDIT_CRAWLER_ENDPOINT = `${BASE_URL}/hitec/reddit/crawl`
export const REDDIT_CRAWLER_GET_JOBS_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/crawler_jobs/all`
export const POST_CRAWLER_DATA_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/reddit_crawler/jobs`
export const DELETE_CRAWLER_JOB_ENDPOINT = function(date){
  return `${BASE_URL}/hitec/repository/concepts/store/reddit_crawler/jobs/${date}`
};

// app review crawler 
export const APP_REVIEW_CRAWLER_ENDPOINT = `${BASE_URL}/hitec/app/crawl`
export const APP_REVIEW_CRAWLER_GET_JOBS_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/app_review_crawler_jobs/all`
export const POST_APP_REVIEW_CRAWLER_DATA_ENDPOINT = `${BASE_URL}/hitec/repository/concepts/store/app_review_crawler/jobs`
export const DELETE_APP_REVIEW_CRAWLER_JOB_ENDPOINT = function(date){
  //console.log(`${BASE_URL}/hitec/repository/concepts/store/app_review_crawler/jobs/${date.toISOtring('YYYY-MM-DDTHH:MM:SS')}`);
  return `${BASE_URL}/hitec/repository/concepts/store/app_review_crawler/jobs/${date}`;
};

// jira dashboard
export const JIRA_DASHBOARD_BASE_URL = `${BASE_URL}/hitec/jira`