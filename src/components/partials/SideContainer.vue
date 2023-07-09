<template>
  <div class="side-container__wrap">
    <div class="side-container__title">
      <slot name="title"></slot>
    </div>
    <div class="side-container" v-if="hasContent">
      <span class="side-container__indicator" :style="{background: indicator}"></span>
      <div class="side-container__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'SideContainer',
  props: ['indicator'],
  computed: {
    hasTitle () {
      return this.$slots.title
    },
    hasContent () {
      return this.$slots.default
    }
  },
  data () {
    return {

    }
  }
}
</script>
