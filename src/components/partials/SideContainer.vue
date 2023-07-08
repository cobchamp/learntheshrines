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

<style>
.side-container__title h2 {
  font-size: 20px;
  font-weight: normal;
  line-height: 1.2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, .4);
}

.side-container__title h2 strong {
  display: block;
}

.side-container__content h3 {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: normal;
  color: rgb(190,190,190);
}

@media (max-width: 1023px) {
  .side-container__title h2 {
    font-size: 18px;
  }
  .side-container__content h3 {
    font-size: 16px;
  }
}

</style>
