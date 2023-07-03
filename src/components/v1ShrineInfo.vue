<!-- coming soon -->
<template>
  <div>
    <div class="shrine" v-if="shrineData">
      <h1><strong>{{ shrineData.monk}}</strong></h1>

      <img :src="'static/images/'+shrineData.id+'-title.jpg'" class="image" v-if="hasImages(shrineData, ['title'])" />

      <h2>Contains the trial <strong>{{ shrineData.trial }}</strong></h2>

      <img :src="'static/images/'+shrineData.id+'-internal.jpg'" class="image" v-if="hasImages(shrineData, ['internal'])" />

      <h2>Is in the <strong>{{ shrineData.region}}</strong> region <template v-if="shrineData.landmark">near the <strong>{{ shrineData.landmark }}</strong></template><template v-else-if="shrineData.minor_landmark">near the <strong>{{ shrineData.minor_landmark }}</strong></template></h2>

      <img :src="'static/images/'+shrineData.id+'-external.jpg'" class="image" v-if="hasImages(shrineData, ['external'])" />

      <template v-if="shrineData.quest">
        <h2>This shrine is rewarded for completing the <strong>{{ shrineData.quest }}</strong> quest</h2>

        <img :src="'static/images/'+shrineData.id+'-quest.jpg'" class="image" v-if="hasImages(shrineData, ['quest'])" />
      </template>

      <p>Chests inside {{ shrineData.monk }} may contain <strong>{{ shrineData.main_item }}</strong></p>
    </div>
    <div v-else>
      No shrine found
    </div>

    <router-link to="/">Back to quiz</router-link>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'ShrineInfo',
  props: {
    shrine: {
      type: String
    }
  },
  watch: {
    $route (to, from) {
      this.shrineData = _.find(shrines, { 'shrine_name': to.params.shrine })
    }
  },
  mounted () {
    this.shrineData = _.find(shrines, { 'shrine_name': this.shrine })
  },
  methods: {
    hasImages (shrine, images) {
      if (!shrine.missing_images) {
        return true
      }
      for (let i = 0; i < images.length; i++) {
        if (shrine.missing_images.indexOf(images[i]) >= 0) {
          return false
        }
      }
      return true
    }
  },
  data () {
    return {
      shrineData: {}
    }
  }
}
</script>

<style scoped>
h1,
h2 {
  font-weight: normal;
}

.shrine {
  margin: 0 auto 100px;
  max-width: 800px;
}

.shrine img {
  max-width: 100%;
  height: auto;
}

@media (min-width: 800px) {
  .shrine {
    margin-bottom: 0;
  }
}
</style>
