
export const mutateInitalData = (state, initialData) => {
  state.tweets = Object.assign({}, state.tweets, initialData);
  let hasAllKeys = state.twitterAccounts.every(function (item) {
    return Object.prototype.hasOwnProperty.call(state.tweets, item);
  });
  state.initialDataLoaded = hasAllKeys;
};

export const mutateTweets = (state, tweets) => {
  state.tweets = tweets;
};

export const mutateSelectedTwitterAccounts = (state, selectedTwitterAccounts) => {
  state.selectedTwitterAccounts = selectedTwitterAccounts;
};

export const mutateSelectedTopics = (state, topics) => {
  state.selectedTopics = topics;
};

export const mutateTwitterAccounts = (state, twitterAccounts) => {
  state.twitterAccounts = twitterAccounts;
};

export const mutateLoggedIn = (state, loggedIn) => {
  state.loggedIn = loggedIn;
};

export const mutateAccessKeyConfiguration = (state, accessKeyConfiguration) => {
  state.accessKeyConfiguration = accessKeyConfiguration;
};

export const mutateAccessKey = (state, accessKey) => {
  state.accessKey = accessKey;
};

export const mutateToolbarHeader = (state, title) => {
  state.topBarTitle = title;
};

export const mutateFilteredTweets = (state, filteredTweets) => {
  state.dataUpToDate = true;
  state.filteredTweets = filteredTweets;
};

export const mutateDatasets = (state, datasets) => {
  state.datasets = datasets;
};
export const mutateResults = (state, results) => {
  state.results = results;
};
export const mutateSelectedMethod = (state, method) => {
  state.selectedMethod = method;
};
export const mutateSelectedDataset = (state, dataset) => {
  state.selectedDataset = dataset;
};
export const mutateSelectedDatasetOutside = (state, datasetName) => {
  state.selectedDatasetOutside = datasetName;
};
export const mutateSelectedResult = (state, result) => {
  state.selectedResult = result;
};
export const mutateLoadingResults = (state, status) => {
  state.loadingResults = status;
};
export const mutateLoadingDataset = (state, status) => {
  state.loadingDataset = status;
};
export const mutateProjectTitle = (state, title) => {
  state.projectTitle = title;
};
export const mutateTopBarLogo = (state, title) => {
  state.topBarLogo = title;
};
export const mutateTopBarAltText = (state, title) => {
  state.topBarAltText = title;
};
export const mutateTopBarLink = (state, link) => {
  state.topBarLink = link;
};
export const mutateFooterText = (state, title) => {
  state.footer = title;
};