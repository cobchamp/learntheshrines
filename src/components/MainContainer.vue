<template>
  <div class="main-container__wrap">
      <div class="main-container">
      <app-menu :game="options.game"></app-menu>

      <div class="main-container__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>

import AppMenu from '../components/AppMenu'

export default {
  name: 'MainContainer',
  components: {
    AppMenu
  },
  computed: {
    options () {
      return this.$parent.options
    }
  },
  data () {
    return {

    }
  }
}
</script>
