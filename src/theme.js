import {
  ACTION_SET_FOOTER_TEXT,
  ACTION_SET_PROJECT_TITLE,
  ACTION_SET_TOOLBAR_HEADER,
  ACTION_SET_TOP_BAR_ALT_TEXT,
  ACTION_SET_TOP_BAR_LOGO
} from "@/store/types";

export const THEME_OPENREQ = {
  projectTitle: 'Requirements Intelligence',
  topBarLogo: require('@/assets/openreq_logo.png'),
  topBarAltText: 'openreq',
  footer: "— Christoph Stanik\n" +
    "      <strong>\n" +
    "        <a href=\"https://openreq.eu/\">@OpenReq</a>\n" +
    "      </strong>",
};

export const THEME_UVL = {
  projectTitle: "User View Language",
  topBarLogo: require('@/assets/UVL_Logo_small.png'),
  topBarAltText: 'uvl',
  footer: "",
};

export const setTheme = function (topBarTitle, theme, store) {
  store.dispatch(ACTION_SET_TOOLBAR_HEADER, topBarTitle);
  store.dispatch(ACTION_SET_PROJECT_TITLE, theme.projectTitle);
  store.dispatch(ACTION_SET_TOP_BAR_LOGO, theme.topBarLogo);
  store.dispatch(ACTION_SET_TOP_BAR_ALT_TEXT, theme.topBarAltText);
  store.dispatch(ACTION_SET_FOOTER_TEXT, theme.footer);
};