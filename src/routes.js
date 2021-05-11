/* eslint-disable */
export const ROUTE_EMPTY = "";
export const ROUTE_DEFAULT = "/";
export const ROUTE_ALL = "*";
export const ROUTE_DASHBOARD = "/dashboard";
export const ROUTE_LOGIN = "/login";
export const ROUTE_PROBLEM_REPORTS = "/problemReports";
export const ROUTE_INQUIRIES = "/inquiries";
export const ROUTE_COMPARISON = "/comparison";
export const ROUTE_SETTINGS = "/settings";
export const ROUTE_UPLOAD = "/upload";
export const ROUTE_START_DETECTION = "/detection";

export const routes = [{
    path: ROUTE_EMPTY,
    redirect: ROUTE_DASHBOARD
  },
  {
    path: ROUTE_DASHBOARD,
    component: () => import('./components/DashboardHome.vue')
  },
  {
    path: ROUTE_LOGIN,
    component: () => import('./components/LoginHome.vue')
  },
  {
    path: ROUTE_PROBLEM_REPORTS,
    component: () => import('./components/ProblemReportsHome.vue')
  },
  {
    path: ROUTE_INQUIRIES,
    component: () => import('./components/InquiriesHome.vue')
  },
  {
    path: ROUTE_COMPARISON,
    component: () => import('./components/CompetitorComparisonHome.vue')
  },
  {
    path: ROUTE_SETTINGS,
    component: () => import('./components/SettingsHome.vue')
  },
  {
    path: ROUTE_UPLOAD,
    component: () => import('./components/UploadHome.vue')
  },
  {
    path: ROUTE_START_DETECTION,
    component: () => import('./components/StartDetectionHome.vue')
  },
  {
    path: ROUTE_ALL,
    redirect: ROUTE_DASHBOARD
  }
];