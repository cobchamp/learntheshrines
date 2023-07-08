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

import BackgroundImage from './components/partials/BackgroundImage'
import TotkShrineData from './data/totk-shrines.json'
import BotwShrineData from './data/botw-shrines.json'

let Sound = () => {
  this.sound = document.createElement('audio')
  this.sound.src = ''
  this.sound.setAttribute('preload', 'auto')
  this.sound.setAttribute('controls', 'none')
  this.sound.style.display = 'none'
  document.body.appendChild(this.sound)
  this.play = (src) => {
    this.sound.src = src
    this.sound.play()
  }
  return this
}

window.sound = new Sound()

export default {
  name: 'App',
  components: {
    BackgroundImage
  },
  created () {
    let retrievedOptions = localStorage.getItem('options')
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

    let retrievedScore = localStorage.getItem('score')
    if (retrievedScore) {
      this.score = JSON.parse(retrievedScore)
    }

    let retrievedQuestion = localStorage.getItem('question')
    if (retrievedQuestion) {
      this.question = JSON.parse(retrievedQuestion)
    }
  },
  data () {
    return {
      version: '2.1.2',
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
        'event_category': 'quiz',
        'event_label': label
      })
    }
  },
  metaInfo: {
    title: 'Learn the Shrines',
    titleTemplate: '%s :: Learn the Shrines'
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

*,
*:before,
*:after {
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  margin: 0;
  min-height: 100%;
  background: #060903;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
}

#app,
main {
  height: 100vh;
}

#banner {
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  position: fixed;
  bottom: 0;
  z-index: 1002;
  padding: 0 60px;
  height: 54px;
  width: 100%;
  background: no-repeat center right / contain url('assets/bannerbg-right.jpg'), no-repeat center left / contain url('assets/bannerbg-left.jpg'), #FFFDE4;
  color: #000;
  box-shadow: inset 0 0 0 2px #FFFDE4, 0 0 2px #000;
  align-items: center;
}

.logo {
  text-indent: 100%;
  overflow: hidden;
  text-decoration: none;
  display: block;
  font-size: 0;
  text-align: start;
  white-space: nowrap;
}

.logo {
  bottom: 20px;
  right: 20px;
  width: 85px;
  height: 100%;
  background: no-repeat center center / 85px url('assets/logo-learntheshrines.png');
}

.main-container__wrap {
  display: grid;
  grid-template-columns: 55%;
  position: relative;
  z-index: 2;
  margin: 0 auto;
  width: 100%;
  max-width: 1600px;
  height: 100%;
  gap: 60px;
}

.main-container {
  display: flex;
  flex-direction: column;
  padding: 85px 60px 0;
  justify-content: stretch;
}

.main-container__content {
  padding: 32px 32px 70px;
  background: rgba(0, 0, 0, .6);
  box-shadow: 0 0 2px #000, inset 0 0 0 2px #000, 0 0 0 2px rgba(190,190,190,.2);
  flex-grow: 1;
}

.side-container__wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  top: 85px;
  bottom: 54px;
  left: 55%;
  z-index: 3;
  width: 45%;
}

.side-container {
  overflow: hidden;
  position: relative;
  padding: 32px 0 32px 48px;
  border-radius: 12px 0 0 12px;
  border-right-width: 0;
  background: no-repeat center right url('assets/spiral-bg.png') rgba(0, 0, 0, .6);
  box-shadow: 0 0 2px #000, inset 0 0 0 2px #000, 0 0 0 2px rgba(190,190,190,.2);
}

.side-container__indicator {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #000;
  width: 16px;
  box-shadow: 2px 0 2px rgba(190,190,190,.2);
}

.side-container__title,
.side-container__content {
  padding-right: 60px;
  max-width: 720px;
}

.side-container__title {
  padding-left: 60px;
  padding-top: 1em;
  padding-bottom: 1em;
  text-align: center;
}

.side-container__title h2 {
  margin-top: 0;
  margin-bottom: 0;
}

#app-menu {
  position: relative;
  z-index: 4;
  background: #FFFDE4;
  height: 60px;
  border-radius: 12px 12px 0 0;
  text-align: center;
  color: black;
  padding: 8px 32px;
  box-shadow: 0 0 2px #000;
}

hr {
  margin: 16px 0;
  width: 100%;
  height: 32px;
  border: 0;
  background: no-repeat center center / contain url('./assets/divider.png');
}

html .swal2-container {
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
}

html .swal2-container.swal2-shown {
  background: linear-gradient(to right, rgba(0,0,0,.8) 70%, rgba(0,0,0,0));
}

html .swal2-popup {
  background: none;
}

html .swal2-content {
  color: white;
}

.button {
  display: block;
  margin: 0 auto 8px;
  padding: 6px;
  width: 100%;
  max-width: 200px;
  border-radius: 12px;
  box-shadow: 0 0 2px #000, inset 0 0 0 2px #000, 0 0 0 2px rgba(190,190,190,.2);
  border: 0;
  background: rgba(0, 0, 0, .7);
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

.button:disabled {
  color: rgb(150,150,150);;
  cursor: not-allowed;
}

.button--wide {
  padding: 6px 16px;
  max-width: 300px;
}

.button:hover,
.button:focus {
  background: rgba(0, 0, 0, .4);
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.button:disabled:hover,
.button:disabled:focus {
  background: rgba(0, 0, 0, .7);
  box-shadow: 0 0 2px #000, inset 0 0 0 2px #000, 0 0 0 2px rgba(190,190,190,.2);
  animation: none;
}

html .swal2-confirm,
html .swal2-cancel {
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 0 2px #000, inset 0 0 0 2px #000, 0 0 0 2px rgba(190,190,190,.2);
  border: 0;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
}

html .swal2-confirm,
html .swal2-cancel {
  background: rgba(0, 0, 0, .7) !important;
}

html .swal2-confirm:hover,
html .swal2-confirm:focus,
html .swal2-cancel:hover,
html .swal2-cancel:focus {
  background: rgba(0, 0, 0, .4);
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.settings-button {
  padding: 6px 8px;
  border: 0;
  border-radius: 4px;
  color: #fff;
  font-weight: bold;
  font-size: 12px;
  text-decoration: none;
  line-height: 1;
  background: no-repeat 6px center / 16px 16px #000;
}

.settings-button + .settings-button {
  margin-left: 8px;
}

.settings-button.on {
  background-color: #979797;
}

.settings-button--sound {
  padding-left: 28px;
  background-image: url('assets/sound-on.png');
}

.settings-button--sound.on {
  background-image: url('assets/sound-off.png');
}

.settings-button--options {
  padding-left: 28px;
  background-image: url('assets/advanced-options-icon.png');
  background-color: #979797;
}

.settings-button--options.on {
  background-color: #000;
}

@media (max-width: 1023px) {
  .main-container__wrap {
    grid-template-columns: 100%;
    height: auto;
  }

  .main-container {
    padding-top: 128px;
  }

  #banner,
  .main-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  #banner {
    background: no-repeat center right / contain url('assets/bannerbg-right.jpg'), #FFFDE4;
  }

  .main-container__content {
    padding: 16px;
    flex-grow: 0;
    border-radius: 0 0 6px 6px;
    border-bottom-width: 1px;
  }

  .one-col .main-container__content {
    padding-bottom: 70px;
  }

  .side-container__wrap {
    position: relative;
    top: 0;
    left: 0;
    padding-top: 32px;
    padding-right: 16px;
    padding-bottom: 86px;
    padding-left: 16px;
    width: 100%;
  }

  .side-container {
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 12px 6px 6px 12px;
  }

  .side-container__title{
    padding-left: 48px;
  }

  .side-container__title,
  .side-container__content {
    padding-right: 48px;
  }
}

</style>
