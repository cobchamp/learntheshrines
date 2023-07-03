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

<style>
#app-menu {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  position: relative;
  display: block;
  margin: 0 16px;
  width: 32px;
  height: 32px;
}

.nav-icon img {
  opacity: .2;
}

.nav-icon:hover img,
.nav-icon.router-link-active img {
  opacity: 1;
}

.nav-icon .label {
  position: absolute;
  top: -26px;
  left: 50%;
  padding: 0 16px;
  width: auto;
  height: 20px;
  border-radius: 10px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: #000;
  line-height: 22px;
  opacity: 0;
}

.nav-icon.router-link-active .label {
  opacity: 1;
}

</style>
