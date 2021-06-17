
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai"];

export const METHODS = {
  "seanmf": {
    name: "seanmf",
    displayName: "SeaNMF",
    parameterComponentName: "seanmf-parameter",
    parameterComponentPath: "./form/SeanmfParameter",
    resultComponentName: "topic-detection-result",
    resultComponentPath: "./result/TopicDetectionResult",
  },
  "lda": {
    resultComponentName: "topic-detection-result",
  },
  "": {
    name: "",
    displayName: "None",
    parameterComponentName: "empty-parameter",
    parameterComponentPath: "./form/EmptyParameter",
    resultComponentName: "empty-result",
    resultComponentPath: "./result/EmptyResult",
  },
  "frequency-rbai": {
    resultComponentName: "empty-result",
  },
};