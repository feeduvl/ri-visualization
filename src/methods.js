/* eslint-disable */
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai", "frequency-fcic", "acceptance-criteria"];

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
        scoreFunction: getRuntimeAcceptanceCriteria,
        showInDocumentView: false
    },
    {
        name: "stanford-ner",
        displayName: "Stanford NER",
        parameterComponentName: "stanford-ner-parameter",
        parameterComponentPath: "./form/StanfordNERParameter",
        resultComponentName: "classifier-tore-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "bi-lstm-classifier",
        displayName: "Bi-LSTM",
        parameterComponentName: "bi-lstm-parameter",
        parameterComponentPath: "./form/BiLSTMParameter",
        resultComponentName: "bi-lstm-result",
        resultComponentPath: "",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    }
]

export function getScoreSeaNMF(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch(e) {
        metric = "–";
    }
    return metric;
}

export function getScoreLDA(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch(e) {
        metric = "–";
    }
    return metric;
}

export function getRuntimeAcceptanceCriteria(result) {
    let metric;
    try {
        let runtime = parseFloat(result.metrics.runtime);
        if (isNaN(runtime)) {
            throw new Error('Object is not a Number');
        }
        metric = new Date(runtime).toISOString().substr(11, 12).toString();
    } catch(e) {
        metric = "–";
    }
    return metric;
}

export function getScoreEmpty(result) {
    return "–";
}

export function getMethodObj(methodName) {
    for(let index in METHODS){
        if(METHODS[index].name === methodName){
            return METHODS[index];
        }
    }
    return METHODS[0];
}