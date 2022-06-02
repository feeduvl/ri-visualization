import axios from 'axios';
import moment from "moment";
import "moment/locale/de";
import {
  ACTION_LOAD_RESULTS,
  MUTATE_LOADING_RESULTS,
  MUTATE_RESULTS,
} from "./types";
import {
  GET_ALL_DATASETS_ENDPOINT,
  GET_ALL_RESULTS_ENDPOINT,
  GET_ALL_TWEETS_ENDPOINT,
  ANNOTATION_INITIALIIZE_ENDPOINT,
  AGREEMENT_INITIALIIZE_ENDPOINT,
  AGREEMENT_EXPORT_ENDPOINT,
  AGREEMENT_REFRESH_STATISTICS_ENDPOINT,
  ANNOTATION_DELETE_ENDPOINT,
  AGREEMENT_DELETE_ENDPOINT,
  ANNOTATION_GET_ALL_ENDPOINT,
  AGREEMENT_GET_ALL_ENDPOINT,
  ANNOTATION_GET_ENDPOINT,
  AGREEMENT_GET_ENDPOINT,
  ANNOTATION_POST_ENDPOINT,
  AGREEMENT_POST_ENDPOINT,
  POST_ALL_RELATIONSHIPS_ENDPOINT,
  POST_ALL_TORES_ENDPOINT,
  GET_ALL_RELATIONSHIPS_ENDPOINT,
  GET_ALL_TORES_ENDPOINT,
  REDDIT_CRAWLER_ENDPOINT,
  REDDIT_CRAWLER_GET_JOBS_ENDPOINT,
  POST_CRAWLER_DATA_ENDPOINT
} from '../RESTconf';
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

export const actionPostAllRelationships= ({commit}, {newRelationships, newOwners}) => {
  return new Promise((resolve, reject) => {
    console.log("Posting all relationships.");
    axios.post(POST_ALL_RELATIONSHIPS_ENDPOINT, {relationship_names: newRelationships, owners: newOwners})
      .then(r => {
        commit("setRelationshipNames", newRelationships);
        commit("setRelationshipOwners", newOwners);
        resolve(r);
      })
      .catch(e => {
        console.error("Error posting relationships: "+e);
        reject(e);

      });
  });
};

export const actionPostAllTores = ({commit}, newTores) => {
  return new Promise((resolve, reject) => {
    console.log("Posting all tores.");
    axios.post(POST_ALL_TORES_ENDPOINT, {tores: newTores})
      .then(r => {
        commit("setTores", newTores);
        resolve(r);
      })
      .catch(e => {
        console.error("Error posting tores: "+e);
        reject(e);
      });
  });
};

export const actionGetAllRelationships = ({commit}) => {
  return new Promise(() => {
    console.log("Getting all relationships.");
    axios.get(GET_ALL_RELATIONSHIPS_ENDPOINT)
      .then(response => {
        // eslint-disable-next-line camelcase
        const {relationship_names, owners} = response.data;
        console.log("Got all relationships");
        commit("setRelationshipNames", relationship_names);
        commit("setRelationshipOwners", owners);
      })
      .catch(e => console.error("Error getting relationships: "+e));
  });
};

export const actionGetAllTores = ({commit}) => {
  return new Promise(() => {
    console.log("Getting all tores.");
    axios.get(GET_ALL_TORES_ENDPOINT)
      .then(response => {
        const {tores} = response.data;
        console.log("Got all tores");
        commit("setTores", tores);
      })
      .catch(e => console.error("Error getting tores: "+e));
  });
};

export const actionGetNewAnnotation = ({
  commit
}, {name, dataset}) => {
  return new Promise(() => {
    console.warn("Initializing annotation");
    commit("setIsLoadingAnnotation", true);
    axios.post(ANNOTATION_INITIALIIZE_ENDPOINT, {
      name,
      dataset
    })
      .then(response => {
        console.log("actionGetExampleAnnotation Got good response.");
        const {data} = response;
        commit("setAnnotationPayload", data);
      })
      .catch(e => console.error("Error getting annotation: "+e))
      .finally(() => {
        commit("setIsLoadingAnnotation", false);
      });
  });
};

export const actionGetNewAgreement = ({
  commit
}, {name, dataset, annotations, completeConcurrences}) => {
  return new Promise(() => {
    const annotationNames = annotations.map(function (item) {
      return item.name;
    });
    console.warn("Initializing agreement");
    commit("setIsLoadingAgreement", true);
    axios.post(AGREEMENT_INITIALIIZE_ENDPOINT, {
      name,
      dataset,
      annotationNames,
      completeConcurrences
    })
      .then(response => {
        console.log("actionGetNewAgreement Got good response.");
        const {data} = response;
        commit("setAgreementPayload", data);
      })
      .catch(e => console.error("Error getting agreement: "+e))
      .finally(() => {
        commit("setIsLoadingAgreement", false);
      });
  });
};

export const actionExportAgreement = ({
  commit
}, {agreementName, newAnnotationName}) => {
  return new Promise(() => {
    console.warn("Exporting agreement as annotation");
    axios.post(AGREEMENT_EXPORT_ENDPOINT, {
      agreementName,
      newAnnotationName,
    })
      .then(() => {
        console.log("actionExportAgreement responded");
      })
      .catch(e => console.error("Error exporting agreement: "+e));
  });
};

export const actionGetSelectedAnnotation = ({commit, state}) => {
  return new Promise(() => {
    let name = state.selected_annotation;
    console.log("Getting annotation: "+name);
    commit("setIsLoadingAnnotation", true);
    axios.get(ANNOTATION_GET_ENDPOINT(name))
      .then(response => {
        console.log("Got response for annotation: "+name);
        const {data} = response;
        commit("setAnnotationPayload", data);
      })
      .catch(e => console.error("Error getting annotation: "+e))
      .finally(() => {
        commit("setIsLoadingAnnotation", false);
      });
  });
};

export const actionGetSelectedAgreement = ({commit, state}) => {
  return new Promise(() => {
    let name = state.selected_agreement;
    console.log("Getting agreement: "+name);
    commit("setIsLoadingAgreement", true);
    axios.get(AGREEMENT_GET_ENDPOINT(name))
      .then(response => {
        console.log("Got response for agreement: "+name);
        const {data} = response;
        commit("setAgreementPayload", data);
      })
      .catch(e => console.error("Error getting agreement: "+e))
      .finally(() => {
        commit("setIsLoadingAgreement", false);
      });
  });
};

export const actionRefreshStatisticsOfAgreement = ({commit, state}) => {
  return new Promise(() => {
    if (state.selected_agreement !== "") {
      console.log("Getting refreshed statistics of agreement: " + state.selected_agreement);
      commit("setIsRefreshingAgreement", true);
      axios.post(AGREEMENT_REFRESH_STATISTICS_ENDPOINT, {
        created_at: state.agreement_created_at,
        dataset: state.agreement_dataset,
        name: state.selected_agreement,
        annotation_names: state.agreement_annotation_names,
        tokens: state.tokens,
        tore_relationships: state.agreement_tore_relationships,
        code_alternatives: state.agreement_code_alternatives,
        docs: state.docs.slice(1, state.docs.length),
        agreement_statistics: state.agreement_statistics
      })
        .then(response => {
          console.log("Got response for agreement statistics");
          const {data} = response;
          commit("setStatisticsForAgreement", data);
        })
        .catch(e => console.error("Error updating statistics of agreement: " + e))
        .finally(() => {
          commit("setIsRefreshingAgreement", false);
        });
    }
  });
};

export const actionGetAllAnnotations = ({commit}) => {
  return new Promise(() => {
    console.log("Getting all annotations...");
    commit("setIsLoadingAvailableAnnotations", true);
    axios.get(ANNOTATION_GET_ALL_ENDPOINT)
      .then(response => {
        console.log("Got all annotations: ");
        const {data} = response;
        console.log(data);
        commit("setAvailableAnnotations", data);
      })
      .catch(e => console.error("Error getting all annotations: "+e))
      .finally(() => {
        commit("setIsLoadingAvailableAnnotations", false);
      });
  });
};

export const actionGetAllAgreements = ({commit}) => {
  return new Promise(() => {
    console.log("Getting all agreements...");
    commit("setIsLoadingAvailableAgreements", true);
    axios.get(AGREEMENT_GET_ALL_ENDPOINT)
      .then(response => {
        console.log("Got all agreements: ");
        const {data} = response;
        console.log(data);
        commit("setAvailableAgreements", data);
      })
      .catch(e => console.error("Error getting all agreements: "+e))
      .finally(() => {
        commit("setIsLoadingAvailableAgreements", false);
      });
  });
};

export const actionPostCurrentAnnotation = ({state, commit}) => {
  return new Promise(() => {
    console.log("Posting annotation: "+state.selected_annotation);
    commit("postAnnotationCallback");
    let postTokens = [];
    for (let t of state.tokens){
      postTokens.push({...t,
        num_name_codes: state.token_num_name_codes[t.index],
        num_tore_codes: state.token_num_tore_codes[t.index]});
    }
    axios.post(ANNOTATION_POST_ENDPOINT, {
      uploaded_at: state.annotator_uploaded_at,
      dataset: state.annotator_dataset,
      name: state.selected_annotation,
      tokens: postTokens,
      tore_relationships: state.tore_relationships,
      codes: state.codes,
      docs: state.docs.slice(1, state.docs.length)
    })
      .then(() => {
        console.log("Got annotation POST response");
      })
      .catch(e => console.error("Error POSTing annotation: "+e));
  });
};

export const actionPostCurrentAgreement = ({state, commit}) => {
  return new Promise(() => {
    if (state.selected_agreement !== "") {
      console.log("Posting agreement: "+state.selected_agreement);
      commit("postAgreementCallback");
      axios.post(AGREEMENT_POST_ENDPOINT, {
        created_at: state.agreement_created_at,
        dataset: state.agreement_dataset,
        name: state.selected_agreement,
        annotation_names: state.agreement_annotation_names,
        tokens: state.tokens,
        tore_relationships: state.agreement_tore_relationships,
        code_alternatives: state.agreement_code_alternatives,
        docs: state.docs.slice(1, state.docs.length),
        agreement_statistics: state.agreement_statistics
      })
        .then(() => {
          console.log("Got agreement POST response");
        })
        .catch(e => console.error("Error POSTing agreement: "+e));
    }
  });
};

export const actionDeleteAnnotation = ({dispatch, commit}, name) => {
  return new Promise(() => {
    console.log("Deleting annotation: "+name);
    commit("setIsLoadingAvailableAnnotations", true);
    axios.delete(ANNOTATION_DELETE_ENDPOINT(name))
      .then(() => {
        console.log("Annotation deleted, fetching available...");
        dispatch("actionGetAllAnnotations").finally(() =>
          commit("setIsLoadingAvailableAnnotations", false));
      })
      .catch(e => {
        console.error("Error deleting annotation: " + e);
      })
      .finally(() => {
        commit("setIsLoadingAvailableAnnotations", false);
      });
  });
};

export const actionDeleteAgreement = ({dispatch, commit}, name) => {
  return new Promise(() => {
    console.log("Deleting agreement: "+name);
    commit("setIsLoadingAvailableAgreements", true);
    axios.delete(AGREEMENT_DELETE_ENDPOINT(name))
      .then(() => {
        console.log("Agreement deleted, fetching available...");
        dispatch("actionGetAllAgreements").finally(() =>
          commit("setIsLoadingAvailableAgreements", false));
      })
      .catch(e => {
        console.error("Error deleting agreement: " + e);
      })
      .finally(() => {
        commit("setIsLoadingAvailableAgreements", false);
      });
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

// reddit crawler
export const actionCrawlReddit = ({dispatch, commit}, settings) => {
  return new Promise(() => {
    console.log("Initialize Reddit Crawl");
    commit("setIsLoadingRedditCrawler", true);

    axios
      .post(REDDIT_CRAWLER_ENDPOINT, settings)
      .then(() => {
        console.log("Crawling finished");
        commit("setIsLoadingRedditCrawler", false);
      })
      .catch(e => console.error("Error: "+e));
  });
};

export const actionGetCrawlerJobs = ({commit}) => {
  return new Promise(() => {
    console.log("Getting all crawler jobs");
    commit("setIsLoadingCrawlingJobs", true);
    axios.get(REDDIT_CRAWLER_GET_JOBS_ENDPOINT)
      .then(response => {
        console.log("Got all crawler jobs: ");
        const {data} = response;
        console.log(data);
        commit("setAvailableCrawlerJobs", data);
        return response;
      })
      .catch(e => console.error("Error: "+e))
      .finally(() => {
        commit("setIsLoadingCrawlingJobs", false);
      });
  });
};

export const ActionPostCrawlerJobData = ({commit}, crawlerData) => {
  return new Promise((resolve, reject) => {
    console.log("Posting crawler data");
    axios.post(POST_CRAWLER_DATA_ENDPOINT, crawlerData)
      .then(r => {
        commit("setCrawlerData", crawlerData);
        resolve(r);
      })
      .catch(e => {
        console.error("Error posting data: "+e);
        reject(e);
      });
  });
};

