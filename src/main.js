// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Meta from 'vue-meta'
import VueRouter from 'vue-router'
import VueSimpleAlert from 'vue-simple-alert'

// views
import App from './App'
import OptionsPage from './views/OptionsPage'
import AboutPage from './views/AboutPage'
import TotkQuiz from './views/TotkQuiz'
import BotwQuiz from './views/BotwQuiz'
import ShrineInfo from './views/ShrineInfo'
import PageNotFound from './views/PageNotFound'
import SiteMap from './views/SiteMap'

// partials
import MainContainer from './components/MainContainer'
import SideContainer from './components/SideContainer'

import _filter from 'lodash/filter'
import _random from 'lodash/random'
import _sample from 'lodash/sample'
import _shuffle from 'lodash/shuffle'
import _concat from 'lodash/concat'
import _slice from 'lodash/slice'
import _uniqBy from 'lodash/uniqBy'
import _map from 'lodash/map'
import _merge from 'lodash/merge'
import _sortBy from 'lodash/sortBy'
import _find from 'lodash/find'

Vue.set(Vue.prototype, '_filter', _filter)
Vue.set(Vue.prototype, '_random', _random)
Vue.set(Vue.prototype, '_sample', _sample)
Vue.set(Vue.prototype, '_shuffle', _shuffle)
Vue.set(Vue.prototype, '_concat', _concat)
Vue.set(Vue.prototype, '_slice', _slice)
Vue.set(Vue.prototype, '_uniqBy', _uniqBy)
Vue.set(Vue.prototype, '_map', _map)
Vue.set(Vue.prototype, '_merge', _merge)
Vue.set(Vue.prototype, '_sortBy', _sortBy)
Vue.set(Vue.prototype, '_find', _find)

Vue.config.productionTip = false

const routes = [
  { path: '/', component: OptionsPage },
  { path: '/options/', component: OptionsPage },
  { path: '/about/', component: AboutPage },
  { path: '/totk/', component: TotkQuiz },
  { path: '/botw/', component: BotwQuiz },
  { path: '/totk-shrines/', component: ShrineInfo },
  { path: '/totk-shrines/:search/', component: ShrineInfo },
  { path: '/botw-shrines/', component: ShrineInfo },
  { path: '/botw-shrines/:search/', component: ShrineInfo },
  { path: '/sitemap', component: SiteMap },
  { path: '*', component: PageNotFound }
]
const router = new VueRouter({
  routes,
  mode: 'history'
})

window.dataLayer = window.dataLayer || []
function gtag () {
  window.dataLayer.push(arguments)
}
window.gtag = gtag
gtag('js', new Date())
gtag('config', 'G-BWXNK1XP6T')

router.afterEach((to, from) => {
  gtag('config', 'G-BWXNK1XP6T', { page_path: to.path })

  gtag('event', 'screen_view', {
    app_name: 'Learn The Shrines',
    screen_name: to.path
  })
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
