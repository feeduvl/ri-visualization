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
import { WHITE } from "../../colors.js";
export default {
  data() {
    return {
      drawer: false,
      items: [
        {
          title: "Dashboard",
          icon: "dashboard",
          path: "/dashboard"
        },
        {
          title: "Problem Reports",
          icon: "error_outline",
          path: "/problemReports"
        },
        {
          title: "Inquiries",
          icon: "help_outline",
          path: "/inquiries"
        },
        {
          title: "Competitor Comparison",
          icon: "compare_arrows",
          path: "/comparison"
        },
        {
          title: "Settings",
          icon: "settings",
          path: "/settings"
        },
        { divider: true, inset: false },
        {
          title: "UVL - User View Language",
          icon: "",
          path: ""
        },
        {
          title: "Upload Data",
          icon: "upload",
          path: "/upload"
        },
        {
          title: "Start Concept Detection",
          icon: "play_arrow",
          path: "/detection"
        },
        {
          title: "Detection Results",
          icon: "assessment",
          path: "/results"
        },
        {
          title: "Concept View",
          icon: "workspaces",
          path: "/conceptView"
        },
        {
          title: "Document View",
          icon: "description",
          path: "/documentView"
        },
        {
          title: "Dataset View",
          icon: "storage",
          path: "/dataset"
        }
      ],
      style: {
        backgroundColor: WHITE,
        position: "fixed",
        top: 0,
        left: 0
      }
    };
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

