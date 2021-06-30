/* eslint-disable */
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai", "frequency-fcic"];

export const METHODS = [
    {
        name: "",
        displayName: "Empty",
        parameterComponentName: "empty-parameter",
        parameterComponentPath: "./form/EmptyParameter",
        resultComponentName: "empty-result",
        resultComponentPath: "./components/result/EmptyResult",
        scoreFunction: getScoreEmpty,
        resultProps: {}
    },
    {
        name: "lda",
        displayName: "LDA",
        parameterComponentName: "lda-parameter",
        parameterComponentPath: "./form/LdaParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
        scoreFunction: getScoreLDA,
        resultProps: {}
    },
    {
        name: "seanmf",
        displayName: "SeaNMF",
        parameterComponentName: "seanmf-parameter",
        parameterComponentPath: "./form/SeanmfParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
        scoreFunction: getScoreSeaNMF,
        resultProps: {}
    },
    {
        name: "frequency-rbai",
        displayName: "Frequency (RBAI)",
        parameterComponentName: "frequency-rbai-parameter",
        parameterComponentPath: "./form/FrequencyRBAIParameter",
        resultComponentName: "ranked-list-result",
        resultComponentPath: "",
        scoreFunction: getScoreEmpty,
        resultProps: {
            nameTitle: "Concept",
            scoreTitle: "Relevance Score",
            fromSelectedResult: function(sr){
                return Array.from(sr.topics.concepts, (v, i) => {return {name: v, score: sr.topics.scores[i]}})
            }}
    },
    {
        name: "frequency-fcic",
        displayName: "Decision Tree Model (FCIC)",
        parameterComponentName: "frequency-fcic-parameter",
        parameterComponentPath: "./form/FrequencyFCICParameter",
        resultComponentName: "ranked-list-result",
        resultComponentPath: "",
        scoreFunction: getScoreEmpty,
        resultProps: {nameTitle: "Concept",
            scoreTitle: "Information Gain",
            fromSelectedResult: function(sr){
                return Array.from(sr.topics.concepts, (v, i) => {return {name: v, score: sr.topics.information_gain[i]}})
            }}
    }
];

export function getScoreSeaNMF(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch(e) {
        metric = "-";
    }
    return metric;
}

export function getScoreLDA(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch(e) {
        metric = "-";
    }
    return metric;
}

export function getScoreEmpty(result) {
    return "-";
}

export function getMethodObj(methodName) {
    for(let index in METHODS){
        if(METHODS[index].name === methodName){
            return METHODS[index];
        }
    }
    return METHODS[0];
}