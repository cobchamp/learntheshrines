<template>
  <main id="shrine-info">
    <MainContainer>
      <template v-if="shrine && game === 'totk'">
        <ShrineImage :game="game" :image="[shrine.id, 'title']" v-if="hasImages(shrine, 'title')" :alt="`${shrine.name}: ${shrine.trial} in The Legend of Zelda: Tears of the Kingdom`"/>

        <h1><strong>{{ shrine.name }}:</strong> {{ shrine.trial }} <a class="button button--objmap" :href="`https://objmap-totk.zeldamods.org/#/map/z6,${shrine.coords[0]},${shrine.coords[1]}?id==Totk,${shrine.layer},${shrine.hash_id}`" title="Open in Object Map" v-if="shrine.coords" target="_blank">(Open in Object Map)</a></h1>

        <div class="about-shrine">
          <p>{{ shrine.name }} is a {{ shrine.layer }} shrine in the <strong>{{ shrine.region }}</strong> region on the <strong>{{ shrine.map }}</strong> Skyview Tower map<template v-if="shrine.major_landmark || shrine.minor_landmark"> near {{ shrine.major_landmark || shrine.minor_landmark }}</template></p>
        </div>

        <ShrineImage :game="game" :image="[shrine.id, 'exterior']" v-if="hasImages(shrine, 'exterior')" :alt="shrineDescription" />

        <ShrineImage :game="game" :image="[shrine.id, 'map']" v-if="hasImages(shrine, 'map')" :alt="shrineDescription" />

        <div class="about-shrine" v-if="shrine.layer === 'Surface'">
          <p>In the {{ shrine.region }} Depths below is the <strong>{{ lightrootify(shrine.name) }} Lightroot</strong></p>
        </div>

        <hr />

        <div class="about-shrine">
          <p>The trial in this shrine is <strong>{{ shrine.trial }}</strong></p>
        </div>

        <ShrineImage :game="game" :image="[shrine.id, 'interior']" v-if="hasImages(shrine, 'interior')" :alt="`The '${shrine.trial}' trial in the shrine ${shrine.name}`"/>

        <template v-if="shrine.layer=='Surface' && shrine.cave_or_island">
          <hr />

          <div class="about-shrine">
            <p>{{ shrine.name }} can be found within the <strong>{{ shrine.cave_or_island }}</strong></p>
          </div>

          <ShrineImage :game="game" :image="[shrine.id, 'cave_or_island']" v-if="hasImages(shrine, 'cave_or_island')" :alt="`${shrine.cave_or_island} in the ${shrine.region} region`" />
        </template>

        <template v-else-if="shrine.layer=='Sky' && shrine.cave_or_island">
          <hr />

          <div class="about-shrine">
            <p>{{ shrine.name }} can be found on the <strong>{{ shrine.cave_or_island }}</strong></p>
          </div>

          <ShrineImage :game="game" :image="[shrine.id, 'cave_or_island']" v-if="hasImages(shrine, 'cave_or_island')" :alt="`${shrine.cave_or_island} in the ${shrine.region} region`" />
        </template>

        <template v-if="shrine.quest">
          <hr />

          <div class="about-shrine">
            <p>Completing the quest <strong>{{ shrine.quest }}</strong> will grant passage to this shrine</p>
          </div>

          <ShrineImage :game="game" :image="[shrine.id, 'quest']" v-if="hasImages(shrine, 'quest')" :alt="shrine.quest" />
        </template>

        <template v-if="shrine.items">
          <hr />

          <div class="about-shrine">
            <p>{{ shrine.name }} contains <strong>{{ shrine.items }}</strong></p>
          </div>
        </template>
      </template>
      <template v-else-if="shrine && game === 'botw'">
        <ShrineImage :game="game" :image="[shrine.id, 'title']" v-if="hasImages(shrine, 'title')" :alt="`${shrine.name}: ${shrine.trial} in The Legend of Zelda: Breath of the Wild`"/>

        <h1><strong>{{ shrine.monk }}:</strong> {{ shrine.trial }} <a class="button button--objmap" :href="`https://objmap.zeldamods.org/#/map/z6,${shrine.coords[0]},${shrine.coords[1]}?q=%22${shrine.monk}%22`" title="Open in Object Map" v-if="shrine.coords" target="_blank">(Open in Object Map)</a></h1>

        <div class="about-shrine">
          <p>{{ shrine.monk }} is in the <strong>{{ shrine.region }}</strong> region<template v-if="shrine.landmark || shrine.minor_landmark"> near {{ shrine.landmark || shrine.minor_landmark }}</template></p>
        </div>

        <ShrineImage :game="game" :image="[shrine.id, 'exterior']" v-if="hasImages(shrine, 'exterior')" :alt="shrineDescription" />

        <hr />

        <div class="about-shrine">
          <p>The trial in this shrine is <strong>{{ shrine.trial }}</strong></p>
        </div>

        <ShrineImage :game="game" :image="[shrine.id, 'interior']" v-if="hasImages(shrine, 'interior')" :alt="`The '${shrine.trial}' trial in the shrine ${shrine.name}`"/>

        <template v-if="shrine.quest">
          <hr />

          <div class="about-shrine">
            <p>Completing the quest <strong>{{ shrine.quest }}</strong> will grant passage to this shrine</p>
          </div>

          <ShrineImage :game="game" :image="[shrine.id, 'quest']" v-if="hasImages(shrine, 'quest')" :alt="shrine.quest" />
        </template>

        <template v-if="shrine.main_item">
          <hr />

          <div class="about-shrine">
            <p>{{ shrine.monk }} contains <strong>{{ shrine.main_item }}</strong></p>
          </div>
        </template>

      </template>

      <template v-else>
        <h1>Shrine not Found "{{searchingFor}}"</h1>
      </template>
    </MainContainer>

    <SideContainer >
      <template v-slot:title>
        <h2>
          Lookup info for any shrine
        </h2>
      </template>

      <h3>Search for Shrine</h3>
      <input type="text" ref="text-input" class="text-input" v-model="searchingFor" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <perfect-scrollbar ref="scroll">
        <nav v-if="filteredShrines.length > 0">
          <ul class="shrine-list">
            <li v-for="shrine in filteredShrines" v-bind:key="shrine.id">
              <router-link :to="'/'+game+'-shrines/'+zonaiNameURLSafe(shrine.name)" :ref="zonaiNameURLSafe(shrine.name)" v-if="game === 'totk'">
                <strong>{{ shrine.name }}:</strong> {{ shrine.trial }}
              </router-link>
              <router-link :to="'/'+game+'-shrines/'+monkNameURLSafe(shrine.monk)" :ref="monkNameURLSafe(shrine.monk)" v-else>
                <strong>{{ shrine.monk }}:</strong> {{ shrine.trial }}
              </router-link>
            </li>
          </ul>
        </nav>
        <p v-else class="text-input--help-text">No results</p>
      </perfect-scrollbar>
      <p v-if="filteredShrines.length > 0 && searchingFor" class="text-input--help-text">Found {{ filteredShrines.length }} shrines matching "{{ searchingFor }}"</p>
      <button class="button button--randomize" @click="randomShrine">Random Shrine</button>
    </SideContainer>
  </main>
</template>
<script>

/* global _ */

import { hasImages, monkNameURLSafe, zonaiNameURLSafe, lightrootify } from '../lib/quiz.js'
import ShrineImage from './partials/ShrineImage.vue'
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'

export default {
  name: 'ShrineInfo',
  components: {
    ShrineImage,
    PerfectScrollbar
  },
  mounted () {
    this.$emit('updateBg', 'random')
    const shrine = this.getShrineByName(this.$route.params.search)

    if (!shrine) {
      this.searchingFor = this.$route.params.search ? this.$route.params.search.replace('-', ' ') : null

      if (!this.searchingFor) {
        this.randomShrine()
      } else {
        let shrineIdentifier = (this.game === 'totk') ? this.zonaiNameURLSafe(this.filteredShrines[0].name) : this.monkNameURLSafe(this.filteredShrines[0].monk)
        this.$router.push('/' + this.game + '-shrines/' + shrineIdentifier)
      }
    } else {
      this.$emit('updateBg', shrine.id)
      this.scrollToShrine((this.game === 'totk') ? this.zonaiNameURLSafe(shrine.name) : this.monkNameURLSafe(shrine.monk))
    }
  },
  watch: {
    shrine (to) {
      if (this.hasImages(to, 'exterior')) {
        this.$emit('updateBg', to.id)
      }
    },
    filteredShrines (to) {
      if (to.length === this.shrines.length) {
        this.scrollToShrine((this.game === 'totk') ? this.zonaiNameURLSafe(this.shrine.name) : this.monkNameURLSafe(this.shrine.monk))
      }
    }
  },
  computed: {
    game () {
      return this.$route.path.split('-')[0].slice(1)
    },
    options () {
      return this.$parent.options
    },
    shrines () {
      return _.sortBy(this.$parent.shrines[this.game], ['name', 'monk'])
    },
    shrine () {
      return this.getShrineByName(this.$route.params.search)
    },
    filteredShrines () {
      const search = this.searchingFor
      return _.filter(this.shrines, o => {
        if (!search || search.length < 2) {
          return true
        }

        if (o['name'] && o['name'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['monk'] && o['monk'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['trial'] && o['trial'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['region'] && o['region'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['map'] && o['map'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['landmark'] && o['landmark'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['major_landmark'] && o['major_landmark'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['minor_landmark'] && o['minor_landmark'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['quest'] && o['quest'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }

        if (o['cave_or_island'] && o['cave_or_island'].toLowerCase().indexOf(search.toLowerCase()) > -1) {
          return true
        }
      })
    },
    shrineName () {
      if (this.shrine) {
        if (this.game === 'totk') {
          return this.shrine.name + ': ' + this.shrine.trial + ' :: TOTK'
        } else { // botw
          return this.shrine.monk + ': ' + this.shrine.trial + ' :: BOTW'
        }
      } else {
        return ''
      }
    },
    shrineDescription () {
      if (this.shrine) {
        if (this.game === 'totk') {
          let shrineDescription = `${this.shrine.name}: ${this.shrine.trial} is a ${this.shrine.layer} shrine in the ${this.shrine.region} region on the ${this.shrine.map} Skyview Tower map`
          if (this.shrine.major_landmark || this.shrine.minor_landmark) {
            shrineDescription += ' near ' + (this.shrine.major_landmark || this.shrine.minor_landmark)
          }
          if (this.shrine.cave_or_island && this.shrine.layer === 'Surface') {
            shrineDescription += ' inside the ' + (this.shrine.cave_or_island)
          } else if (this.shrine.cave_or_island && this.shrine.layer === 'Sky') {
            shrineDescription += ' on the sky island of ' + (this.shrine.cave_or_island)
          }
          return shrineDescription
        } else { // botw
          return `${this.shrine.monk}: ${this.shrine.trial} is a shrine in the ${this.shrine.region} region${(this.shrine.landmark || this.shrine.minor_landmark) ? ' near ' + (this.shrine.landmark || this.shrine.minor_landmark) : ''}`
        }
      } else {
        return ''
      }
    },
    shrineURL () {
      if (this.shrine) {
        if (this.game === 'totk') {
          return 'https://learntheshrines.com/totk-shrines/' + this.zonaiNameURLSafe(this.shrine.name)
        } else { // botw
          return 'https://learntheshrines.com/botw-shrines/' + this.monkNameURLSafe(this.shrine.monk)
        }
      } else {
        return ''
      }
    },
    shrineImage () {
      if (this.shrine) {
        if (this.hasImages(this.shrine, 'exterior')) {
          return 'https://learntheshrines.com/images/' + this.game + '/' + this.shrine.id + '-exterior.jpg'
        } else {
          return 'https://learntheshrines.com/images/' + this.game + '/' + this.shrine.id + '-title.jpg'
        }
      } else {
        return ''
      }
    }
  },
  data () {
    return {
      searchingFor: ''
    }
  },
  methods: {
    hasImages,
    monkNameURLSafe,
    zonaiNameURLSafe,
    lightrootify,
    getShrineByName (name) {
      if (this.game === 'totk') {
        return _.find(this.shrines, o => this.monkNameURLSafe(o.name) === name)
      } else { // botw
        return _.find(this.shrines, o => this.monkNameURLSafe(o.monk) === name)
      }
    },
    randomShrine () {
      let randomShrine = this.getRandomShrine()
      let shrineIdentifier = (this.game === 'totk') ? this.zonaiNameURLSafe(randomShrine.name) : this.monkNameURLSafe(randomShrine.monk)
      this.searchingFor = ''
      this.$router.push('/' + this.game + '-shrines/' + shrineIdentifier)
      this.scrollToShrine(shrineIdentifier)
    },
    getRandomShrine () {
      const randomShrine = this.shrines[Math.floor(Math.random() * this.shrines.length) - 1]
      return randomShrine
    },
    scrollToShrine (shrineIdentifier) {
      setTimeout(() => {
        if (this.$refs[shrineIdentifier][0]) {
          this.$refs.scroll.$el.scrollTop = this.$refs[shrineIdentifier][0].$el.offsetTop - 2
        }
      }, 100)
    }
  },
  metaInfo () {
    return {
      title: this.shrineName,
      meta: [
        {name: 'description', content: this.shrineDescription},
        {property: 'og:title', content: this.shrineName + ' :: Learn the Shrines'},
        {property: 'og:site_name', content: 'Learn the Shrines'},
        {property: 'og:type', content: 'website'},
        {property: 'og:url', content: this.shrineURL},
        {property: 'og:image', content: this.shrineImage},
        {property: 'og:description', content: this.shrineDescription},

        {name: 'twitter:card', content: 'summary'},
        {name: 'twitter:site', content: this.shrineURL},
        {name: 'twitter:title', content: this.shrineName + ' :: Learn the Shrines'},
        {name: 'twitter:description', content: this.shrineDescription},

        {name: 'twitter:creator', content: '@cobwoms'},
        {name: 'twitter:image:src', content: this.shrineImage},

        {itemprop: 'name', content: this.shrineName + ' :: Learn the Shrines'},
        {itemprop: 'description', content: this.shrineDescription},
        {itemprop: 'image', content: this.shrineImage}
      ],
      link: [
        {rel: 'canonical', href: this.shrineURL}
      ]
    }
  }
}
</script>

<style>
@keyframes radiateGlow {
  from {
    box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #f7e17b, inset 0 0 6px 4px #f7e17b;
  }
  to {
    box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  }
}

#shrine-info {
  line-height: 1.4;
}

#shrine-info h1 {
  margin-top: 32px;
  padding: 0 10%;
  margin-bottom: 32px;
  font-weight: normal;
  font-size: 32px;
  text-align: center;
  line-height: 1.4;
}

.shrine-image {
  margin-top: 32px;
  margin-bottom: 32px;
}

.about-shrine {
  margin-top: 32px;
  margin-bottom: 32px;
  font-size: 20px;
  text-align: center;
  line-height: 1.4;
}

.about-shrine p {
  margin-top: 32px;
  margin-bottom: 32px;
}

.shrine-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.ps {
  position: relative;
  margin-bottom: 16px;
  padding: 2px;
  max-height: 180px;
}

.ps--active-y {
  margin-right: -16px;
  padding-right: 16px;
}

.shrine-list a {
  display: block;
  margin: 0 0 8px;
  padding: 8px;
  width: 100%;
  border-radius: 6px;
  border: 0;
  background: rgba(0, 0, 0, .7);
  color: white;
  box-shadow: 0 0 4px #000, 0 0 0 2px rgba(190,190,190,.2);
  font-size: 20px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

.shrine-list a:hover {
  outline: 0;
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.shrine-list .router-link-active {
  background: rgba(17, 36, 5, .7);
  box-shadow: 0 0 4px #000, 0 0 0 2px #56B81A;
  color: #56B81A;
}

.text-input {
  margin: 0 0 8px;
  padding: 16px 32px;
  display: block;
  width: 100%;
  background: rgba(0, 0, 0, .4);
  border: 0;
  border-bottom: solid 2px #fff;
  color: #fff;
  font-size: 20px;
  line-height: 1;
}

.text-input:focus {
  outline: 0;
  background: rgba(0, 0, 0, 1);
}

.text-input--help-text {
  display: block;
  margin-top: 0;
  text-align: center;
  font-style: italic;
  color: rgb(190,190,190);
}

.button--randomize {
  display: inline-block;
  width: auto;
  padding-left: 48px;
  box-shadow: none;
  background: no-repeat 6px center / 32px 32px;
  background-image: url('../assets/random.png');
  font-weight: normal;
}

.button--randomize:hover,
.button--randomize:focus {
  box-shadow: none;
  background: no-repeat 6px center / 32px 32px;
  background-image: url('../assets/random.png');
  animation: none;
}

.button--objmap {
  text-indent: 100%;
  overflow: hidden;
  text-decoration: none;
  display: inline-block;
  font-size: 0;
  text-align: start;
  white-space: nowrap;
  margin-bottom: 0;
  padding: 0 8px;
  width: 32px;
  height: 32px;
  box-shadow: none;
  border-radius: 0;
  background: no-repeat center center / 32px 32px;
  background-image: url('../assets/objmap.png');
  font-weight: normal;
  vertical-align: top;
}

.button--objmap:hover,
.button--objmap:focus {
  box-shadow: none;
  background: no-repeat center center / 32px 32px;
  background-image: url('../assets/objmap.png');
  animation: none;
}

@media (max-width: 1250px) {
  .shrine-image {
    margin-bottom: 16px;
  }

  #shrine-info h1,
  .about-shrine,
  .about-shrine p {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  #shrine-info h1 {
    font-size: 24px;
  }

  .about-shrine {
    font-size: 18px;
  }

  .shrine-list a {
    padding: 8px 16px;
    font-size: 16px;
  }
}

</style>

<style src="vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css" />
