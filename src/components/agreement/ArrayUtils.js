function arrayOfIntSort(a,b){
  let length = 0
  let res = 0
  if (a.token.length >= b.token.length) {
    length = a.token.length
  } else {
    length = b.token.length
  }
  for (let i = 0; i < length; i++) {
    if(typeof a.token[i] === 'undefined') {
      return false
    }
    if(typeof b.token[i] === 'undefined') {
      return true
    }
    res = a.token[i] - b.token[i]
    if (res !== 0) {
      break
    }
  }
  return res;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export {arrayOfIntSort, arraysEqual}