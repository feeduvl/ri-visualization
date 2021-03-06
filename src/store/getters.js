import {METHODS} from "@/methods";

export const getTopBarTitle = state => {
  return state.topBarTitle;
};
export const tweets = state => {
  return state.tweets;
};
export const loggedIn = state => {
  return state.loggedIn;
};
export const accessKeyConfigurationTwitterAccounts = state => {
  return state.accessKeyConfiguration.twitter_accounts;
};
export const accessKeyConfigurationTopics = state => {
  return state.accessKeyConfiguration.topics;
};
export const accessKeyConfiguration = state => {
  return state.accessKeyConfiguration;
};
export const accessKey = state => {
  return state.accessKey;
};
export const filteredTweets = state => {
  return state.filteredTweets;
};
export const selectedTopics = state => {
  return state.selectedTopics;
};
export const dataUpToDate = state => {
  return state.dataUpToDate;
};
export const results = state => {
  return state.results;
};
export const datasets = state => {
  return state.datasets;
};
export const selectedDataset = state => {
  return state.selectedDataset;
};
export const selectedResult = state => {
  return state.selectedResult;
};
export const selectedMethod = state => {
  return state.selectedMethod;
};

export const documentViewMethods = state => {
  return METHODS.filter(a => a.showInDocumentView);
};

export const finishedResults = state => {
  return state.results.filter(a => a.status === "finished");
};

export const resultsForSelectedMethod = state => {
  if (state.selectedMethod === METHODS[0].name){
    return [...state.results].reverse();
  }
  return [...state.results.filter(a => a.method === state.selectedMethod)].reverse();
};

export const finishedResultsForSelectedMethod = (state, getters) => {
  if (state.selectedMethod === METHODS[0].name){
    return [...getters.finishedResults].reverse();
  }
  return [...getters.finishedResults.filter(a => a.method === state.selectedMethod)].reverse();
};

export const loadingResults = state => {
  return state.loadingResults;
};
export const loadingDataset = state => {
  return state.loadingDataset;
};
export const selectedDatasetOutside = state => {
  return state.selectedDatasetOutside;
};
export const getProjectTitle = state => {
  return state.projectTitle;
};
export const getTopBarLogo = state => {
  return state.topBarLogo;
};
export const getTopBarAltText = state => {
  return state.topBarAltText;
};
export const getTopBarLink = state => {
  return state.topBarLink;
};
export const getFooterText = state => {
  return state.footer;
};