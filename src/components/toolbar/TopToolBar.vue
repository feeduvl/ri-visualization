<template>
  <v-toolbar fixed app :color="color">
    <v-toolbar-side-icon id="v-step-0" @click.stop="$emit('toggle-drawer')"></v-toolbar-side-icon>
    <v-toolbar-title class="headline text-uppercase">
      <span>{{ project }}</span>
      <span class="font-weight-light"> - {{ title }}</span>
    </v-toolbar-title>
    <v-spacer/>
    <a href=""><img :src=logo style="height:50px;" :alt=altText></a>
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
    },
    project() {
      return this.$store.getters.getProjectTitle;
    },
    logo() {
      return this.$store.getters.getTopBarLogo;
    },
    altText() {
      return this.$store.getters.getTopBarAltText;
    }
  }
};
</script>
