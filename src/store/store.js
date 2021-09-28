import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import sentiment from './modules/sentiment';
import * as mutations from './mutations';
import {NOUN_COLOR, VERB_COLOR, ADJECTIVE_COLOR} from "@/components/annotator/resources/color";
// eslint-disable-next-line camelcase
import {
  // eslint-disable-next-line camelcase
  Code_add_relationship,Code_remove_relationship,Code_add_token,
  CodeToString,
  TORERelationship
} from "../components/annotator/code";

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

    selectedToken: null,
    isLinking: false,

    selected_tore_relationship: null,

    annotator_uploaded_at: null,
    annotator_dataset: null,
    docs: [],  // document indices from the server start at 1!
    tokens: [],
    codes: [],
    tore_relationships: [],
    //doc_tokens: [],  // for performance reasons, manually update this array
    
    token_in_selected_code: [],
    //token_pos_selected: [],
    //token_is_algo_lemma: [],
    token_is_hovering_code: [],
    token_linked_together: [],
    token_is_hovering_token: [],
    token_num_codes: [],
    
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
        this.commit("updateLastAnnotationEditAt");
      }

      this.commit("setTokensInSelectedCode", [state.selected_code, null]);
      state.selected_code = null;

      // eslint-disable-next-line camelcase
      for (let i of token_indices){

        /*let newToken = {...state.tokens[i]};
        let newTokens = [...state.tokens];
        newToken.num_codes--;
        newTokens[i] = newToken;
        Object.freeze(newTokens);
        state.tokens = newTokens;
        this.commit("updateDocTokens");*/                
        state.token_num_codes[i]--;
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
    setAnnotationPayload(state, {name, tokens, codes, tore_relationships, docs, uploaded_at, dataset}){
      // eslint-disable-next-line camelcase
      state.annotator_uploaded_at = uploaded_at;
      state.annotator_dataset = dataset;

      for (let token of tokens){
        Object.freeze(token);
      }
      Object.freeze(tokens);  // performance boost
      state.tokens = tokens;
      this.commit("initTokensEfficiencyStructs", false);
      state.codes = codes;
      // eslint-disable-next-line camelcase
      state.tore_relationships = tore_relationships;
      let newDocs = [state.all_docs].concat(docs);
      state.all_docs.end_index = tokens.length;
      for (let doc of newDocs){
        Object.freeze(doc);
      }
      Object.freeze(newDocs);
      state.docs = newDocs;
      state.selected_doc = newDocs[docs.length > 0 ? 1: 0];

      state.selected_annotation = name;
      this.commit("setIsLoadingAnnotation", false);
    },

    setAvailableAnnotations(state, annotations){  // DECLARED HERE TO ACCESS this.commit
      state.available_annotations = annotations || [];
      this.commit("setIsLoadingAvailableAnnotations", false);
    },
    
    // eslint-disable-next-line camelcase
    delete_tore_relationship(state, tore_relationship){  // DECLARED HERE TO ACCESS this.commit

      Code_remove_relationship(state.codes[tore_relationship.TOREEntity], tore_relationship);

      Vue.set(state.tore_relationships, tore_relationship.index, null);

      if (state.selected_tore_relationship && state.selected_tore_relationship.index === tore_relationship.index){
        this.commit("setSelectedToreRelationship", null);
      }
    },
    
    new_tore_relationship(state, firstToken){
      console.log("new_tore_relationship for selected code: "+CodeToString(state.selected_code));
      let relationship = new TORERelationship(state.selected_code, [firstToken.index], state.tore_relationships.length);
      Code_add_relationship(state.selected_code, relationship);
      this.commit("setSelectedToreRelationship", relationship);
      state.tore_relationships.push(relationship);
    },

    setIsLinking(state, isLinking){
      state.isLinking = isLinking;
      if (!isLinking){
        this.commit("setSelectedToreRelationship", null);
      }
    },

    setAnnotatorInputVisible(state, visible){
      //console.log("setAnnotatorInputVisible: "+visible)
      state.annotatorInputVisible = visible;
      if (!visible){
        state.isLinking = false;
        state.selectedToken = null;
        this.commit("setTokensInSelectedCode", [state.selected_code, null]);
        state.selected_code = null;
        this.commit("setSelectedToreRelationship", null);
      }
    },
    set_selected_code(state, code){
      console.log("Set selected code: "+CodeToString(code));
      this.commit("setTokensInSelectedCode", [state.selected_code, code]);
      state.selected_code = code;
    },

    resetAnnotator(state){
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

      this.commit("initTokensEfficiencyStructs", true);
    }
  },
  actions,
  modules: {
    sentiment
  }
});