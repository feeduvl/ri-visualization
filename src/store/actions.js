import axios from 'axios';
import moment from "moment";
import "moment/locale/de";
import {
  ACTION_LOAD_RESULTS, MUTATE_CLUSTER_RELATIONSHIPS,
  MUTATE_LOADING_RESULTS,
  MUTATE_RESULTS,
  MUTATE_TOKEN_CLUSTERS,
  MUTATE_TOKENS
} from "./types";
import {
  GET_ALL_DATASETS_ENDPOINT,
  GET_ALL_RESULTS_ENDPOINT,
  GET_ALL_TWEETS_ENDPOINT,
  GET_EXAMPLE_ANNOTATION_POST_ENDPOINT  
} from '@/RESTconf';
import {
  ACTION_RESET_FILTERED_TWEETS,
  MUTATE_FILTERED_TWEETS,
  MUTATE_TOOLBAR_HEADER,
  MUTATE_PROJECT_TITLE,
  MUTATE_TOP_BAR_LOGO,
  MUTATE_TOP_BAR_ALT_TEXT,
  MUTATE_FOOTER_TEXT,
  MUTATE_TOP_BAR_LINK
} from '@/store/types';

export const actionGetExampleAnnotation = ({
  commit
}) => {
  return new Promise(() => {
    axios.post(GET_EXAMPLE_ANNOTATION_POST_ENDPOINT, {
      annotationName: "An example annotation",
      dataset: "interview_data_normal"
    })
      .then(response => {
        console.log("actionGetExampleAnnotation Got good response.");

        const {data} = response;
        commit("setAnnotationPayload", data);
      })
      .catch(e => console.log("Error getting tokens: "+e));
  });
};

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

export const actionLoadDatasets = state => {
  axios
    .get(GET_ALL_DATASETS_ENDPOINT)
    .then(response => {
      state.datasets = response.data;
    })
    .catch(e => {
      console.log("actions::actionLoadDatasets Error:" + e);
    });
};
export const actionLoadResults = ({commit}) => {

  commit(MUTATE_LOADING_RESULTS, true);
  axios
    .get(GET_ALL_RESULTS_ENDPOINT)
    .then(response => {
      console.log("actions::actionLoadResults got payload");
      commit(MUTATE_RESULTS, response.data);
    })
    .catch(e => {
      console.log("actions::actionLoadResults Error:" + e);
    })
    .finally(() => {commit(MUTATE_LOADING_RESULTS, false);});

};
export const actionFetchInitialConceptData = ({
  state, dispatch
}) => {
  actionLoadDatasets(state);
  dispatch(ACTION_LOAD_RESULTS);
};
export const actionDeleteResult = ({
  state,
}, payload) => {
  for (const index in state.results) {
    if (state.results[index].started_at === payload.started_at) {
      state.results.splice(index, 1);
    }
  }
};
export const actionEditResultName = ({
  state,
}, payload) => {
  for (const index in state.results) {
    if (state.results[index].started_at === payload.started_at) {
      state.results[index].name = payload.name;
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