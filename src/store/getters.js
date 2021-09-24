/* eslint-disable camelcase */
import {METHODS} from "@/methods";

export const getTopBarTitle = state => {
  return state.topBarTitle;
};
export const tweets = state => {
  return state.tweets;
};
export const loggedIn = state => {
  return state.loggedIn;
};
export const accessKeyConfigurationTwitterAccounts = state => {
  return state.accessKeyConfiguration.twitter_accounts;
};
export const accessKeyConfigurationTopics = state => {
  return state.accessKeyConfiguration.topics;
};
export const accessKeyConfiguration = state => {
  return state.accessKeyConfiguration;
};
export const accessKey = state => {
  return state.accessKey;
};
export const filteredTweets = state => {
  return state.filteredTweets;
};
export const selectedTopics = state => {
  return state.selectedTopics;
};
export const dataUpToDate = state => {
  return state.dataUpToDate;
};
export const results = state => {
  return state.results;
};
export const datasets = state => {
  return state.datasets;
};
export const selectedDataset = state => {
  return state.selectedDataset;
};
export const selectedResult = state => {
  return state.selectedResult;
};
export const selectedMethod = state => {
  return state.selectedMethod;
};

export const documentViewMethods = () => {
  return METHODS.filter(a => a.showInDocumentView);
};

export const finishedResults = state => {
  return state.results.filter(a => a.status === "finished");
};

export const resultsForSelectedMethod = state => {
  if (state.selectedMethod === METHODS[0].name){
    return [...state.results].reverse();
  }
  return [...state.results.filter(a => a.method === state.selectedMethod)].reverse();
};

export const finishedResultsForSelectedMethod = (state, getters) => {
  if (state.selectedMethod === METHODS[0].name){
    return [...getters.finishedResults].reverse();
  }
  return [...getters.finishedResults.filter(a => a.method === state.selectedMethod)].reverse();
};

export const loadingResults = state => {
  return state.loadingResults;
};
export const loadingDataset = state => {
  return state.loadingDataset;
};
export const selectedDatasetOutside = state => {
  return state.selectedDatasetOutside;
};
export const getProjectTitle = state => {
  return state.projectTitle;
};
export const getTopBarLogo = state => {
  return state.topBarLogo;
};
export const getTopBarAltText = state => {
  return state.topBarAltText;
};
export const getTopBarLink = state => {
  return state.topBarLink;
};
export const getFooterText = state => {
  return state.footer;
};

// ANNOTATION STUFF

export const docs = state => {
  return state.docs;
}; export const 
  selected_doc = state => {
    return state.selected_doc;
  }; export const 

  selectedToken = state => {
    return state.selectedToken;
  }; export const 
  pos_tags = state => {
    return state.pos_tags;
  }; export const 

  codeNames = state => {
    let ret = [];
    for (let i = 0; i < state.codes.length; i++){
      if (state.codes[i] && state.codes[i].name){
        ret.push(state.codes[i].name);
      }
    }
    return ret;
  }; export const 

  hoveringToken = state => {
    return state.hoveringToken;
  }; export const 

  selected_tore_relationship = state => {
    return state.selected_tore_relationship;
  }; export const 

  hovering_tore_relationships = state => {
    return state.hovering_tore_relationships;
  }; export const 

  hovering_codes = state => {
    return state.hovering_codes;
  }; export const 

  selected_code = state => {
    return state.selected_code;
  }; export const 
  isLinking = state => {
    return state.isLinking;
  }; 

export const token = state => index => state.tokens[index];

export const getCodesForToken = state => token => (token===null?[]:state.codes.filter(c => c && c.tokens.includes(token.index)));

export const requiredAnnotationsPresent = state => {
  return state.selected_code.name !== "" || state.selected_code.tore !== "";
};

export const tokenListToString = state => listOfTokenIndices => {
  let ret = "";
  for (let index of [...listOfTokenIndices].sort()){
    ret += state.tokens[index].name + " ";
  }
  return ret;
};

export const tokensInSelectedDoc = state => {
  return state.tokens.filter(t => t.index >= state.docs[state.selected_doc].begin_index && t.index < state.docs[state.selected_doc].end_index);
};

export const tokens = state => {
  console.log("tokens changed");
  return state.tokens;
};

export const lemmasFromSelectedResult = state => {
  console.log("lemmasFromSelectedResult recomputing");
  let frequency_methods = ["frequency-fcic", "frequency-rbai"];
  if (frequency_methods.includes(state.selected_algo_result.method)){
    return state.selected_algo_result.topics.concepts;
  }
  console.warn("lemmasFromSelectedResult not implemented");
  return [];
};

export const annotationAlgoResults = state => {
  console.log("annotationAlgoResults recomputing");
  let valid_methods = ["frequency-fcic", "frequency-rbai"];
  Object.freeze(valid_methods);
  return state.results.filter(r => valid_methods.includes(r.method));
};