<template>
  <v-navigation-drawer app v-model="drawer" absolute temporary :style="style">
    <v-list class="pt-0" dense>
      <template v-for="(item, index) in items">
        <v-divider v-if="item.divider" :key="index" ></v-divider>
        <v-list-tile
            v-else
          :key="item.title"
          :to="item.path"
          active-class="active"
          @click="updateTheme(item.title,item.theme)"
          :class="item.path === $route.path ? 'active' : ''"
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { WHITE } from "@/colors";
import {THEME_UVL, THEME_OPENREQ, setTheme} from "@/theme";
export default {
  data() {
    return {
      drawer: false,
      items: [
          // Icons can be found in the standard google font icon library: https://fonts.google.com/icons
        {
          title: "Dashboard",
          icon: "dashboard",
          path: "/dashboard",
          theme: THEME_OPENREQ
        },
        {
          title: "Problem Reports",
          icon: "error_outline",
          path: "/problemReports",
          theme: THEME_OPENREQ
        },
        {
          title: "Inquiries",
          icon: "help_outline",
          path: "/inquiries",
          theme: THEME_OPENREQ
        },
        {
          title: "Competitor Comparison",
          icon: "compare_arrows",
          path: "/comparison",
          theme: THEME_OPENREQ
        },
        {
          title: "Settings",
          icon: "settings",
          path: "/settings",
          theme: THEME_OPENREQ
        },
        { divider: true, inset: false },
        {
          title: "UVL - User View Language",
          icon: "",
          path: "",
          theme: ""
        },
        {
          title: "Upload Data",
          icon: "upload",
          path: "/upload",
          theme: THEME_UVL
        },
        {
          title: "Start Analysis",
          icon: "play_arrow",
          path: "/detection",
          theme: THEME_UVL
        },
        {
          title: "Annotation",
          icon: "mode",
          path: "/annotation",
          theme: THEME_UVL
        },
        {
          title: "Agreement",
          icon: "compare",
          path: "/agreement",
          theme: THEME_UVL
        },
        {
          title: "Reddit Crawler",
          icon: "sync",
          path: "/reddit_crawler",
          theme: THEME_UVL
        },
        {
          title: "Detection Results",
          icon: "assessment",
          path: "/results",
          theme: THEME_UVL
        },
        {
          title: "Document View",
          icon: "description",
          path: "/documents",
          theme: THEME_UVL
        },
        {
          title: "Dataset View",
          icon: "storage",
          path: "/dataset",
          theme: THEME_UVL
        }
      ],
      style: {
        backgroundColor: WHITE,
        position: "fixed",
        top: 0,
        left: 0
      }
    };
  },
  methods: {
    updateTheme (title, theme) {
      if (theme !== "") {
        setTheme(title, theme, this.$store);
      }
    }
  }
};
</script>

<style scoped>
.active {
  font-weight: bold;
  color: rgba(255, 255, 255, 1);
  /* color: rgba(255, 89, 0, 1); */
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

