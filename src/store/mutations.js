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

// ANNOTATOR AND AGREEMENT STUFF

/**
* @param state
* @param tore_relationship
* @param name
*/
export const setRelationshipName = (state, name) => {
  TORERelationship_set_relationship_name(state.selected_tore_relationship, name);
};
export const setNewRelationshipName = (state, name) => {
  state.newToreRelationship.relationship_name = name;
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

export const updateSelectedTores = (state, value) => {
  state.selected_tores = value;
};

export const setTores = (state, tores) => {
  state.tores = tores;
};

export const setRecommendationTores = (state, recommendationTores) => {
  state.recommendationTores = recommendationTores;
};

export const setShowRecommendationTore = (state, isChecked) => {
  state.showRecommendationTore = isChecked;
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

export const setIsRefreshingAgreement = (state, isLoading) => {
  state.setIsRefreshingAgreement = isLoading;
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
  state.agreement_code_alternatives.forEach(function (item) {
    if(item.merge_status === "Pending") {
      isComplete = false;
    }
  });
  state.agreement_is_completed = isComplete;
};

export const initResolvedStatusOfTokens = state => {
  console.log("Initializing resolved status of agreement");
  let unResolvedCodesPerToken = [];

  state.tokens.forEach(function (item){
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

export const updateResolvedStatusOfTokensAfterTokenAdd = (state, newCodeAlternative) => {
  console.log("Updating resolved status of agreement");
  let listOfTokensToUpdate = newCodeAlternative.code.tokens;
  listOfTokensToUpdate.forEach(function (value) {
    let currentState = state.unResolvedCodesPerToken[value];
    if (currentState[0] === null){
      state.unResolvedCodesPerToken[value] = [];
    }
  });
};

export const incrementMaxCodeIndices = state => {
  state.maxIndexCodes++;
  state.maxIndexCodeAlternatives++;
};

export const resetNewRelationship = state => {
  state.newToreRelationship = null;
};

export const resetNewTokensToAdd = state => {
  state.newTokensToAdd = [];
};

export const resetNewRelationships = state => {
  state.newToreRelationships = [];
  state.newToreRelationship = null;
};

export const incrementMaxRelationshipIndices = (state, numberOfNewRelationships) => {
  if (state.maxIndexToreRelationships === null) {
    state.maxIndexToreRelationships = 0;
  } else {
    state.maxIndexToreRelationships += numberOfNewRelationships;
  }
};

export const addNewCodeAlternative = (state, newCodeAlternative) => {
  state.agreement_code_alternatives.push(newCodeAlternative);
};

export const addNewToreRelationships = (state, newToreRelationships) => {
  newToreRelationships.forEach(function (value) {
    state.agreement_tore_relationships.push(value);
  });
};

export const updateResolvedStatusOfTokens = (state, {tokens, codeIndex}) => {
  console.log("Updating resolved status of agreement");
  tokens.forEach(function (tokenIndex) {
    state.unResolvedCodesPerToken[tokenIndex] = state.unResolvedCodesPerToken[tokenIndex].filter(obj => {
      return obj !== codeIndex;
    });
  });
};

export const setIsLoadingRedditCrawler = (state, isLoading) => {
  state.isLoadingRedditCrawler = isLoading;
};

export const setIsLoadingAppReviewCrawler = (state, isLoading) => {
  state.isLoadingAppReviewCrawler = isLoading;
};

export const setIsLoadingRecommendationUpdate = (state, isLoading) => {
  state.isLoadingRecommendationUpdate = isLoading;
};

export const setIsLoadingRecommendation = (state, isLoading) => {
  state.isLoadingRecommendation = isLoading;
};

export const setAnnotatorInputCodeNames = state => {
  console.log("set codeNames");
  let codeNames = [];
  for (let i = 0; i < state.codes.length; i++){
    if (state.codes[i] && state.codes[i].name){
      codeNames.push(state.codes[i].name);
    }
  }
  state.annotatorInputCodeNames = codeNames;
};

// Jira Dashboard

export const setDataToExport = (state, value) => {
  state.dataToExport = value || [];
};

export const setToreDataToExport = (state, value) => {
  state.toreDataToExport = value || [];
};
export const setAvailableJiraProjects = (state, projects) => {
  state.availableJiraProjects = projects || [];
};

export const setImportedJiraProjects = (state, projects) => {
  state.importedJiraProjects = projects || [];
};

export const setAssignedIssuesFromFeedback = (state, issues) => {
  state.assignedIssues = issues.related_issues || [];
  state.totalAssignedIssueItems = issues.totalItems || 0;
};

export const setToreAssignedIssuesFromFeedback = (state, issues) => {
  state.toreAssignedIssues = issues.related_issues || [];
  state.totalToreAssignedIssueItems = issues.totalItems || 0;
};

export const setIssueTypes = (state, issueTypes) => {
  state.issueTypes = issueTypes || [];
};

export const setIssuesToImport = (state, issues) => {
  state.issuesToImport = issues || [];
};

export const setIsLoadingData = (state, value) => {
  state.isLoadingData = value || false;
};

export const setAllIssues = (state, issues) => {
  state.issues = issues.issues || [];
  state.totalIssueItems = issues.totalItems || 0;
};

export const setUnassignedIssues = (state, issues) => {
  state.unassignedIssues = issues.missing_issues || [];
  state.totalUnassignedIssueItems = issues.totalItems || 0;
};

export const setAllFeedback = (state, feedback) => {
  state.feedback = feedback.feedback || [];
  state.totalFeedbackItems = feedback.totalItems || 0;
};

export const setFeedbackFileNames = (state, feedbackFileNames) => {
  state.feedbackFileNames = feedbackFileNames || [];
};

export const setAnnotationFileNames = (state, annotationFileNames) => {
  state.annotationFileNames = annotationFileNames || [];
};

export const setAssignedFeedback = (state, feedback) => {
  state.assignedFeedback = feedback.feedback || [];
  state.totalAssignedFeedbackItems = feedback.totalItems || 0;
};

export const setToreAssignedFeedback = (state, feedback) => {
  state.toreAssignedFeedback = feedback.feedback || [];
  state.totalToreAssignedFeedbackItems = feedback.totalItems || 0;
};

export const setUnassignedFeedback = (state, feedback) => {
  state.unassignedFeedback = feedback.feedback || [];
  state.totalUnassignedFeedbackItems = feedback.totalItems || 0;
};

