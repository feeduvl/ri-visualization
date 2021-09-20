/* eslint-disable keyword-spacing,camelcase,no-param-reassign,valid-jsdoc */
import Vue from 'vue';
import {ClusterRelationship} from "../components/annotator/token_cluster";

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

export const setTokens = (state, tokens) => {
  state.tokens = tokens;
};

export const setTokenClusters = (state, token_clusters) => {
  state.token_clusters = token_clusters;
};

export const setClusterRelationships = (state, cluster_relationships) => {
  state.cluster_relationships = cluster_relationships;
};

/**
 * Applied to currently selected cluster relationship
 * @param state
 * @param name
 */
export const setRelationshipName = (state, name) => {
  state.selectedClusterRelationship.set_relationship_name(state.selectedTokenCluster, name);
};

export const setDisplaySnackbarNoMultiClusters = (state, value) => {
  state.displaySnackbarNoMultiClusters = value;
};

/**
 * @param state
 * @param cluster_relationship if undefined; will delete currently selected
 */
export const deleteClusterRelationship = (state, cluster_relationship) => {
  let index;
  if(cluster_relationship===undefined){
    index = state.selectedClusterRelationship.index;
  } else {
    index = cluster_relationship.index;
  }

  for(let i of state.cluster_relationships[index].token_clusters){
    state.token_clusters[i].remove_relationship(state.cluster_relationships[index]);
  }

  Vue.set(state.cluster_relationships, index, null);
  if(state.hoveringClusterRelationship && state.hoveringClusterRelationship.index===index){
    state.hoveringClusterRelationship = null;
  }
  if(state.selectedClusterRelationship && state.selectedClusterRelationship.index === index){
    state.selectedClusterRelationship = null;
  }

  this.commit("setIsLinking", false);  //  close the linker and clear 'selected' relationship
};

/**
 * Created a new cluster relationship and adds the currently selected token cluster to it
 * @param state
 */
export const newClusterRelationship = state => {
  let relationship = new ClusterRelationship(state.cluster_relationships.length);
  state.selectedClusterRelationship = relationship;
  state.cluster_relationships.push(relationship);
  relationship.add_cluster(state.selectedTokenCluster);
  this.commit("setIsLinking", true);  //  open the linker
};

export const setIsLinking = (state, isLinking) => {
  state.isLinking = isLinking;
  if(!isLinking){
    state.selectedClusterRelationship = null;
    state.hoveringClusterRelationship = null;  // not necessary
  }
};

export const addClusterToSelectedRelationship = (state, token_cluster) => {
  state.selectedClusterRelationship.add_cluster(token_cluster);
};

export const deleteSelectedTokenCluster = state => {
  let token_indices = state.selectedTokenCluster.tokens;
  let index = state.selectedTokenCluster.index;

  if(state.hoveringTokenCluster === state.selectedTokenCluster){
    state.hoveringTokenCluster = null;
  }

  for(let i of state.selectedTokenCluster.relationship_memberships){
    state.cluster_relationships[i].remove_cluster(state.selectedTokenCluster.index);
    if(state.cluster_relationships[i].token_clusters.filter(t_c => t_c).length < 2){  // don't count nulls
      console.log(`vuex.js: not enough clusters left in relationship ${i}; deleting relationship`);
      this.commit("deleteClusterRelationship", state.cluster_relationships[i]);
    }
  }

  state.selectedTokenCluster = null;

  for(let i of token_indices){
    state.tokens[i].token_cluster = null;
  }

  Vue.set(state.token_clusters, index, null);

};

export const setAnnotatorInputVisible = (state, visible) => {
  state.annotatorInputVisible = visible;
  if(!visible){
    state.isLinking = false;
    state.selectedToken = null;
    state.selectedTokenCluster = null;
    state.selectedClusterRelationship = null;
  }
};

export const setSelectedTokenCluster = (state, cluster) => {
  state.selectedTokenCluster = cluster;
};

export const setHoveringToken = (state, token) => {
  state.hoveringToken = token;
  if(token===null){
    state.hoveringClusterRelationship = null;
    state.hoveringTokenCluster = null;
    return;
  }

  let cluster_index = token.token_cluster;
  let cluster = cluster_index===null?null:state.token_clusters[cluster_index];
  state.hoveringTokenCluster = cluster;
  if(cluster===null || cluster.relationship_memberships.length === 0){
    state.hoveringClusterRelationship = null;
  } else {
    // eslint-disable-next-line no-warning-comments
    state.hoveringClusterRelationship = state.cluster_relationships[cluster.relationship_memberships[0]];  // TODO use the first for now
  }
};

export const setSelectedToken = (state, token) => {
  token = state.tokens[token.index];
  state.selectedToken = token;
  // eslint-disable-next-line no-eq-null
  this.commit("setSelectedTokenCluster", token.token_cluster==null?null:state.token_clusters[token.token_cluster]);
};

/**
 * If using `new_cluster`; the `index` attribute of the new cluster MUST be set to the length of `state.token_clusters` prior to this method being called
 * @param state
 * @param args
 */
export const assignToCluster = (state, args) => {
  const {token, token_cluster, new_cluster} = args;
  if(!token_cluster.add_token(token)){
    state.displaySnackbarNoMultiClusters = true;
  }
  if(new_cluster){
    state.token_clusters.push(token_cluster);
  }
};

// eslint-disable-next-line no-warning-comments
export const resetAnnotator = state => {  // TODO add a tokens argument
  state.token_clusters = [];
  state.cluster_relationships = [];

  for(let i = 0; i < state.tokens.length; i++){
    Vue.set(state.tokens[i], "index", i);
  }
};

export const updateTokenClusterNote = (state, note) => {
  state.selectedTokenCluster.name = note;
};

export const updateTokenClusterTore = (state, tore) => {
  state.selectedTokenCluster.tore = tore;
};