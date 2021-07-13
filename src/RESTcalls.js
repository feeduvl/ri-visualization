/* eslint-disable */
import axios from "axios";
import {GET_ALL_DATASETS_ENDPOINT, GET_ALL_RESULTS_ENDPOINT, GET_DATASET_ENDPOINT} from "@/RESTconf";
import {
    MUTATE_DATASETS,
    MUTATE_LOADING_RESULTS, MUTATE_RESULTS,
    MUTATE_SELECTED_DATASET,
    MUTATE_LOADING_DATASET
} from "@/store/types";

async function loadDatasets(store) {
  await axios
    .get(GET_ALL_DATASETS_ENDPOINT)
    .then(response => {
      store.commit(MUTATE_DATASETS, response.data);
    })
    .catch(e => {
      console.log("RESTcalls::loadDatasets:" + e);
    });
}

async function loadDataset(store, datasetName) {
    store.commit(MUTATE_LOADING_DATASET, true);

  await axios
    .get(GET_DATASET_ENDPOINT(datasetName))
    .then(response => {
      store.commit(MUTATE_SELECTED_DATASET, response.data);
    })
    .catch(e => {
      console.log("RESTcalls::loadDataset:" + e);
    }).finally(() =>
          store.commit(MUTATE_LOADING_DATASET, false));
}

// Refactor to updateResults()
function reloadResults(store) {
    if (!store.state.loadingResults) {
        store.commit(MUTATE_LOADING_RESULTS, true);
        axios
            .get(GET_ALL_RESULTS_ENDPOINT)
            .then(response => {
                store.commit(MUTATE_RESULTS, response.data)
            })
            .catch(e => {
                console.log("RESTcalls:reloadResults: Error:" + e);
            }).finally(() => store.commit(MUTATE_LOADING_RESULTS, false));
    }
}

export { loadDatasets, loadDataset, reloadResults };