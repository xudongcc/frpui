import "vant/lib/index.css";

import Vue from "vue";
import Vant from "vant";
import App from "./App";
// import router from "./router";
// import store from "./store";

Vue.use(Vant);

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  // router,
  // store,
  template: "<App/>"
}).$mount("#app");
