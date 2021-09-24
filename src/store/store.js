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
    selected_code: null,

    hoveringToken: null,
    hovering_codes: [],
    hovering_tore_relationships: [],

    selectedToken: null,
    isLinking: false,

    selected_tore_relationship: null,

    docs: [],  // document indices from the server start at 1!
    tokens: [],
    codes: [],
    tore_relationships: [],
    doc_tokens: [],  // for performance reasons, manually update this array

    all_docs: {index: 0, name: "All Documents", begin_index: 0, end_index: null},
    selected_doc: null, // set it to first when loading
    selected_pos_tags: [],
    selected_algo_result: null,

    available_annotations: [],
    isLoadingAnnotation: false,  // loading the annotation to be displayed
    selected_annotation: null,
    isLoadingAvailableAnnotations: false,
    lastAnnotationPostAt: null

    // END ANNOTATION STUFF

  },
  getters,
  mutations,
  actions,
  modules: {
    sentiment
  }
});