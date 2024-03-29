<template>
  <form class="quiz-text" @submit.prevent="answer()">
    <h3>Click in the shrine's general area and press <strong>Guess Here</strong></h3>

    <div id="map"></div>

    <button class="button" @click.prevent="answer" v-if="answered === null" :disabled="!currentGuess">Guess Here</button>

    <p class="map--help-text" v-else>Your guess was <strong>{{ Math.round(distance) }} meters away</strong> ({{ this.answered === this.correct ? 'Within' : 'Not within' }} {{ radius }} meters)</p>
  </form>
</template>

<script>
/* global L */
import 'leaflet'

const TILE_SIZE = 256
const MAP_SIZE = [24000, 20000]
const crs = L.Util.extend({}, L.CRS.Simple)
crs.transformation = new L.Transformation(4 / TILE_SIZE,
  MAP_SIZE[0] / TILE_SIZE,
  4 / TILE_SIZE,
  MAP_SIZE[1] / TILE_SIZE)

export default {
  name: 'QuizMap',
  props: ['correct', 'answered', 'difficulty', 'layer', 'game'],
  mounted () {
    const map = L.map('map', {
      crs: this.crs,
      maxBoundsViscosity: 1.0,
      maxBounds: L.latLngBounds([-5000, -6000], [5000, 6000])
    }).setView([0, 0], 2)

    L.tileLayer(this.mapTilesURL.path + '{z}/{x}/{y}.' + this.mapTilesURL.type, {
      minZoom: 1,
      maxZoom: 5,
      zoomSnap: 0.1,
      maxBoundsViscosity: 1.0
    }).addTo(map)

    map.on('click', (ev) => {
      this.clickHere(ev.latlng)
    })

    this.map = map
    try {
      this.shrineIcon = L.icon({
        iconUrl: require('../assets/' + this.game + '-shrine.svg'),
        iconSize: L.point(32, 32)
      })
    } catch (e) {
      console.error(e)
    }
  },
  watch: {
    answered (to) {
      if (to == null) {
        this.currentGuess = null
        this.currentGuessLayer.clearLayers()
        this.map.setView([0, 0], 2)
      }
    },
    mapLayer () {
      L.tileLayer(this.mapTilesURL.path + '{z}/{x}/{y}.' + this.mapTilesURL.type, {
        minZoom: 2,
        maxZoom: 5,
        maxBoundsViscosity: 1.0
      }).addTo(this.map)
    }
  },
  computed: {
    radius () {
      switch (this.difficulty) {
        case 'easy':
          return 700
        case 'hard':
          return 250
        default:
          return 350
      }
    },
    correctLatLng () {
      return L.latLng(this.correct[1], this.correct[0])
    },
    mapLayer () {
      return this.layer === 'Surface' ? 'Ground' : 'Sky'
    },
    mapTilesURL () {
      if (this.game === 'botw') {
        return {
          path: 'https://objmap.zeldamods.org/game_files/maptex/',
          type: 'png'
        }
      } else {
        if (this.layer === 'Surface') {
          return {
            path: 'https://objmap-totk.zeldamods.org/game_files/map/Ground/maptex/',
            type: 'webp'
          }
        } else {
          return {
            path: 'https://objmap-totk.zeldamods.org/game_files/map/Sky/maptex/',
            type: 'webp'
          }
        }
      }
    }
  },
  data () {
    return {
      map: null,
      crs: crs,
      currentGuess: null,
      currentGuessLayer: L.layerGroup([]),
      shrineIcon: null,
      distance: 0
    }
  },
  methods: {
    clickHere (guess) {
      if (this.answered !== null) {
        return
      }
      this.currentGuess = guess
      if (this.currentGuessLayer.getLayers().length === 1) {
        this.currentGuessLayer.getLayers()[0].setLatLng(guess)
      } else if (this.currentGuessLayer.getLayers().length === 0) {
        this.currentGuessLayer.addLayer(L.circle(guess, { radius: this.radius, color: '#FFFFFF', stroke: false, fillOpacity: 0.4 }))
        this.currentGuessLayer.addTo(this.map)
      }
    },
    answer () {
      if (!this.currentGuess) {
        this.$alert('Click the map before making a guess')
        return
      }
      this.distance = this.crs.distance(this.correctLatLng, this.currentGuess)
      this.currentGuessLayer.addLayer(L.marker(this.correctLatLng, { icon: this.shrineIcon }))
      const currentGuessLayers = []
      this.currentGuessLayer.eachLayer((layer) => {
        currentGuessLayers.push(layer.getLatLng())
      })
      const currentGuessBounds = L.latLngBounds(currentGuessLayers).pad(0.2)
      this.map.fitBounds(currentGuessBounds)
      if (this.distance <= this.radius) {
        this.currentGuessLayer.getLayers()[0].setStyle({ color: '#56B81A' })
        this.$emit('answer', this.correct)
      } else {
        this.currentGuessLayer.getLayers()[0].setStyle({ color: '#B85C1A' })
        this.$emit('answer', '')
      }
    }
  }
}
</script>

<style>
  #map {
    overflow: hidden;
    margin-bottom: 16px;
    height: 260px;
    border-radius: 8px;
    background: rgba(0, 0, 0, .4);
    box-shadow: 0 0 0 2px rgba(190,190,190,.2);
  }

  #map:not(.leaflet-drag-target) {
    cursor: pointer;
  }

  .map--help-text {
    display: block;
    text-align: center;
    font-style: italic;
  }

  #map .leaflet-control-attribution {
    display: none;
  }
</style>

<style src="leaflet/dist/leaflet.css" />
