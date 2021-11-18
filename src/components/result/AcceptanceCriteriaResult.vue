<template>
    <v-card>
      <v-container>
        <v-layout row wrap>
          {{this.selectedResult}}
        </v-layout>
      </v-container>
    </v-card>
</template>

<script>
import {selectedResult} from "../../store/getters";
console.log(selectedResult);
export default {
  name: "acceptance-criteria-result"
}
</script>

<style scoped>

</style>