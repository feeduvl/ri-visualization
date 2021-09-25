/* eslint-disable keyword-spacing,camelcase,no-param-reassign,valid-jsdoc */
import Vue from 'vue';
import {
  Code_add_relationship,
  Code_remove_relationship,
  CodeToString, TORERelationship,
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

/**
 * @param state
 * @param tore_relationship
 */
export const delete_tore_relationship = (state, tore_relationship) => {

  Code_remove_relationship(state.codes[tore_relationship.TOREEntity], tore_relationship);

  Vue.set(state.tore_relationships, tore_relationship.index, null);

  if(state.selected_tore_relationship && state.selected_tore_relationship.index === tore_relationship.index){
    state.selected_tore_relationship = null;
  }
}; 

/**
 * Created a new code relationship and adds the currently selected code to it
 * linker should already be open and tokens selected
 * @param state
 * @param firstToken initial token, more may follow
 */
export const new_tore_relationship = (state, firstToken) => {
  console.log("new_tore_relationship for selected code: "+CodeToString(state.selected_code));
  let relationship = new TORERelationship(state.selected_code, [firstToken.index], state.tore_relationships.length);
  Code_add_relationship(state.selected_code, relationship);
  state.selected_tore_relationship = relationship;
  state.tore_relationships.push(relationship);
}; 

export const add_or_remove_token_selected_relationship = (state, token) => {
  console.log("Adding/Removing token: ... to current relationship: "+state.selected_tore_relationship.index);
  console.log(token);
  if(state.selected_tore_relationship === null){
    console.error("add_or_remove_token_selected_relationship called while selected tore relationship is null");
  } else if(!TORERelationship_add_token(state.selected_tore_relationship, token)){
    TORERelationship_remove_token(state.selected_tore_relationship, token);
  }
}; export const 

  setIsLinking = (state, isLinking) => {
    state.isLinking = isLinking;
    if(!isLinking){
      state.selected_tore_relationship = null;
    }
  };
export const

  setAnnotatorInputVisible=(state, visible) => {
    console.log("setAnnotatorInputVisible: "+visible);
    state.annotatorInputVisible = visible;
    if(!visible){
      state.isLinking = false;
      state.selectedToken = null;
      state.selected_code = null;
      state.selected_tore_relationship = null;
    }
  }; export const 

  set_selected_code = (state, code) => {
    console.log("Set selected code: "+CodeToString(code));
    state.selected_code = code;
  }; export const 

  setHoveringToken = (state, token) => {
    state.hoveringToken = token;
    if(token===null){
      state.hovering_codes = [];
      return;
    }
    let ind = token.index;

    let hovering_codes = [];

    if(token.num_codes > 0){   // better than filtering because we terminate search asap
      let remaining_codes = token.num_codes;
      for(let code of state.codes){
        if(code.tokens.includes(ind)){
          hovering_codes.push(code);
          remaining_codes--;
        }
        if(remaining_codes <= 0){
          break;
        }
      }
    }
    state.hovering_codes = hovering_codes;
  }; export const 

  setSelectedToken = (state, token) => {
  //console.log("Selected token is: "+token)
    state.selectedToken = token;
  };

export const updateCodeName = (state, note) => {
  state.selected_code.name = note;
}; export const 

  updateCodeTore = (state, tore) => {
    state.selected_code.tore = tore;
  }; export const 

  setSelectedToreRelationship = (state, relationship) => {
    console.log("Setting selected relationship: "+relationship.index);
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

export const updateDocTokens = state => {
  let docTokens = state.tokens?state.tokens.slice(state.selected_doc, state.selected_doc.end_index):[];
  Object.freeze(docTokens);
  state.doc_tokens = docTokens;
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

export const resetAnnotator = state => {
  state.isLoadingAvailableAnnotations = false;
  state.isLoadingAnnotation = false;
  state.selected_algo_result = null;
  state.lastAnnotationEditAt = null;
  state.lastAnnotationPostAt = null;

  state.annotator_dataset = null;
  state.annotator_uploaded_at = null;
  state.selected_annotation = null;
  state.selected_doc = null;
  state.selected_pos_tags = [];
  state.selected_algo_result = null;

  state.tokens = [];
  state.docs = [];
  state.codes = [];
  state.tore_relationships = [];
};