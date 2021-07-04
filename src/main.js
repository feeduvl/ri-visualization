import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import './plugins/vuetify';
import LoadScript from 'vue-plugin-load-script';
import {
  routes,
  ROUTE_LOGIN
} from './routes';
import {
  store
} from './store/store';

Vue.config.productionTip = true;
Vue.use(VueRouter);
Vue.use(LoadScript);

const router = new VueRouter({
  base: '/dashboard/',
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  if (to.path !== ROUTE_LOGIN && !store.getters.accessKey) {
    return next(ROUTE_LOGIN);
  }

  next();
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');