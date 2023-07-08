// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Meta from 'vue-meta'
import VueRouter from 'vue-router'
import VueSimpleAlert from 'vue-simple-alert'

// views
import App from './App'
import OptionsPage from './components/OptionsPage'
import AboutPage from './components/AboutPage'
import TotkQuiz from './components/TotkQuiz'
import BotwQuiz from './components/BotwQuiz'
import ShrineInfo from './components/ShrineInfo'
import PageNotFound from './components/PageNotFound'
import SiteMap from './components/SiteMap'

// partials
import MainContainer from './components/partials/MainContainer'
import SideContainer from './components/partials/SideContainer'

// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

Vue.config.productionTip = false

const routes = [
  { path: '/', component: OptionsPage },
  { path: '/options', component: OptionsPage },
  { path: '/about', component: AboutPage },
  { path: '/totk', component: TotkQuiz },
  { path: '/botw', component: BotwQuiz },
  { path: '/totk-shrines', component: ShrineInfo },
  { path: '/totk-shrines/:search', component: ShrineInfo },
  { path: '/botw-shrines', component: ShrineInfo },
  { path: '/botw-shrines/:search', component: ShrineInfo },
  { path: '/sitemap', component: SiteMap },
  { path: '*', component: PageNotFound }
]
const router = new VueRouter({
  routes,
  mode: 'history'
})

Vue.component('MainContainer', MainContainer)
Vue.component('SideContainer', SideContainer)
Vue.use(VueSimpleAlert)
Vue.use(VueRouter)
Vue.use(Meta)

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  components: { App },
  template: '<App/>',
  mounted () {
    // You'll need this for renderAfterDocumentEvent.
    document.dispatchEvent(new Event('render-event'))
  }
})
