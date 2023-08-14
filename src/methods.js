/* eslint-disable */
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai", "frequency-fcic", "acceptance-criteria", "us-similarity", "acceptance-criteria-completeness", "bert"];

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
        resultComponentName: "bi-lstm-tore-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "bert-classifier",
        displayName: "BERT",
        parameterComponentName: "bert-parameter",
        parameterComponentPath: "./form/BERTParameter",
        resultComponentName: "bert-tore-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "us-similarity",
        displayName: "User Story Similarity",
        parameterComponentName: "us-similarity-parameter",
        parameterComponentPath: "./form/UserStorySimilarityParameter",
        resultComponentName: "us-similarity-result",
        resultComponentPath: "./components/result/UserStorySimilarityResult",
        scoreFunction: getSimilarUsCount,
        showInDocumentView: false
    },
    {
        name: "acceptance-criteria-completeness",
        displayName: "Acceptance Criteria Completeness",
        parameterComponentName: "ac-completeness-parameter",
        parameterComponentPath: "./form/AcceptanceCriteriaCompletenessParameter",
        resultComponentName: "acceptance-criteria-completeness-result",
        resultComponentPath: "./components/result/AcceptanceCriteriaCompletenessResult",
        scoreFunction: getSimilarAcC,
        showInDocumentView: false
    }
]

export const CHAINABLE_METHOD_LIST = ["bert-classifier/sner_bert", "bert-classifier/bilstm_bert", "bert-classifier/bert_bert", "bert-classifier/bert"];

export const CHAINABLE_METHODS = [
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
        name: "bert-classifier/sner_bert",
        displayName: "Stanford NER + BERT",
        parameterComponentName: "bert-parameter",
        parameterComponentPath: "./form/BERTParameter",
        resultComponentName: "sner-bert-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "bert-classifier/bilstm_bert",
        displayName: "Bi-LSTM + BERT",
        parameterComponentName: "bert-parameter",
        parameterComponentPath: "./form/BERTParameter",
        resultComponentName: "bilstm-bert-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
    {
        name: "bert-classifier/bert_bert",
        displayName: "BERT + BERT",
        parameterComponentName: "bert-parameter",
        parameterComponentPath: "./form/BERTParameter",
        resultComponentName: "bert-bert-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },
        {
        name: "bert-classifier/bert",
        displayName: "BERT",
        parameterComponentName: "bert-parameter",
        parameterComponentPath: "./form/BERTParameter",
        resultComponentName: "bert-tore-result",
        resultComponentPath: "./components/result/ClassifierTOREResult",
        scoreFunction: getScoreEmpty,
        showInDocumentView: false
    },

]

export function getScoreSeaNMF(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch (e) {
        metric = "–";
    }
    return metric;
}

export function getScoreLDA(result) {
    let metric;
    try {
        metric = result.metrics.total_coherence.toString().substring(0, 6);
    } catch (e) {
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
    } catch (e) {
        metric = "–";
    }
    return metric;
}

export function getSimilarUsCount(result) {
    let metric;
    try {
        metric = result.metrics.similar_us_pairs;
    } catch (e) {
        metric = "–"
    }
    return metric
}

export function getSimilarAcC(result) {
    let metric;
    try {
        metric = result.metrics.avg_completeness;
    } catch (e) {
        metric = "–"
    }
    return metric
}

export function getScoreEmpty(result) {
    return "–";
}

export function getMethodObj(methods, methodName) {
    for (let index in methods) {
        if (methods[index].name === methodName) {
            return methods[index];
        }
    }
    return methods[0];
}