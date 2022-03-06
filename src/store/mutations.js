/* eslint-disable keyword-spacing,camelcase,no-param-reassign,valid-jsdoc */
import Vue from 'vue';
import {
  TORERelationship_add_token,
  TORERelationship_remove_token,
  TORERelationship_set_relationship_name
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
export const setNewRelationshipName = (state, name) => {
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

export const add_or_remove_token_selected_relationship_in_agreement = (state, token) => {
  console.log("Adding/Removing token: ... to current relationship: "+state.newToreRelationship.index);
  if(state.newToreRelationship === null){
    console.error("add_or_remove_token_selected_relationship called while selected tore relationship is null");
  } else {

    for(let token_index of state.newToreRelationship.target_tokens){
      Vue.set(state.token_linked_together, token_index, false);
    }

    if(!TORERelationship_add_token(state.newToreRelationship, token)){
      TORERelationship_remove_token(state.newToreRelationship, token);
    }
    for(let token_index of state.newToreRelationship.target_tokens){
      Vue.set(state.token_linked_together, token_index, true);
    }
  }
};

export const setSelectedToken = (state, token) => {
  //console.log("Selected token is: "+token)
    state.selectedToken = token;
  };

export const updateCodeName = (state, name) => {
  console.log("Update selected code name: "+name);
  let beforeName = state.selected_code.name;
  state.selected_code.name = name;
  if(name && !beforeName){
    for(let t_index of state.selected_code.tokens){
      state.token_num_name_codes[t_index]++;
    }
  } else if(!name && beforeName){
    for(let t_index of state.selected_code.tokens){
      state.token_num_name_codes[t_index]--;
    }
  }
};

export const updateCodeTore = (state, tore) => {
  let beforeTore = state.selected_code.tore;
  state.selected_code.tore = tore;
  if(tore && !beforeTore){
    for(let t_index of state.selected_code.tokens){
      state.token_num_tore_codes[t_index]++;
    }
  } else if(!tore && beforeTore){
    for(let t_index of state.selected_code.tokens){
      state.token_num_tore_codes[t_index]--;
    }
  }
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
  };export const

  setNewToreRelationship = (state, relationship) => {
    console.log("Setting new relationship: "+(relationship===null?'null':relationship.index));

    if(state.newToreRelationship !== null){
      for(let token_index of state.newToreRelationship.target_tokens){
        Vue.set(state.token_linked_together, token_index, false);
      }
    }

    if(relationship !== null){
      for(let token_index of relationship.target_tokens){
        Vue.set(state.token_linked_together, token_index, true);
      }
    }
    state.newToreRelationship = relationship;
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

export const setTores = (state, tores) => {
  state.tores = tores;
};

export const setRelationshipNames = (state, relationship_names) => {
  state.relationship_names = relationship_names;
};

export const setRelationshipOwners = (state, owners) => {
  state.relationship_owners = owners;
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

export const setIsLoadingAgreement = (state, isLoading) => {
  state.isLoadingAgreement = isLoading;
};

export const setIsLoadingAvailableAgreements = (state, isLoading) => {
  state.isLoadingAvailableAgreements = isLoading;
};

export const postAgreementCallback = state => {
  state.lastAgreementPostAt = Date.now();
};

export const updateSelectedAgreement = (state, value) => {
  state.selected_agreement = value;
};

export const updateLastAgreementEditAt = state => {
  state.lastAgreementEditAt = Date.now();
};

export const initTokensEfficiencyStructs = (state, tear_down) => {
  console.warn("Initializing token efficiency structs");
  let token_in_selected_code = [];
  //let token_pos_selected = [];
  //let token_is_algo_lemma = [];
  let token_linked_together = [];
  let token_num_name_codes = [];
  let token_num_tore_codes = [];

  if(!tear_down){
    // eslint-disable-next-line no-unused-vars
    for(let t of state.tokens){
      token_in_selected_code.push(false);
      //token_pos_selected.push(false)
      //token_is_algo_lemma.push(false)
      token_linked_together.push(false);
      token_num_name_codes.push(t.num_name_codes);
      token_num_tore_codes.push(t.num_tore_codes);
    }
  }
  state.token_in_selected_code = token_in_selected_code;
  state.token_linked_together = token_linked_together;
  state.token_num_name_codes = token_num_name_codes;
  state.token_num_tore_codes = token_num_tore_codes;

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

export const toggleAnnotatorViewingCodes = (state, show) => {
  state.annotatorViewingCodeResults = show;
  console.log("Toggled annotator code view to: "+state.annotatorViewingCodeResults);
};

export const toggleAgreementViewingCodes = (state, show) => {
  state.agreementViewingCodeResults = show;
  console.log("Toggled agreement code view to: "+state.agreementViewingCodeResults);
};

export const changeStatusOfCodeAlternative = (state, change) => {
  console.log("Status of index "+change.index + " changed to: "+change.status);
  state.agreement_code_alternatives[change.index].merge_status = change.status;
};

export const updateIsCompleted = state => {
  console.log("Check completion status of agreement");
  let isComplete = true;
  state.agreement_code_alternatives.forEach(function (item, index) {
    if(item.merge_status === "Pending") {
      isComplete = false;
    }
  });
  state.agreement_is_completed = isComplete;
};

export const initResolvedStatusOfTokens = state => {
  console.log("Initializing resolved status of agreement");
  let unResolvedCodesPerToken = [];

  state.tokens.forEach(function (item, index){
    let unresolvedAlternatives = [];
    let hasSomeAlternativeCode = false;
    state.agreement_code_alternatives.forEach(function (item1){
      let alternativeCode = item1.code;
      if (alternativeCode.tokens.includes(item.index)){
        hasSomeAlternativeCode = true;
        if (item1.merge_status === "Pending"){
          unresolvedAlternatives.push(item1.index);
          console.log(unresolvedAlternatives);
        }
      }
    });
    if (hasSomeAlternativeCode){
      unResolvedCodesPerToken.push(unresolvedAlternatives);
    } else {
      unResolvedCodesPerToken.push([null]);
    }
  });

  state.unResolvedCodesPerToken = unResolvedCodesPerToken;
};

export const incrementMaxCodeIndices = state => {
  state.maxIndexCodes++;
  state.maxIndexCodeAlternatives++;
};

export const addNewCodeAlternative = (state, newCodeAlternative) => {
  state.agreement_code_alternatives.push(newCodeAlternative);
};

export const updateResolvedStatusOfTokens = (state, {tokens, codeIndex}) => {
  console.log("Updating resolved status of agreement");
  tokens.forEach(function (tokenIndex) {
    state.unResolvedCodesPerToken[tokenIndex] = state.unResolvedCodesPerToken[tokenIndex].filter(obj => {
      return obj !== codeIndex;
    });
  });
};

// Verschiebe an andere Stelle! Vielleicht in Agreement berechnen, an selection weitergeben?
export const getAllAlternativesOfToken = (state, tokenIndex) => {
  console.log("Getting all alternatives for token" + tokenIndex);
  let alternatives = [];
  state.agreement_code_alternatives.forEach(function (item1){
    let alternativeCode = item1.code;
    if (alternativeCode.tokens.includes(tokenIndex)){
      alternatives.push(item1);
    }
  });
  return alternatives;
};

export const prepareParametersForAnnotationExport = (state, annotationName) => {
  console.log("Setting name to:");
  console.log(annotationName);
  state.exportedAnnotationName = annotationName;
  if (state.agreement_is_completed){
    let acceptedAlternatives = state.agreement_code_alternatives.filter(obj => {
      return obj.merge_status === "Accepted";
    }).map(acc => acc.code);

    let usedRelationshipIndices = new Set([]);
    acceptedAlternatives.forEach(function (item) {
      item.relationship_memberships.forEach(function (item1){
        usedRelationshipIndices.add(item1);
      });
    });

    let usedToreRelationships = state.agreement_tore_relationships.filter(obj => {
      let isFound = false;
      usedRelationshipIndices.forEach(function (item) {
        if (item === obj.index) {
          isFound = true;
        }
      });
      return isFound;
    });

    let newTokens = [];

    state.tokens.forEach(function (item, index){
      let numNameCodes = 0;
      let numToreCodes = 0;
      acceptedAlternatives.forEach(function (item1){
        if (item1.tokens.includes(item.index)){
          if (item1.tore !== ""){
            numToreCodes++;
          }
          if (item1.name !== ""){
            numNameCodes++;
          }
        }
      });
      let newToken = {
        index: item.index,
        name: item.name,
        lemma: item.lemma,
        pos: item.pos,
        num_name_codes: numNameCodes,
        num_tore_codes: numToreCodes
      };
      newTokens.push(newToken);
    });

    state.exportedAnnotationTORERelationships = usedToreRelationships;
    state.exportedAnnotationCodes = acceptedAlternatives;
    state.exportedAnnotationTokens = newTokens;
  }
};