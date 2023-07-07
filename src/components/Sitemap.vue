<!-- eslint-disable -->
<!-- this page is just to automate creating the sitemap.xml... i just copy-paste it from the browser lol -->
<template>
  <main id="sitemap">
    <MainContainer>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
      <loc>https://learntheshrines.com</loc>
    </url>
    <url>
      <loc>https://learntheshrines.com/about</loc>
    </url>
    <url>
      <loc>https://learntheshrines.com/totk</loc>
    </url>
    <url>
      <loc>https://learntheshrines.com/botw</loc>
    </url>
    <url v-for="shrine in shrines['totk']" v-bind:key="shrine.id">
      <loc>https://learntheshrines.com/totk-shrines/{{ zonaiNameURLSafe (shrine.name) }}</loc>
    </url>
    <url v-for="shrine in shrines['botw']" v-bind:key="shrine.id">
      <loc>https://learntheshrines.com/botw-shrines/{{ monkNameURLSafe (shrine.monk) }}</loc>
    </url>
  </urlset>
    </MainContainer>
  </main>
</template>
<script>
import { monkNameURLSafe, zonaiNameURLSafe } from '../lib/quiz.js'

export default {
  name: 'Sitemap',
  mounted () {
    this.$emit('updateBg', 'random')
  },
  computed: {
    options () {
      return this.$parent.options
    },
    shrines () {
      return this.$parent.shrines
    }
  },
  data () {
    return {
    }
  },
  methods: {
    zonaiNameURLSafe,
    monkNameURLSafe
  },
  metaInfo: {
    title: 'Sitemap'
  }
}
</script>

<style>
#sitemap {
  line-height: 1.4;
}
</style>
