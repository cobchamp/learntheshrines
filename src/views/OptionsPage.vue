<template>
  <main id="options" class="one-col">
    <MainContainer>
      <div class="option">
        <ul class="game-list">
          <li>
            <a href="" class="game" :class="{'selected': options.game == 'botw'}" @click.prevent="updateOption('game', 'botw', true)">
              <img src="../assets/botw-logo.png" width="300" height="128" alt="The Legend of Zelda: Breath of the Wild" />
              The Legend of Zelda: Breath of the Wild
            </a>
          </li>
          <li>
            <a href="" class="game" :class="{'selected': options.game == 'totk'}" @click.prevent="updateOption('game', 'totk', true)">
              <img src="../assets/totk-logo.png" width="300" height="128" alt="The Legend of Zelda: Tears of the Kingdom" />
              <span class="new">New!</span> The Legend of Zelda: Tears of the Kingdom
            </a>
          </li>
        </ul>
      </div>
      <hr />
      <div class="option">
        <label>
          Difficulty
        </label>
        <select @change="$event.target.blur(), updateOption('difficulty', $event.target.value, true)">
          <option v-for="(desc, key) in difficulties[options.game]" :value="key" v-bind:key="key" :selected="options.difficulty == key">{{ key | capitalising }}</option>
        </select>
      </div>
      <div class="option-description"><p v-html="difficulties[options.game][options.difficulty]"></p></div>

      <div class="option" v-if="dlc[options.game]">
        <label>
          Include DLC
        </label>
        <a :class="{'selected': dlc[options.game] && options.includeDLC, 'disabled': dlc[options.game] == false }" class="toggle" href="" @click.prevent="updateOption('includeDLC', options.includeDLC ? false : true, true)">
          <template v-if="dlc[options.game]">
            <template v-if="options.includeDLC">
              Included
            </template>
            <template v-else>
              Not Included
            </template>
          </template>
          <template v-else>
            Not Available
          </template>
        </a>
      </div>
      <div class="option-description" v-if="dlc[options.game]">
        <p v-if="dlc[options.game]" v-html="dlc[options.game][options.includeDLC ? 'enabled' : 'disabled']">
        </p>
        <p v-else>
          <strong>DLC</strong> is not available in <strong>{{ options.game | gameExpand }}</strong>
        </p>
      </div>

      <div class="option" v-if="options.advancedOptions && options.questionTypes.indexOf('choice') > -1">
        <label>
          Number of Choices
        </label>
        <select @change="$event.target.blur(), updateOption('chooseFrom', Number($event.target.value), true)">
          <option v-for="value in chooseFrom" :value="value" v-bind:key="value" :selected="options.chooseFrom == value">{{ value > 4 ? 'up to ' : '' }}{{ value }}</option>
        </select>
      </div>

      <div class="option" v-if="options.advancedOptions">
        <label>
          Question Types
        </label>
        <select @change="$event.target.blur(), updateOption('questionTypes', $event.target.value.split(','), true)">
          <option v-for="(value, name) in questionTypes" :value="value" v-bind:key="name" :selected="options.questionTypes.join(',') == value" >{{ name }}</option>
        </select>
      </div>
      <div class="option-description" v-if="options.questionTypes.indexOf('map') > -1">
        <p>
          Map answers are evaluated with a radius of <strong>{{ radius[options.difficulty] }}m</strong> on <strong>{{ options.difficulty | capitalising }} Difficulty</strong>
        </p>
      </div>

      <hr v-if="options.advancedOptions" />

      <div class="option" v-if="options.advancedOptions">
        <label>
          Auto-advance
        </label>
        <a :class="{'selected': options.fastMode }" class="toggle" href="" @click.prevent="updateOption('fastMode', options.fastMode ? false : true)">
          <template v-if="options.fastMode">
            Fast Mode
          </template>
          <template v-else>
            Slow Mode
          </template>
        </a>
      </div>
      <div class="option-description" v-if="options.advancedOptions"><p v-html="fastModeDesc[options.fastMode ? 'enabled' : 'disabled']"></p></div>

      <hr />

      <router-link class="button" tag="button" :to="`/${options.game}`" v-if="!gameInProgress">Start Quiz</router-link>

      <template v-else>
        <div class="option-description">
          <p>You have a quiz in progress with <strong>{{ score.count }} shrine questions</strong> answered</p>
          <button class="button" tag="button" @click="newGame">Start Over</button>
          <router-link class="button" tag="button" :to="`/${options.game}`">Continue</router-link>
        </div>
      </template>

      <div class="option-description">
        <p><strong>Learn the Shrines</strong> is an <strong>infinite stream of random questions.</strong> Play for as long as you want to improve over time</p>

        <p><router-link to="/about">Learn More</router-link></p>
      </div>

      <div class="option-description version">
        <p>v{{ version }}<br/>created by <a href="https://twitch.tv/cobwoms">cob woms</a></p>
      </div>
    </MainContainer>
  </main>
</template>
<script>

export default {
  name: 'OptionsPage',
  mounted () {
    this.$emit('updateBg', 'random')
  },
  data () {
    return {
      difficulties: {
        totk: {
          easy: '<strong>Easy Difficulty</strong> asks only simple questions and only asks for <strong>Zonai shrine names</strong> alongside the trial names',
          normal: '<strong>Normal Difficulty</strong> questions contain all the basic questions and may require some knowledge of the <strong>Zonai shrine names</strong>',
          hard: '<strong>Hard Difficulty</strong> require more knowledge of the <strong>Zonai shrine names</strong>, along with minor landmarks and shrine treasure chests'
        },
        botw: {
          easy: '<strong>Easy Difficulty</strong> asks only simple questions and only asks for <strong>Shiekah Monk names</strong> alongside the trial names',
          normal: '<strong>Normal Difficulty</strong> questions contain all the basic questions and may require some knowledge of the <strong>Shiekah Monk names</strong>',
          hard: '<strong>Hard Difficulty</strong> require more knowledge of the <strong>Shiekah Monk names</strong>, along with minor landmarks and shrine treasure chests'
        }
      },
      chooseFrom: [2, 4, 6],
      dlc: {
        totk: false,
        botw: {
          enabled: 'Questions about 16 additional shrines from <strong>Champions Ballad EX</strong> will be added to the pool',
          disabled: 'Enabling DLC will mix in questions about 16 additional shrines from <strong>Champions Ballad EX</strong>'
        }
      },
      fastModeDesc: {
        enabled: 'Quiz will be more fast-paced, automatically advancing to the next question after a short timer',
        disabled: 'You will need to click a button to be advanced to the next question'
      },
      radius: {
        easy: 700,
        normal: 350,
        hard: 250
      }
    }
  },
  computed: {
    version () {
      return this.$parent.version
    },
    options () {
      return this.$parent.options
    },
    score () {
      return this.$parent.score
    },
    gameInProgress () {
      return this.$parent.score.count > 0
    },
    questionTypes () {
      const types = {
        'Choices + Map': ['choice', 'map'],
        'Choices only': ['choice'],
        'Map only': ['map']
      }
      const hardTypes = {
        'Text only': ['text'],
        'Choice + Text': ['choice', 'text'],
        'Text + Map': ['map', 'text'],
        'All types': ['choice', 'map', 'text']
      }
      if (this.options.difficulty === 'hard') {
        return this._merge(types, hardTypes)
      } else {
        return types
      }
    }
  },
  methods: {
    newGame () {
      this.$confirm('This will clear your score. Do you want to continue?').then(() => {
        this.$emit('updateScore', 'reset')
        this.$router.push('/' + this.options.game)
      })
    },
    updateOption (option, value, sensitive) {
      const myOptions = this.options
      if (myOptions[option] !== value) {
        if (option === 'game') {
          myOptions.difficulty = 'normal'
          myOptions.questionTypes = ['choice', 'map']
        }
        if (option === 'difficulty' && value !== 'hard') {
          myOptions.questionTypes = ['choice', 'map']
        } else if (option === 'difficulty' && value === 'hard') {
          myOptions.questionTypes = ['choice', 'map', 'text']
        }
        if (sensitive && this.gameInProgress) {
          this.$confirm('This will clear your score. Do you want to continue?').then(() => {
            myOptions[option] = value
            this.$emit('updateScore', 'reset')
            this.$emit('updateOptions', myOptions)
          })
        } else {
          myOptions[option] = value
          this.$emit('updateOptions', myOptions)
          if (sensitive) {
            this.$emit('updateScore', 'reset')
          }
        }
      }
    }
  },

  filters: {
    capitalising: function (data) {
      const capitalized = []
      data.split(' ').forEach(word => {
        capitalized.push(
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
        )
      })
      return capitalized.join(' ')
    },

    gameExpand: function (game) {
      const gameExpand = {
        totk: 'Tears of the Kingdom',
        botw: 'Breath of the Wild'
      }
      return gameExpand[game]
    }
  },
  metaInfo: {
    title: 'Learn the Shrines',
    titleTemplate: '%s',
    meta: [
      { name: 'description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },
      { property: 'og:title', content: 'Learn the Shrines' },
      { property: 'og:site_name', content: 'Learn the Shrines' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://learntheshrines.com/' },
      { property: 'og:image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },
      { property: 'og:description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },

      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:site', content: 'https://learntheshrines.com/' },
      { name: 'twitter:title', content: 'Learn the Shrines' },
      { name: 'twitter:description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },

      { name: 'twitter:creator', content: '@cobwoms' },
      { name: 'twitter:image:src', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },

      { itemprop: 'name', content: 'Learn the Shrines' },
      { itemprop: 'description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },
      { itemprop: 'image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') }
    ],
    link: [
      { rel: 'canonical', href: 'https://learntheshrines.com/' }
    ]
  }
}
</script>

<style lang="scss" src="../styles/options.scss" />
