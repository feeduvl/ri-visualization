import axios from 'axios';
import moment from "moment";
import "moment/locale/de";
import {
  GET_ALL_DATASETS_ENDPOINT,
  GET_ALL_RESULTS_ENDPOINT,
  GET_ALL_TWEETS_ENDPOINT
} from '@/RESTconf';
import {
  ACTION_RESET_FILTERED_TWEETS,
  MUTATE_FILTERED_TWEETS,
  MUTATE_TOOLBAR_HEADER,
  MUTATE_PROJECT_TITLE,
  MUTATE_TOP_BAR_LOGO,
  MUTATE_TOP_BAR_ALT_TEXT,
  MUTATE_FOOTER_TEXT,
  MUTATE_TOP_BAR_LINK, MUTATE_FILTERED_RESULTS
} from '@/store/types';

export const actionFetchInitialData = ({
  state,
  commit
}, twitterAccounts) => {
  return new Promise((resolve, reject) => {
    let nRequests = twitterAccounts.length;
    let counter = 0;
    twitterAccounts.forEach(twitterAccount => {
      axios
        .get(GET_ALL_TWEETS_ENDPOINT(twitterAccount))
        .then(response => {
          if (response.data !== null) {
            let payload = {};
            payload[twitterAccount] = response.data;
            state.tweets = Object.assign({}, state.tweets, payload);
          }
          counter++;
          if (nRequests === counter) {
            state.initialDataLoaded = true;
            resolve();
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  });
};
export const actionFilterResults = ({
  state,
  commit
}, payload) => {

  // Filter for finished runs
  let _tmpFilteredResults = [];
  for (let i = 0; i <  state.results.length; i++) {
    if (state.results[i].status === "finished") {
      _tmpFilteredResults.push(state.results[i]);
    }
  }

  if (payload.method === "") {
    commit(MUTATE_FILTERED_RESULTS, _tmpFilteredResults);
    return;
  }
  let tmpFilteredResults = [];

  for (let i = 0; i <  _tmpFilteredResults.length; i++) {
    if (_tmpFilteredResults[i].method === payload.method) {
      tmpFilteredResults.push(_tmpFilteredResults[i]);
    }
  }

  commit(MUTATE_FILTERED_RESULTS, tmpFilteredResults);
};
export const actionLoadDatasets = state => {
  axios
    .get(GET_ALL_DATASETS_ENDPOINT)
    .then(response => {
      state.datasets =  response.data;
    })
    .catch(e => {
      console.log("actions::actionLoadDatasets Error:" + e);
    });
};
export const actionLoadResults = state => {
  state.loadingResults = true;
  axios
    .get(GET_ALL_RESULTS_ENDPOINT)
    .then(response => {
      state.results = response.data;

      // Filter for finished runs
      let _tmpFilteredResults = [];
      for (let i = 0; i <  state.results.length; i++) {
        if (state.results[i].status === "finished") {
          _tmpFilteredResults.push(state.results[i]);
        }
      }

      state.filteredResults = _tmpFilteredResults;
      state.loadingResults = false;
    })
    .catch(e => {
      console.log("actions::actionLoadResults Error:" + e);
      state.loadingResults = false;
    });
};
export const actionFetchInitialConceptData = ({
  state,
}) => {
  actionLoadDatasets(state);
  actionLoadResults(state);
};
export const actionDeleteResult = ({
  state,
  commit
}, payload) => {
  for (const index in state.results) {
    if (state.results[index].started_at === payload.started_at) {
      state.results.splice(index, 1);
    }
  }
  for (const index in state.filteredResults) {
    if (state.filteredResults[index].started_at === payload.started_at) {
      state.filteredResults.splice(index, 1);
    }
  }
};
export const actionEditResultName = ({
  state,
  commit
}, payload) => {
  for (const index in state.results) {
    if (state.results[index].started_at === payload.started_at) {
      state.results[index].name = payload.name;
    }
  }
  for (const index in state.filteredResults) {
    if (state.filteredResults[index].started_at === payload.started_at) {
      state.filteredResults[index].name = payload.name;
    }
  }
};
export const actionFilterTweets = ({
  state,
  dispatch,
  commit
}, payload) => {
  // 1. reset filtered tweets to all tweets
  // 2. check if the user filters for a specific account => if yes, filter
  // 3. check if the user filters for a time-frame => if yes, filter
  // 4. update state via commit
  state.dataUpToDate = false;
  state.dataUpdating = true;

  // 1. reset filtered tweets to all tweets
  dispatch(ACTION_RESET_FILTERED_TWEETS);

  let tmpFilteredTweets = [];

  // 2. check if the user filters for a specific account => if yes, filter
  payload.twitterAccounts.forEach(account => {
    tmpFilteredTweets = tmpFilteredTweets.concat(state.tweets[account]);
  });

  // 3. check if the user filters for a time-frame => if yes, filter
  if (payload.fromDate !== null) {
    let dateFromCompare = moment(payload.fromDate, 'YYYY-MM-DD').format('YYYYMMDD');
    tmpFilteredTweets = tmpFilteredTweets.filter(tweet => tweet.created_at >= dateFromCompare);
  }
  if (payload.toDate !== null) {
    let dateToCompare = moment(payload.toDate, 'YYYY-MM-DD').format('YYYYMMDD');
    tmpFilteredTweets = tmpFilteredTweets.filter(tweet => tweet.created_at <= dateToCompare);
  }

  // 4. update state via commit
  state.dataUpdating = false;
  commit(MUTATE_FILTERED_TWEETS, tmpFilteredTweets);
  state.dataUpToDate = true;
};
export const actionResetFilteredTweets = ({
  state,
  commit
}) => {
  let tmpFilteredTweets = [];
  Object.keys(state.tweets).forEach(function (account) {
    tmpFilteredTweets = tmpFilteredTweets.concat(state.tweets[account]);
  });
  commit(MUTATE_FILTERED_TWEETS, tmpFilteredTweets);
};
export const actionUpdateTweet = ({
  state
}, tweet) => {
  // update the original data source (tweets)
  Object.keys(state.tweets).forEach(function (account) {
    for (let i = 0; i < state.tweets[account].length; i++) {
      if (state.tweets[account][i].status_id === tweet.status_id) {
        state.tweets[account][i] = tweet;
      }
    }
  });

  // update filtered tweet lis
  for (let i = 0; i < state.filteredTweets.length; i++) {
    if (state.filteredTweets[i].status_id === tweet.status_id) {
      state.filteredTweets[i] = tweet;
    }
  }

  // notify listener
  state.dataUpToDate = true;
};
export const actionRemoveUnlabeledTweet = ({
  state
}, statusID) => {
  for (let i = 0; i < state.unlabeledTweets.length; i++) {
    if (state.unlabeledTweets[i].status_id === statusID) {
      state.unlabeledTweets.splice(i, 1);
    }
  }
};
export const setToolbarHeader = ({
  commit
}, title) => {
  commit(MUTATE_TOOLBAR_HEADER, title);
};
export const setProjectTitle = ({
  commit
}, title) => {
  commit(MUTATE_PROJECT_TITLE, title);
};
export const setTopBarLogo = ({
  commit
}, logo) => {
  commit(MUTATE_TOP_BAR_LOGO, logo);
};
export const setTopBarAltText = ({
  commit
}, text) => {
  commit(MUTATE_TOP_BAR_ALT_TEXT, text);
};
export const setTopBarLink = ({
  commit
}, text) => {
  commit(MUTATE_TOP_BAR_LINK, text);
};
export const setFooterText = ({
  commit
}, text) => {
  commit(MUTATE_FOOTER_TEXT, text);
};