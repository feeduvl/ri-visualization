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
  Code_add_relationship,Code_remove_relationship,Code_remove_token, Code_update_token,
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

    relationship_owners: [],  // tore at index i owns the relationship name at index i
    relationship_names: [],  // relationship types
    tores: [],  // tore categories

    annotatorInputVisible: false,
    selected_code: null,

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
    token_linked_together: [],
    token_num_name_codes: [],
    token_num_tore_codes: [],
    
    all_docs: {index: 0, name: "All Documents", begin_index: 0, end_index: null},
    selected_doc: null, // set it to first when loading
    selected_pos_tags: [],
    selected_algo_result: null,

    annotatorViewingCodeResults: false,
    available_annotations: [],
    isLoadingAnnotation: false,  // loading the annotation to be displayed
    selected_annotation: null,
    isLoadingAvailableAnnotations: false,
    lastAnnotationEditAt: null,
    lastAnnotationPostAt: null,

    // END ANNOTATION STUFF

    // AGREEMENT STUFF

    agreementInputVisible: false,

    agreement_uploaded_at: null,
    agreement_dataset: null,
    agreement_annotation_names: [],
    agreement_tore_relationships: [],

    agreement_code_alternatives: [],
    agreement_statistics: [],
    setIsRefreshingAgreement: false,
    //List of equal size as tokens, each position contains all unresolved codeAlternatives connected to that token
    unResolvedCodesPerToken: [],

    agreement_is_completed: null,

    agreementViewingCodeResults: false,
    available_agreements: [],
    isLoadingAgreement: false,
    selected_agreement: null,
    isLoadingAvailableAgreements: false,
    lastAgreementEditAt: null,
    lastAgreementPostAt: null,

    exportedAnnotationName: null,
    exportedAnnotationTORERelationships: [],
    exportedAnnotationCodes: [],
    exportedAnnotationTokens: [],

    maxIndexCodes: null,
    maxIndexCodeAlternatives: null,
    maxIndexToreRelationships: null,
    newToreRelationship: null,
    newToreRelationships: [],

    newTokensToAdd: [],
    isAddingToken: false,
    // END AGREEMENT STUFF

    // REDDIT CRAWLER
    finishedCrawlerJobs: []

  },
  getters,
  mutations: {
    ...mutations,

    delete_code(state, code){  // DECLARED HERE TO ACCESS this.commit
      if (!code){
        console.error("delete_code attempted to delete null/undefined code");
        return;
      }
      // eslint-disable-next-line no-undefined
      if (code.index===null || code.index === undefined){
        console.error("delete_code attempted to delete code without index");
        return;
      }

      // eslint-disable-next-line no-param-reassign
      code = state.codes[code.index];

      let isSelectedCode = state.selected_code?code.index === state.selected_code.index : false;

      // eslint-disable-next-line camelcase
      let token_indices = code.tokens;
      let index = code.index;

      for (let i of code.relationship_memberships){
        this.commit("delete_tore_relationship", state.tore_relationships[i]);  // relationships are dependent upon tore codes
        this.commit("updateLastAnnotationEditAt");
      }

      let codeName = code.name;
      let codeTore = code.tore;

      if (isSelectedCode){
        this.commit("setTokensInSelectedCode", [state.selected_code, null]);
        state.selected_code = null;
      }

      // eslint-disable-next-line camelcase
      for (let i of token_indices){
        if (codeName){
          state.token_num_name_codes[i]--;
        }

        if (codeTore){
          state.token_num_tore_codes[i]--;
        }
      }
      Vue.set(state.codes, index, null);
    },

    delete_selected_code(state){  // DECLARED HERE TO ACCESS this.commit
      this.commit("delete_code",state.selected_code);
    },

    removeTokenFromSelectedCode(state, token){
      Code_remove_token(state, this.commit, state.selected_code, token);
      Vue.set(state.token_in_selected_code, token.index, false);
    },

    assignToCode(state, args){  // DECLARED HERE TO ACCESS this.commit
      // eslint-disable-next-line camelcase
      const {token, code, new_code} = args;
      // eslint-disable-next-line camelcase
      console.log("Adding token: "+token.name+" with index: "+token.index+" to code: "+CodeToString(code)+". New code: "+new_code);
      Code_update_token(state, this.commit, code, token);
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

      if (!state.available_annotations.includes(name)){
        state.available_annotations.push(name);
      }
      state.selected_annotation = name;
      this.commit("setIsLoadingAnnotation", false);
    },

    // eslint-disable-next-line camelcase
    setAgreementPayload(state, {name, tokens, code_alternatives, tore_relationships, docs, created_at, dataset, annotation_names, agreement_statistics, is_completed}){
      // eslint-disable-next-line camelcase
      state.agreement_created_at = created_at;
      state.agreement_dataset = dataset;
      // eslint-disable-next-line camelcase
      if (tore_relationships === null) {
        state.agreement_tore_relationships = [];
      } else {
        // eslint-disable-next-line camelcase
        state.agreement_tore_relationships = tore_relationships;
      }
      // eslint-disable-next-line camelcase
      state.agreement_is_completed = is_completed;
      // eslint-disable-next-line camelcase
      state.agreement_annotation_names = annotation_names;
      // eslint-disable-next-line camelcase
      state.agreement_statistics = agreement_statistics;
      console.log(agreement_statistics);

      for (let token of tokens){
        Object.freeze(token);
      }
      Object.freeze(tokens);  // performance boost
      state.tokens = tokens;
      this.commit("initTokensEfficiencyStructs", false);

      // eslint-disable-next-line camelcase
      state.agreement_code_alternatives = code_alternatives;

      let newDocs = [state.all_docs].concat(docs);
      state.all_docs.end_index = tokens.length;
      for (let doc of newDocs){
        Object.freeze(doc);
      }
      Object.freeze(newDocs);
      state.docs = newDocs;
      state.selected_doc = newDocs[docs.length > 0 ? 1: 0];

      if (!state.available_agreements.includes(name)){
        state.available_agreements.push(name);
      }
      state.selected_agreement = name;

      state.maxIndexCodeAlternatives = Math.max.apply(
        null, state.agreement_code_alternatives.map(value => value.index)
      );
      state.maxIndexCodes = Math.max.apply(
        null, state.agreement_code_alternatives.map(value => value.code.index)
      );
      // eslint-disable-next-line camelcase
      if (state.agreement_tore_relationships.length === 0) {
        state.maxIndexToreRelationships = null;
      } else {
        state.maxIndexToreRelationships = Math.max.apply(
          null, state.agreement_tore_relationships.map(value => value.index)
        );
      }

      this.commit("initResolvedStatusOfTokens");
      this.commit("setIsLoadingAgreement", false);
    },

    setAvailableAnnotations(state, annotations){  // DECLARED HERE TO ACCESS this.commit
      state.available_annotations = annotations || [];
      this.commit("setIsLoadingAvailableAnnotations", false);
    },

    setAvailableAgreements(state, agreements){  // DECLARED HERE TO ACCESS this.commit
      state.available_agreements = agreements || [];
      this.commit("setIsLoadingAvailableAgreements", false);
    },
    
    // eslint-disable-next-line camelcase
    delete_tore_relationship(state, tore_relationship){  // DECLARED HERE TO ACCESS this.commit

      Code_remove_relationship(state.codes[tore_relationship.TOREEntity], tore_relationship);

      state.tore_relationships = state.tore_relationships.filter(value => value.index !== tore_relationship.index);

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

    new_tore_relationship_in_agreement(state, firstToken){
      // Use placeholder for TOREEntity and index, those are set when saving
      let relationship = {
        TOREEntity: 1,
        target_tokens: [firstToken.index],
        relationship_name: "",
        index: -1,
      };
      this.commit("setNewToreRelationship", relationship);
      state.newToreRelationships.push(relationship);
    },

    new_added_token_in_agreement(state, tokenIndex){
      state.newTokensToAdd.push(tokenIndex);
      state.isAddingToken = false;
    },

    setIsLinking(state, isLinking){
      state.isLinking = isLinking;
      if (!isLinking){
        this.commit("setNewToreRelationship", null);
      }
    },

    setIsAddingToken(state, isAddingToken){
      state.isAddingToken = isAddingToken;
    },

    // eslint-disable-next-line camelcase
    setStatisticsForAgreement(state, agreement_statistics){
      // eslint-disable-next-line camelcase
      state.agreement_statistics = agreement_statistics;
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

    setAgreementInputVisible(state, visible){
      state.agreementInputVisible = visible;
      if (!visible){
        state.isLinking = false;
        state.isAddingToken = false;
        state.selectedToken = null;
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
    },

    resetAgreement(state){
      state.isLoadingAvailableAgreements = false;
      state.isLoadingAgreement = false;
      state.setIsRefreshingAgreement = false;
      state.selected_algo_result = null;
      state.lastAgreementEditAt = null;
      state.lastAgreementPostAt = null;

      state.agreement_tore_relationships = [];
      state.agreement_dataset = null;
      state.agreement_uploaded_at = null;
      state.agreement_annotation_names = [];
      state.selected_agreement = null;
      state.selected_doc = null;
      state.selected_pos_tags = [];
      state.selected_algo_result = null;

      state.tokens = [];
      state.unResolvedCodesPerToken = [];
      state.docs = [];
      state.agreement_code_alternatives = [];
      state.agreement_statistics = [];

      state.exportedAnnotationName = null;
      state.exportedAnnotationTORERelationships = [];
      state.exportedAnnotationCodes = [];
      state.exportedAnnotationTokens = [];

      this.commit("initTokensEfficiencyStructs", true);
    },
    
    setAvailableCrawlerJobs(state, crawlingJobs){
      state.finishedCrawlerJobs = crawlingJobs || [];
    }
  },


  actions,
  modules: {
    sentiment
  }
});