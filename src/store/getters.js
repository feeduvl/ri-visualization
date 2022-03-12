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
    console.log("codeNames");
    let ret = [];
    for (let i = 0; i < state.codes.length; i++){
      if (state.codes[i] && state.codes[i].name){
        ret.push(state.codes[i].name);
      }
    }
    return ret;
  }; export const

  selected_tore_relationship = state => {
    return state.selected_tore_relationship;
  }; export const

  new_tore_relationship = state => {
    return state.newToreRelationship;
  };export const

  new_added_token = state => {
    return state.newTokenToAdd;
  };
export const

  selected_code = state => {
    return state.selected_code;
  }; export const 
  isLinking = state => {
    return state.isLinking;
  };  export const
  isAddingToken = state => {
    return state.isAddingToken;
  };

export const token = state => index => state.tokens[index];

export const getCodesForToken = state => token => {
  console.log("getCodesForToken: "+(token?token.name:"null"));
  if (token===null || (state.token_num_name_codes[token.index] === 0 && state.token_num_tore_codes[token.index] === 0)){
    return [];
  } 
  let ret = [];
  let names_left_to_find = state.token_num_name_codes[token.index];
  let tore_left_to_find = state.token_num_tore_codes[token.index];
  for (let c of state.codes){
    if (c) {
      if (c.tokens.includes(token.index)){
        ret.push(c);
        if (c.name){
          names_left_to_find--;
        }
        if (c.tore){
          tore_left_to_find--;
        }
        if (names_left_to_find === 0 && tore_left_to_find === 0){
          return ret;
        }
      }
    }
  }
  console.error("getCodesForToken fell through, check implementation");
  console.error(names_left_to_find);
  console.error(tore_left_to_find);
  return ret;
  
};

export const requiredAnnotationsPresent = state => {
  return (state.selected_code.name !== null && state.selected_code.name !== "") || (state.selected_code.tore !== null && state.selected_code.tore !== "");
};

export const requiredAgreementsPresent = state => {
  return (state.selected_code.name !== null && state.selected_code.name !== "") || (state.selected_code.tore !== null && state.selected_code.tore !== "");
};

export const tokenListToString = state => listOfTokenIndices => {
  let ret = "";
  if (listOfTokenIndices === null || listOfTokenIndices === undefined){
    console.error("tokenListToString got null/undefined input");
    return "";
  }
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
  let ret = [];
  let frequency_methods = ["frequency-fcic", "frequency-rbai"];
  if (frequency_methods.includes(state.selected_algo_result.method)){
    ret = state.selected_algo_result.topics.concepts;
  } else {
    try {
      let result = state.selected_algo_result;
      let list = [];
      // eslint-disable-next-line guard-for-in
      for (let topic in result.topics) {
        // eslint-disable-next-line guard-for-in
        for (let index in result.topics[topic]) {
          let word = result.topics[topic][index];
          // eslint-disable-next-line max-depth
          if (word.length <= 1) {
            // eslint-disable-next-line no-continue
            continue;
          }
          // eslint-disable-next-line max-depth
          if (!(list.indexOf(word) > -1)) {
            list.push(word);
          }
        }
      }
      ret = list;

      console.log("Got non-frequency keywords: ");
      console.log(ret);
    } catch (e) {
      console.error("Failed to get keywords: "+e);
    }
  }
  return ret.map(l => (l?l.toLowerCase():l));
};

export const annotationAlgoResults = state => {
  return state.results.filter(r => r.dataset_name === state.annotator_dataset);
};

export const agreementAlgoResults = state => {
  return state.results.filter(r => r.dataset_name === state.agreement_dataset);
};

export const showingInput = state => {
  return state.selected_code && state.annotatorInputVisible;
};