/* eslint-disable keyword-spacing,camelcase,no-param-reassign,valid-jsdoc */
import Vue from 'vue';
import {
  TORERelationship_add_token, TORERelationship_set_relationship_name, TORERelationship_remove_token
} from "../components/annotator/code";

export const mutateInitialData = (state, initialData) => {
  state.tweets = Object.assign({}, state.tweets, initialData);
  state.initialDataLoaded = state.twitterAccounts.every(function (item) {
    return Object.prototype.hasOwnProperty.call(state.tweets, item);
  });
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

// ANNOTATOR STUFF

/**
* @param state
* @param tore_relationship
* @param name
*/
export const setRelationshipName = (state, name) => {
  TORERelationship_set_relationship_name(state.selected_tore_relationship, name);
};

export const add_or_remove_token_selected_relationship = (state, token) => {
  console.log("Adding/Removing token: ... to current relationship: "+state.selected_tore_relationship.index);
  if(state.selected_tore_relationship === null){
    console.error("add_or_remove_token_selected_relationship called while selected tore relationship is null");
  } else {
    //console.log(state.selected_tore_relationship.target_tokens)

    for(let token_index of state.selected_tore_relationship.target_tokens){
      Vue.set(state.token_linked_together, token_index, false);
    }

    if(!TORERelationship_add_token(state.selected_tore_relationship, token)){
      TORERelationship_remove_token(state.selected_tore_relationship, token);
    }
    for(let token_index of state.selected_tore_relationship.target_tokens){
      Vue.set(state.token_linked_together, token_index, true);
    }
    //console.log(state.selected_tore_relationship.target_tokens)
  }
}; 
export const 

  setHoveringToken = (state, token) => {//console.log("vuex setHoveringToken")
    // notify token changes
    if(state.hoveringToken !== null){
      Vue.set(state.token_is_hovering_token, state.hoveringToken.index, false);
    }
    if(token !== null){
      Vue.set(state.token_is_hovering_token, token.index, true);
    }

    state.hoveringToken = token;

    // notify hovering code changes
    let hovering_codes = [];
    if(token !== null){
      let ind = token.index;
      if(state.token_num_codes > 0){   // better than filtering because we terminate search asap
        let remaining_codes = state.token_num_codes;
        for(let code of state.codes){
          if(code === null){
            // eslint-disable-next-line no-continue
            continue;
          }
          if(code.tokens.includes(ind)){
            hovering_codes.push(code);
            remaining_codes--;
          }
          if(remaining_codes <= 0){
            break;
          }
        }
      }
    }

    for(let code of state.hovering_codes){
      for(let token_index of code.tokens){
        Vue.set(state.token_is_hovering_code, token_index, false);  // old tokens no longer in hovering code
      }
    }
    for(let code of hovering_codes){
      for(let token_index of code.tokens){
        Vue.set(state.token_is_hovering_code, token_index, true);  // new tokens are in hovering code
      }
    }

    state.hovering_codes = hovering_codes;
  }; export const 

  setSelectedToken = (state, token) => {
  //console.log("Selected token is: "+token)
    state.selectedToken = token;
  };

export const updateCodeName = (state, name) => {
  console.log("Update selected code name: "+name);
  state.selected_code.name = name;
};

export const updateCodeTore = (state, tore) => {
  state.selected_code.tore = tore;
}; export const 

  setSelectedToreRelationship = (state, relationship) => {
    console.log("Setting selected relationship: "+(relationship===null?'null':relationship.index));

    if(state.selected_tore_relationship !== null){
      for(let token_index of state.selected_tore_relationship.target_tokens){
        Vue.set(state.token_linked_together, token_index, false);
      }
    }

    if(relationship !== null){
      for(let token_index of relationship.target_tokens){
        Vue.set(state.token_linked_together, token_index, true);
      }
    }
    state.selected_tore_relationship = relationship;
  };

export const updateSelectedDoc = (state, value) => {
  state.selected_doc = value;
};

export const updateSelectedAlgoResult = (state, value) => {
  state.selected_algo_result = value;
};

export const updateSelectedPosTags = (state, value) => {
  state.selected_pos_tags = value;
};

export const updateDocTokens = state => {/*
  let docTokens = state.tokens?state.tokens.slice(state.selected_doc.begin_index, state.selected_doc.end_index):[];
  for(let t of docTokens){
    Object.freeze(t);
  }
  Object.freeze(docTokens);
  state.doc_tokens = docTokens;*/
};

export const setIsLoadingAnnotation = (state, isLoading) => {
  state.isLoadingAnnotation = isLoading;
};

export const setIsLoadingAvailableAnnotations = (state, isLoading) => {
  state.isLoadingAvailableAnnotations = isLoading;
};

export const postAnnotationCallback = state => {
  state.lastAnnotationPostAt = Date.now();
};

export const updateSelectedAnnotation = (state, value) => {
  state.selected_annotation = value;
};

export const updateLastAnnotationEditAt = state => {
  state.lastAnnotationEditAt = Date.now();
};

export const initTokensEfficiencyStructs = (state, tear_down) => {
  console.warn("Initializing token efficiency structs");
  let token_in_selected_code = [];
  //let token_pos_selected = [];
  //let token_is_algo_lemma = [];
  let token_is_hovering_code = [];
  let token_linked_together = [];
  let token_is_hovering_token = [];
  let token_num_codes = [];

  if(!tear_down){
    // eslint-disable-next-line no-unused-vars
    for(let t of state.tokens){
      token_in_selected_code.push(false);
      //token_pos_selected.push(false)
      //token_is_algo_lemma.push(false)
      token_is_hovering_code.push(false);
      token_linked_together.push(false);
      token_is_hovering_token.push(false);
      token_num_codes.push(t.num_codes);
    }
  }
  state.token_in_selected_code = token_in_selected_code;
  //state.token_pos_selected = token_pos_selected;
  //state.token_is_algo_lemma = token_is_algo_lemma;
  state.token_is_hovering_code = token_is_hovering_code;
  state.token_linked_together = token_linked_together;
  state.token_is_hovering_token = token_is_hovering_token;
  state.token_num_codes = token_num_codes;

};

export const setTokensInSelectedCode = (state, [lastSelectedCode, selectedCode]) => {

  let lastWasNull = lastSelectedCode=== null;
  let newIsNull = selectedCode === null;

  let lastSelectedTokens = lastWasNull ? [] : lastSelectedCode.tokens;
  let newSelectedTokens = newIsNull ? [] : selectedCode.tokens;

  for(let lastToken of lastSelectedTokens){
    Vue.set(state.token_in_selected_code, lastToken, false);
  }
  for(let newToken of newSelectedTokens){
    Vue.set(state.token_in_selected_code, newToken, true);
  }
};

export const toggleAnnotatorViewingCodes = state => {
  state.annotatorViewingCodeResults = !state.annotatorViewingCodeResults;
  console.log("Toggled annotator code view to: "+state.annotatorViewingCodeResults);
};
