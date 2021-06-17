/* eslint-disable */
export const METHOD_LIST = ["lda", "seanmf", "frequency-rbai"];

export const METHODS = [
    {
        name: "",
        displayName: "None",
        parameterComponentName: "empty-parameter",
        parameterComponentPath: "./form/EmptyParameter",
        resultComponentName: "empty-result",
        resultComponentPath: "./components/result/EmptyResult",
    },
    {
        name: "lda",
        displayName: "LDA",
        parameterComponentName: "lda-parameter",
        parameterComponentPath: "./form/LdaParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
    },
    {
        name: "seanmf",
        displayName: "SeaNMF",
        parameterComponentName: "seanmf-parameter",
        parameterComponentPath: "./form/SeanmfParameter",
        resultComponentName: "topic-detection-result",
        resultComponentPath: "./components/result/TopicDetectionResult",
    },
    {
        name: "frequency-rbai",
        displayName: "Frequency (RBAI)",
        parameterComponentName: "frequency-rbai-parameter",
        parameterComponentPath: "./form/FrequencyRBAIParameter",
        resultComponentName: "",
        resultComponentPath: "",
    },
];