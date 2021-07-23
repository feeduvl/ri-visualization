/**
 * Get a string to summarize the occurences of a list of concepts in a list of texts
 * @param {Array} textIds - List of text ids
 * @param {Array} concepts - List of concepts
 * @param {Array} occurences - [i][j] holds the occurences of concept j in text i
 * @return {Array} a list of strings describing the occurences of each concept
 */
export const getOccurenceDesc = function(textIds, concepts, occurences){
  let ret = [];
  for (let i = 0; i < concepts.length; i++){
    // eslint-disable-next-line no-unused-vars
    let s = "";
    let first = true;
    for (let j = 0; j < textIds.length; j++){
      if (occurences[j][i] > 0){
        if (first){
          first = false;
        } else {
          s += ", ";
        }
        s += textIds[j] + ": " + occurences[j][i];
      }
    }
    ret.push(s);
  }
  return ret;
};

export const getOccurenceStats = function(textIds, concepts, occurrences){
  let occsStats = [];
  for (let i = 0; i < concepts.length; i++){
    let numDocs = 0;
    let totalCount = 0;
    for (let j = 0; j < textIds.length; j++){
      let occs = occurrences[j][i];
      numDocs += ((occs > 0) ? 1 : 0);
      totalCount += occs;
    }
    occsStats.push([numDocs, totalCount]);
  }
  return occsStats;
};

export const onWordCloudWordClicked = function(word){
  // eslint-disable-next-line no-alert
  window.alert("'"+word.text+"' concept occurences: \n"+word.occurence_desc);
};