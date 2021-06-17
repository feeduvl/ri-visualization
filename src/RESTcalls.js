/* eslint-disable */
import axios from "axios";
import {GET_ALL_DATASETS_ENDPOINT, GET_DATASET_ENDPOINT} from "@/RESTconf";
import {MUTATE_DATASETS, MUTATE_SELECTED_DATASET} from "@/store/types";

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

export { loadDatasets, loadDataset };