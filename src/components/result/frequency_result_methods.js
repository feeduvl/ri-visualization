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
        if (!first){
          s += ", ";
          first = false;
        }
        s += textIds[j] + ": " + occurences[j][i];
      }
    }
  }
  return ret;
};

export const onWordCloudWordClicked = function(word){
  // eslint-disable-next-line no-alert
  window.alert("Word occurences: \n"+word.occurences);
};