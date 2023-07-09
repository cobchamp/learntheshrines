<template>
  <nav id="app-menu">
    <router-link to="/totk" v-if="game == 'totk'" class="nav-icon">
      <img src="../assets/totk-shrine-icon.jpg" width="32" height="32" />
      <span class="label">Shrine Quiz</span>
    </router-link>
    <router-link to="/botw" v-if="game == 'botw'" class="nav-icon">
      <img src="../assets/botw-shrine-icon.jpg" width="32" height="32" />
      <span class="label">Shrine Quiz</span>
    </router-link>
    <router-link :to="'/' + game + '-shrines' + (($route.params.search) ? '/' + $route.params.search : '')" class="nav-icon">
      <img src="../assets/search-icon.jpg" width="32" height="32" />
      <span class="label">Shrine Info</span>
    </router-link>
    <router-link to="/options" class="nav-icon" :class="{'router-link-active': $router.currentRoute.path=='/'}">
      <img src="../assets/options-icon.jpg" width="32" height="32" />
      <span class="label">Options</span>
    </router-link>
    <router-link to="/about" class="nav-icon">
      <img src="../assets/about-icon.jpg" width="32" height="32" />
      <span class="label">About</span>
    </router-link>
  </nav>
</template>
<script>

export default {
  name: 'AppMenu',
  props: ['game'],
  data () {
    return {
    }
  }
}
</script>
