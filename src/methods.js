/* eslint-disable */
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai", "frequency-fcic", "acceptance-generator"];

export const METHODS = [
    {
        name: "",
        displayName: "Empty",
        parameterComponentName: "empty-parameter",
        parameterComponentPath: "./form/EmptyParameter",
        resultComponentName: "empty-result",
        resultComponentPath: "./components/result/EmptyResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: true
    },
    {
        name: "lda",
        displayName: "LDA",
        parameterComponentName: "lda-parameter",
        parameterComponentPath: "./form/LdaParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
        scoreFunction: getScoreLDA,
        showInDocumentView: true

    },
    {
        name: "seanmf",
        displayName: "SeaNMF",
        parameterComponentName: "seanmf-parameter",
        parameterComponentPath: "./form/SeanmfParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
        scoreFunction: getScoreSeaNMF,
        showInDocumentView: true
    },
    {
        name: "frequency-rbai",
        displayName: "Frequency (RBAI)",
        parameterComponentName: "frequency-rbai-parameter",
        parameterComponentPath: "./form/FrequencyRBAIParameter",
        resultComponentName: "rbai-result",
        resultComponentPath: "",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false

    },
    {
        name: "frequency-fcic",
        displayName: "Decision Tree Model (FCIC)",
        parameterComponentName: "frequency-fcic-parameter",
        parameterComponentPath: "./form/FrequencyFCICParameter",
        resultComponentName: "fcic-result",
        resultComponentPath: "",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "acceptance-criteria",
        displayName: "Acceptance Criteria",
        parameterComponentName: "acceptance-criteria-parameter",
        parameterComponentPath: "./form/AcceptanceCriteriaParameter",
        resultComponentName: "acceptance-criteria-result",
        resultComponentPath: "./components/result/AcceptanceCriteriaResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: true
    }
]

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