import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import sentiment from './modules/sentiment';
import * as mutations from './mutations';
import {NOUN_COLOR, VERB_COLOR, ADJECTIVE_COLOR} from "@/components/annotator/resources/color";
// eslint-disable-next-line camelcase
import {Code_add_token} from "../components/annotator/code";

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
    lastAnnotationEditAt: null,
    lastAnnotationPostAt: null

    // END ANNOTATION STUFF

  },
  getters,
  mutations: {
    ...mutations, 

    delete_selected_code(state) {  // DECLARED HERE TO ACCESS this.commit
      // eslint-disable-next-line camelcase
      let token_indices = state.selected_code.tokens;
      let index = state.selected_code.index;

      if (state.hovering_codes.includes(state.selected_code)){
        state.hovering_codes.splice(state.hovering_codes.indexOf(state.selected_code, 1));
      }

      for (let i of state.selected_code.relationship_memberships){
        this.commit("delete_tore_relationship", state.tore_relationships[i]);  // relationships are dependent upon tore codes
        this.$store.commit("updateLastAnnotationEditAt");
      }

      state.selected_code = null;

      // eslint-disable-next-line camelcase
      for (let i of token_indices){
        let newToken = {...state.tokens[i]};
        let newTokens = [...state.tokens];
        newToken.num_codes--;
        newTokens[i] = newToken;
        Object.freeze(newTokens);
        state.tokens = newTokens;
        this.commit("updateDocTokens");
      }
      Vue.set(state.codes, index, null);
    },

    assignToCode(state, args){  // DECLARED HERE TO ACCESS this.commit
      // eslint-disable-next-line camelcase
      const {token, code, new_code} = args;
      //console.log("Adding token: "+TokenToString(token)+" to code: "+CodeToString(code))
      Code_add_token(state, this.commit, code, token);
      //console.log("Resulting token: "+TokenToString(token))
      // eslint-disable-next-line camelcase
      if (new_code){
        state.codes.push(code);
      }
    },

    // eslint-disable-next-line camelcase
    setAnnotationPayload(state, {name, tokens, codes, tore_relationships, docs}){  // DECLARED HERE TO ACCESS this.commit
      Object.freeze(tokens);  // performance boost
      state.tokens = tokens;
      state.codes = codes;
      // eslint-disable-next-line camelcase
      state.tore_relationships = tore_relationships;
      let newDocs = [state.all_docs].concat(docs);
      state.all_docs.end_index = tokens.length;
      for (let doc of newDocs){
        Object.freeze(doc);
      }
      state.docs = newDocs;
      state.selected_doc = newDocs[docs.length > 0 ? 1: 0];

      state.selected_annotation = name;
      this.commit("setIsLoadingAnnotation", false);
    },

    setAvailableAnnotations(state, annotations){  // DECLARED HERE TO ACCESS this.commit
      state.available_annotations = annotations;
      this.commit("setIsLoadingAvailableAnnotations", false);
    }
  },
  actions,
  modules: {
    sentiment
  }
});