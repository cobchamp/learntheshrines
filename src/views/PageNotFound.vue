<template>
  <main id="notfound" class="page one-col">
    <MainContainer>

      <h1>Oopsy...</h1>
      <ShrineImage game="totk" :image="['005', 'exterior']" alt="Musanokir, the Korok Forest shrine" />

      <p>You've gotten through the Lost Woods, but you're still lost...<br /><router-link to="/">Warp back to a familiar place</router-link></p>
    </MainContainer>
  </main>
</template>
<script>
import ShrineImage from '../components/ShrineImage.vue'

export default {
  name: 'PageNotFound',
  components: {
    ShrineImage
  },
  mounted () {
    this.$emit('updateBg', '005')
  },
  computed: {
    options () {
      return this.$parent.options
    }
  },
  data () {
    return {
    }
  },
  metaInfo: {
    title: 'Whoops!'
  }
}
</script>

<style lang="scss" src="../styles/pages.scss" />
