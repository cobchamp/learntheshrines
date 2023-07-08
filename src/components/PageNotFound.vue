<template>
  <main id="notfound">
    <MainContainer>

      <h1>Oopsy...</h1>
      <ShrineImage game="totk" :image="['005', 'exterior']" alt="Musanokir, the Korok Forest shrine" />

      <p>You've gotten through the Lost Woods, but you're still lost...<br /><router-link to="/">Warp back to a familiar place</router-link></p>
    </MainContainer>
  </main>
</template>
<script>
import ShrineImage from './partials/ShrineImage.vue'

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

<style>
#notfound {
  line-height: 1.4;
}

#notfound a {
  color: #ff7a00;
  font-weight: bold;
  font-style: normal;
}

#notfound h1 {
  margin-top: 32px;
  padding: 0 10%;
  margin-bottom: 32px;
  font-size: 32px;
  text-align: center;
  line-height: 1.4;
}

#notfound p {
  margin-top: 32px;
  margin-bottom: 32px;
  text-align: center;
}
</style>
