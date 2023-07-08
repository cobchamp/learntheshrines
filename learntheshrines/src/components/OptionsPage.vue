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
/* global _ */

export default {
  name: 'OptionsPage',
  mounted () {
    this.$emit('updateBg', 'random')
  },
  data () {
    return {
      difficulties: {
        'totk': {
          'easy': '<strong>Easy Difficulty</strong> asks only simple questions and only asks for <strong>Zonai shrine names</strong> alongside the trial names',
          'normal': '<strong>Normal Difficulty</strong> questions contain all the basic questions and may require some knowledge of the <strong>Zonai shrine names</strong>',
          'hard': '<strong>Hard Difficulty</strong> require more knowledge of the <strong>Zonai shrine names</strong>, along with minor landmarks and shrine treasure chests'
        },
        'botw': {
          'easy': '<strong>Easy Difficulty</strong> asks only simple questions and only asks for <strong>Shiekah Monk names</strong> alongside the trial names',
          'normal': '<strong>Normal Difficulty</strong> questions contain all the basic questions and may require some knowledge of the <strong>Shiekah Monk names</strong>',
          'hard': '<strong>Hard Difficulty</strong> require more knowledge of the <strong>Shiekah Monk names</strong>, along with minor landmarks and shrine treasure chests'
        }
      },
      chooseFrom: [2, 4, 6],
      dlc: {
        'totk': false,
        'botw': {
          'enabled': 'Questions about 16 additional shrines from <strong>Champions Ballad EX</strong> will be added to the pool',
          'disabled': 'Enabling DLC will mix in questions about 16 additional shrines from <strong>Champions Ballad EX</strong>'
        }
      },
      fastModeDesc: {
        'enabled': 'Quiz will be more fast-paced, automatically advancing to the next question after a short timer',
        'disabled': 'You will need to click a button to be advanced to the next question'
      },
      radius: {
        'easy': 700,
        'normal': 350,
        'hard': 250
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
        'Map only': ['map'],
      }
      const hardTypes = {
        'Text only': ['text'],
        'Choice + Text': ['choice', 'text'],
        'Text + Map': ['map', 'text'],
        'All types': ['choice', 'map', 'text']
      }
      if (this.options.difficulty === 'hard') {
        return _.merge(types, hardTypes)
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
      let myOptions = this.options
      if (myOptions[option] !== value) {
        if (option === 'game') {
          myOptions['difficulty'] = 'normal'
          myOptions['questionTypes'] = ['choice', 'map']
        }
        if (option === 'difficulty' && value !== 'hard') {
          myOptions['questionTypes'] = ['choice', 'map']
        } else if (option === 'difficulty' && value === 'hard') {
          myOptions['questionTypes'] = ['choice', 'map', 'text']
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
      var capitalized = []
      data.split(' ').forEach(word => {
        capitalized.push(
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
        )
      })
      return capitalized.join(' ')
    },

    gameExpand: function (game) {
      let gameExpand = {
        'totk': 'Tears of the Kingdom',
        'botw': 'Breath of the Wild'
      }
      return gameExpand[game]
    }
  },
  metaInfo: {
    title: 'Learn the Shrines',
    titleTemplate: '%s',
    meta: [
      {name: 'description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {property: 'og:title', content: 'Learn the Shrines'},
      {property: 'og:site_name', content: 'Learn the Shrines'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://learntheshrines.com'},
      {property: 'og:image', content: 'https://learntheshrines.com/images/share-image.jpg'},
      {property: 'og:description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:site', content: 'https://learntheshrines.com'},
      {name: 'twitter:title', content: 'Learn the Shrines'},
      {name: 'twitter:description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:creator', content: '@cobwoms'},
      {name: 'twitter:image:src', content: 'https://learntheshrines.com/images/share-image.jpg'},

      {itemprop: 'name', content: 'Learn the Shrines'},
      {itemprop: 'description', content: 'How well do you know the shrines in BOTW and TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {itemprop: 'image', content: 'https://learntheshrines.com/images/share-image.jpg'}
    ],
    link: [
      {rel: 'canonical', href: 'https://learntheshrines.com'}
    ]
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

.option {
  display: flex;
  margin-top: 16px;
  padding: 8px 32px;
  border-radius: 6px;
  background: rgba(217, 217, 217, .3);
  align-items: center;
  justify-content: space-around;
}

.option:first-child {
  margin-top: 0;
}

.option label {
  width: 50%;
  font-size: 20px;
  font-style: italic;
  line-height: 1;
}

.option select {
  appearance: none;
  padding: 8px;
  width: 50%;
  border: 0;
  border-radius: 6px;
  box-shadow: inset 0 0 0 4px #000;
  color: white;
  font-size: 20px;
  text-align: center;
  font-weight: bold;
  background: no-repeat  right 1rem center / 1.5rem url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff' stroke='none' %3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") #ff7a00;
}

.option select:focus {
  background-color: #000;
  outline: 0;
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.option select:focus > option:checked {
  background: rgba(217, 217, 217, .3);
}

.option .toggle {
  padding: 8px;
  width: 50%;
  border: 0;
  border-radius: 6px;
  box-shadow: inset 0 0 0 4px #000;
  color: white;
  font-size: 20px;
  text-align: center;
  font-weight: bold;
  background: #363636;
  text-decoration: none;
}

.option .toggle:hover {
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.option .toggle.disabled,
.option .toggle.disabled:hover,
.option .toggle.disabled:focus {
  box-shadow: inset 0 0 0 4px #000;
  animation: none;
  cursor: not-allowed;
}

.option .selected {
  background: #ff7a00;
}

.option-description p {
  margin: 0;
  padding: 8px 10%;
  font-style: italic;
  text-align: center;
  line-height: 1.4;
}

.option-description a {
  color: #ff7a00;
  font-weight: bold;
  font-style: normal;
}

.version {
  margin-top: 3em;
  font-size: 12px;
  color: rgb(217, 217, 217);
}

.game-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 16px;
  margin: 0;
  list-style-type: none;
  text-align: center;
  gap: 32px;
}

.game-list .game {
  display: block;
  padding: 16px 32px;
  border-radius: 6px;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}

.game-list .game .new {
  color: #ff7a00;
  font-style: italic;
}

.game-list .game:hover,
.game-list .game:focus {
  background: rgba(0, 0, 0, .7);
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.game-list .game.selected {
  background: rgba(0, 0, 0, .7);
  box-shadow: 0 0 4px #000, 0 0 0 2px rgba(190,190,190,.2);
}

.game-list .game.selected:hover,
.game-list .game.selected:focus {
  box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
  animation: .5s linear 2s infinite alternate radiateGlow;
}

.game-list .game img {
  display: block;
  margin: 0 auto 8px;
  width: 100%;
  max-width: 200px;
  height: auto;
}

@media (min-width: 1024px) and (max-width: 1280px) {
  .game-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .option {
    flex-direction: column;
    text-align: center;
  }

  .option label,
  .option select,
  .option .toggle {
    width: 100%;
  }

  .option label {
    margin-bottom: 8px;
  }

  .game-list {
    grid-template-columns: 1fr;
  }
}

</style>
