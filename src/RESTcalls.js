import axios from "axios";
import {GET_ALL_DATASETS_ENDPOINT} from "@/RESTconf";
import {MUTATE_DATASETS} from "@/store/types";

async function loadDatasets() {
  await axios
    .get(GET_ALL_DATASETS_ENDPOINT)
    .then(response => {
      this.$store.commit(MUTATE_DATASETS, response.data);
    })
    .catch(e => {
      console.log("RESTcalls::loadDatasets:" + e);
    });
}

export { loadDatasets };