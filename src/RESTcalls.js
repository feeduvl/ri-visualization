/* eslint-disable */
import axios from "axios";
import {GET_ALL_DATASETS_ENDPOINT, GET_ALL_RESULTS_ENDPOINT, GET_DATASET_ENDPOINT} from "@/RESTconf";
import {
    MUTATE_DATASETS,
    MUTATE_FILTERED_RESULTS,
    MUTATE_LOADING_RESULTS, MUTATE_RESULTS,
    MUTATE_SELECTED_DATASET
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
  store.state.loadingDataset = true;
  await axios
    .get(GET_DATASET_ENDPOINT(datasetName))
    .then(response => {
      store.commit(MUTATE_SELECTED_DATASET, response.data);
      store.state.loadingDataset = false;
    })
    .catch(e => {
      console.log("RESTcalls::loadDataset:" + e);
      store.state.loadingDataset = false;
    });
}

function reloadResults(store) {
    if (!store.state.loadingResults) {
        store.commit(MUTATE_LOADING_RESULTS, true);
        axios
            .get(GET_ALL_RESULTS_ENDPOINT)
            .then(response => {
                store.commit(MUTATE_RESULTS, response.data)

                if (store.state.selectedMethod === "") {
                    store.commit(MUTATE_FILTERED_RESULTS, response.data);
                    store.commit(MUTATE_LOADING_RESULTS, false);
                } else {
                    let tmpFilteredResults = [];

                    for (let i = 0; i < store.state.results.length; i++) {
                        if (store.state.results[i].method === store.state.selectedMethod) {
                            tmpFilteredResults.push(store.state.results[i]);
                        }
                    }

                    store.commit(MUTATE_FILTERED_RESULTS, tmpFilteredResults);
                    store.commit(MUTATE_LOADING_RESULTS, false);
                }
            })
            .catch(e => {
                console.log("actions::actionLoadResults Error:" + e);
                store.commit(MUTATE_LOADING_RESULTS, false);
            });
    }
}

export { loadDatasets, loadDataset, reloadResults };