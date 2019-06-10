<template>
  <div id="app">
    <h1 class="logo">Learn The Shrines</h1>

    <app-menu :options="options" :score="total" @reset="resetScore" @info="openModal"></app-menu>

    <Quiz @answer="tallyScore" @reset="resetScore" :options="options" ref="quiz" />

    <footer>
      <p><a href="#" @click.prevent="$modal.toggle('info')">What is this?</a></p>

      <code>v1.2.0</code>
      Created by BoyontheCob
      <br />
      <br />

      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
        <input type="hidden" name="cmd" value="_donations" />
        <input type="hidden" name="business" value="WTZSPZL7HFLML" />
        <input type="hidden" name="currency_code" value="CAD" />
        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
        <img alt="" border="0" src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
      </form>

      <small>Pls. Help keep this free of ads</small>

    </footer>

    <modal name="info" height="auto" :adaptive="true" :scrollable="true" width="90%" :maxWidth="600">
      <div slot="top-right">
        <a href="#" class="close-button" @click.prevent="$modal.hide('info')">
          &times;
        </a>
      </div>

      <h2>About</h2>

      <p>Learn the Shrines is a learning resource developed for the <strong>The Legend of Zelda: Breath of the Wild</strong> speedrunning community. The purpose is to help newcomers and fans of the game to learn the names, locations, and associated shrine quests for all 120 shrines of Hyrule using flashcards and multiple choice. It's not essential to learn the names of the shrines in order to speedrun the game, but it helps in conversation with other people in the community.</p>

      <p>I created it because I was constantly having to look up names of shrines when they were mentioned on streams, and in chats. I wanted to practice some web development stuff, and this seemed like a good excercise that could help me learn and help others learn too.</p>

      <p>If you have any ideas for additional features to Learn the Shrines, found some mistakes, or just want to say "hi"; You can DM me (BoyontheCob) in the <a href="https://discord.gg/rF4XeFC">BoTW Speedrunning Discord</a>.</p>

      <p><strong>Spoiler disclaimer:</strong> The information and images in this app contain massive spoilers for the game, possible shrine solutions, and locations of things that are way more fun finding on you own. If you havn't yet completed the game and found all 120 shrines yourself, please don't spoil it for yourself!</p>

    </modal>

  </div>
</template>

<script>
/* global gtag */
import Quiz from './components/Quiz'
import AppMenu from './components/AppMenu'

export default {
  name: 'App',
  components: {
    Quiz,
    AppMenu
  },
  data () {
    return {
      total: {
        score: 0,
        out_of: 0,
        by_type: {}
      },
      options: {
        soundOn: true,
        includeDLC: false,
        chooseFrom: 4,
        difficulty: 'normal'
      }
    }
  },
  methods: {
    tallyScore (correct, type) {
      this.total.out_of++
      if (this.total.by_type[type]) {
        this.total.by_type[type].out_of++
      } else {
        this.total.by_type[type] = {
          score: 0,
          out_of: 1
        }
      }

      if (this.total.out_of === 1) {
        this.trackEvent('progression', 'started')
      }

      if (this.total.out_of === 10) {
        this.trackEvent('progression', 'engaged')
      }

      if (this.total.out_of === 120) {
        this.trackEvent('progression', 'committed')
      }

      if (correct) {
        this.total.score++
        this.total.by_type[type].score++
      }
    },
    resetScore () {
      if (this.total.out_of > 0) {
        if (window.confirm('This will permanently clear your score.')) {
          this.total = {
            score: 0,
            out_of: 0,
            by_type: {}
          }
          return true
        }
      } else {
        this.$refs.quiz.newQuestion()
      }
    },
    openModal () {
      this.$modal.toggle('info')
    },
    trackEvent (action, label) {
      gtag('send', 'event', 'quiz', action, label)
    }
  }
}
</script>

<style>
*,
*:before,
*:after {
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  display: flex;
  margin: 0;
  min-height: 100%;
  background: repeat 0 0 / 50% url('./assets/bg.jpg') #060903;
  align-items: center;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 10px;
  width: 100%;
  text-align: center;
  color: #fff;
  line-height: 1.5;
}

@media (max-width: 1500px) {
  #app {
    padding-top: 80px;
  }
}

@media (max-width: 600px) {
  body {
    background-size: cover;
  }

  #app {
    padding-top: 60px;
  }
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
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1002;
  width: 163px;
  height: 69px;
  background: no-repeat center center / 163px 69px url('/static/logo-learntheshrines.png');
}

@media (max-width: 600px) {
  .logo {
    width: 82px;
    height: 35px;
    background-size: 82px 35px;
  }
}

a {
  color: inherit;
}

footer {
  margin-top: 50px;
  font-weight: bold;
  color: rgba(255, 255, 255, .5);
}

footer code {
  display: block;
}

footer a {
  color: #fff;
}

.v--modal-overlay {
  background: repeat 0 0 / 50% url('./assets/bg.jpg') #060903;
}

#app .v--modal {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #060903;
  color: #fff;
  border: solid 1px #fff;
  justify-content: center;
}

#app .v--modal h2 {
  margin-bottom: 0;
}

.close-button {
  position: relative;
  z-index: 1001;
  display: inline-block;
  text-decoration: none;
  background: #060903;
  border-radius: 50%;
  border: solid 1px #fff;
  margin: .5em;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  font-size: 20px;
  font-weight: bold;
}
</style>
