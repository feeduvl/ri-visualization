<template>
  <v-toolbar fixed app :color="color">
    <v-toolbar-side-icon id="v-step-0" @click.stop="$emit('toggle-drawer')"></v-toolbar-side-icon>
    <v-toolbar-title class="headline text-uppercase">
      <span>Requirements Intelligence</span>
      <span class="font-weight-light"> - {{ title }}</span>
    </v-toolbar-title>
    <v-spacer/>
    <a href="https://openreq.eu/"><img src="@/assets/openreq_logo.png" style="height:50px;" alt="OpenReq"></a>
  </v-toolbar>
</template>
<script>
import { WHITE } from "../../colors.js";
export default {
  data() {
    return {
      color: WHITE
    };
  },
  computed: {
    title() {
      return this.$store.getters.getTopBarTitle;
    }
  }
};
</script>
