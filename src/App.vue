<template>
  <div id="app">
    <header id="banner">
      <h1 class="logo">Learn The Shrines</h1>

      <div class="settings">
        <button @click.prevent="toggleSound()" class="settings-button settings-button--sound" :class="{'on': !options.soundOn}" v-if="['/', '/totk', '/botw', '/options', '/totk/', '/botw/', '/options/'].indexOf($router.currentRoute.path) > -1">
          {{ (options.soundOn) ? 'Sound on' : 'Sound off' }}
        </button>

        <button @click.prevent="toggleAdvancedOptions()" class="settings-button settings-button--options" :class="{'on': options.advancedOptions}" v-if="['/', '/options', '/options/'].indexOf($router.currentRoute.path) > -1">
          {{ (options.advancedOptions) ? 'Advanced Options' : 'Simple Options' }}
        </button>
      </div>

    </header>
    <router-view @updateBg="updateBg" @updateScore="updateScore" @updateOptions="updateOptions" @updateQuestion="updateQuestion"></router-view>
    <background-image :game="options.game" :random="randomBg" ref="bg"></background-image>
  </div>
</template>

<script>
/* global gtag */

import BackgroundImage from './components/BackgroundImage'
import TotkShrineData from './data/totk-shrines.json'
import BotwShrineData from './data/botw-shrines.json'

class Sound {
  constructor () {
    this.sound = document.createElement('audio')
    this.sound.src = ''
    this.sound.setAttribute('preload', 'auto')
    this.sound.setAttribute('controls', 'none')
    this.sound.style.display = 'none'
    document.body.appendChild(this.sound)
  }

  play (src) {
    this.sound.src = src
    this.sound.play()
  }
}

window.sound = new Sound()

export default {
  name: 'App',
  components: {
    BackgroundImage
  },
  created () {
    const retrievedOptions = localStorage.getItem('options')
    if (retrievedOptions) {
      this.options = JSON.parse(retrievedOptions)
      if (!this.options.questionTypes) {
        this.options.questionTypes = ['choice', 'map']
      }
      if (this.options.advancedOptions === undefined) {
        this.options.advancedOptions = false
      }
      if (this.options.difficulty === 'text') {
        this.options.difficulty = 'normal'
        this.options.questionTypes = ['text']
      } else if (this.options.difficulty === 'map') {
        this.options.difficulty = 'normal'
        this.options.questionTypes = ['map']
      }
      if (typeof this.options.questionTypes !== 'object') {
        this.options.questionTypes = ['choice', 'map']
      }
      this.updateOptions(this.options)
    }

    const retrievedScore = localStorage.getItem('score')
    if (retrievedScore) {
      this.score = JSON.parse(retrievedScore)
    }

    const retrievedQuestion = localStorage.getItem('question')
    if (retrievedQuestion) {
      this.question = JSON.parse(retrievedQuestion)
    }
  },
  data () {
    return {
      version: '2.1.3',
      shrines: {
        totk: TotkShrineData,
        botw: BotwShrineData
      },
      randomBg: true,
      score: {
        tally: [],
        count: 0
      },
      question: null,
      options: {
        game: 'totk',
        soundOn: true,
        advancedOptions: false,
        includeDLC: false,
        fastMode: true,
        difficulty: 'normal',
        chooseFrom: 4,
        questionTypes: ['choice', 'map']
      }
    }
  },
  methods: {
    updateBg (shrineId, variant) {
      if (shrineId === 'random') {
        this.randomBg = true
      } else {
        this.randomBg = false
        this.$refs.bg.updateImage(shrineId, variant)
      }
    },

    updateScore (correct) {
      if (correct === 'reset') {
        this.question = null
        this.score = {
          tally: [],
          count: 0
        }
        this.saveToStorage('question', this.question)
        this.saveToStorage('score', this.score)
        return
      }

      this.score.count++

      if (this.score.count === 1) {
        this.trackEvent('progression', 'started')
      }

      if (this.score.count === 10) {
        this.trackEvent('progression', 'engaged')
      }

      if (this.score.count === 120) {
        this.trackEvent('progression', 'committed')
      }
      this.score.tally.push(correct ? 1 : 0)

      this.saveToStorage('score', this.score)
    },

    updateOptions (options) {
      this.saveToStorage('options', options)
      this.options = options
    },

    updateQuestion (question) {
      this.saveToStorage('question', question)
      this.question = question
    },

    toggleSound () {
      this.options.soundOn = !this.options.soundOn
      this.saveToStorage('options', this.options)
      this.$forceUpdate()
    },

    toggleAdvancedOptions () {
      this.options.advancedOptions = !this.options.advancedOptions
      this.saveToStorage('options', this.options)
      this.$forceUpdate()
    },

    saveToStorage (name, data) {
      localStorage.setItem(name, JSON.stringify(data))
    },

    trackEvent (action, label) {
      gtag('event', action, {
        event_category: 'quiz',
        event_label: label
      })
    }
  },
  metaInfo: {
    title: 'Learn the Shrines',
    titleTemplate: '%s :: Learn the Shrines'
  }
}
</script>

<style lang="scss" src="./styles/app.scss">
