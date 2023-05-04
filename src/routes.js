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
export const ROUTE_ANNOTATION = "/annotation";
export const ROUTE_AGREEMENT = "/agreement";
export const ROUTE_RESULTS = "/results";
export const ROUTE_DOCUMENTS = "/documents";
export const ROUTE_DATASET = "/dataset";
export const ROUTE_REDDIT_CRAWLER = "/reddit_crawler";
export const ROUTE_APP_REVIEW_CRAWLER = "/app_review_crawler";
export const ROUTE_JIRA = "/jira";

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
    path: ROUTE_ANNOTATION,
    component: () => import('./components/annotator/Annotator')
  },
  {
    path: ROUTE_AGREEMENT,
    component: () => import('./components/agreement/Agreement')
  },
  {
    path: ROUTE_RESULTS,
    component: () => import('./components/ResultsHome.vue')
  },
  {
    path: ROUTE_DOCUMENTS,
    component: () => import('./components/DocumentsHome.vue')
  },
  {
    path: ROUTE_DATASET,
    component: () => import('./components/DatasetHome.vue')
  },
  {
    path: ROUTE_DATASET,
    component: () => import('./components/DatasetHome.vue')
  },
  {
    path: ROUTE_REDDIT_CRAWLER,
    component: () => import('./components/RedditCrawler.vue')
  },
  {
    path: ROUTE_APP_REVIEW_CRAWLER,
    component: () => import('./components/AppReviewCrawler.vue')
  },
  {
    path: ROUTE_JIRA,
    component: () => import('./components/JiraDashboard.vue')
  },
  {
    path: ROUTE_ALL,
    redirect: ROUTE_DASHBOARD
  }
];