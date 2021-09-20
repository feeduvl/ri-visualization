import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import sentiment from './modules/sentiment';
import * as mutations from './mutations';
import {NOUN_COLOR, VERB_COLOR, ADJECTIVE_COLOR} from "@/components/annotator/resources/color";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    topBarTitle: 'Dashboard',
    projectTitle: 'Requirements Intelligence',
    topBarLogo: require('@/assets/openreq_logo.png'),
    topBarAltText: 'openreq',
    topBarLink: 'https://openreq.eu/',
    footer: "— Christoph Stanik\n" +
        "      <strong>\n" +
        "        <a href=\"https://openreq.eu/\">@OpenReq</a>\n" +
        "      </strong>",
    twitterAccounts: [],
    tweets: {},
    selectedTwitterAccounts: [],
    selectedTopics: [],
    initialDataLoaded: false,
    filteredTweets: [],
    dataUpToDate: false,
    dataUpdating: false,
    showTutorial: false,
    loggedIn: false,
    accessKey: "",
    accessKeyConfiguration: null,
    // feed-uvl
    datasets: [],
    results: [],
    selectedDataset: {},
    selectedResult: {},
    selectedConcept: "",
    selectedMethod: "",
    loadingResults: false,
    loadingDataset: false,
    selectedDatasetOutside: "",

    // ANNOTATION STUFF

    pos_tags: [
      {name: "Verbs", tag: "v", color: VERB_COLOR},
      {name: "Nouns", tag: "n", color: NOUN_COLOR},
      {name: "Adjectives", tag: "a", color: ADJECTIVE_COLOR}
    ],

    annotatorInputVisible: false,
    selectedTokenCluster: null,

    hoveringToken: null,
    hoveringTokenCluster: null,
    hoveringClusterRelationship: null,

    selectedToken: null,
    isLinking: false,

    tokens: [],
    token_clusters: [],
    cluster_relationships: [],

    selectedClusterRelationship: null,

    displaySnackbarNoMultiClusters: false,  // show the snackback alerting the user that multi-cluster tokens aren't allowed

    availableDocuments: [
      {name: "Of Mice and Men"},
      {name: "The Grapes of Wrath"},
      {name: "The DaVinci Code"}
    ],

    algo_results: [
      {name: "Result: Animals", lemmas: ["fox", "dog"]},
      {name: "Result: Adjectives", lemmas: ["quick", "brown", "lazy"]}
    ],
  },
  getters,
  mutations,
  actions,
  modules: {
    sentiment
  }
});