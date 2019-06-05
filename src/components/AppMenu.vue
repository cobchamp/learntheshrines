<template>
  <div id="menu">
    <div class="options">
      <!--<div class="dropdown">
        <dl>
          <dt>Max Choices</dt>
          <dd>{{ options.chooseFrom }}</dd>
        </dl>

        <div class="dropdown-content">
          <div class="option" v-for="num in 7" :key="num" :class="{active: num + 1 === options.chooseFrom}" @click="changeOption('chooseFrom', num + 1)">
            {{ num + 1 }}
          </div>
        </div>
      </div>-->

      <div class="dropdown" :class="{active: dropdown === 'difficulty'}">
        <dl @click="dropdown = (dropdown === 'difficulty') ? null : 'difficulty'">
          <dt>Difficulty</dt>
          <dd class="small">{{ options.difficulty | capitalize }}{{ options.includeDLC ? '+' : '' }}</dd>
        </dl>

        <div class="dropdown-content">
          <div class="option" v-for="difficulty in difficulties" :key="difficulty" :class="{active: difficulty === options.difficulty}" @click="changeOption('difficulty', difficulty)">
            {{ difficulty | capitalize }}
          </div>
          <div class="option divider">--</div>
          <div class="option" :class="{active: options.includeDLC}" @click="toggleOption('includeDLC', true)">
            DLC&nbsp;{{ options.includeDLC ? '-' : '+' }}
          </div>
        </div>
      </div>

      <!--<dl class="toggle">
        <dt>DLC</dt>
        <dd>{{ options.includeDLC ? 'ON' : 'OFF' }}</dd>
      </dl>-->

      <dl class="toggle" @click="toggleOption('soundOn', false)">
        <dt>Sounds</dt>
        <dd>{{ options.soundOn ? 'ON' : 'OFF' }}</dd>
      </dl>
    </div>

    <score-card v-if="score.out_of > 0" :score="score" @reset="$emit('reset')"></score-card>
  </div>
</template>
<script>
import ScoreCard from './ScoreCard.vue'

export default {
  name: 'AppMenu',
  components: {
    ScoreCard
  },
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          soundOn: true,
          includeDLC: false,
          chooseFrom: 4,
          difficulty: 'normal'
        }
      }
    },
    score: {
      type: Object,
      default: () => {
        return {
          score: 0,
          out_of: 0,
          by_type: {}
        }
      }
    }
  },
  data () {
    return {
      dropdown: null,
      difficulties: ['easy', 'normal', 'hard']
    }
  },
  methods: {
    toggleOption (option, newQ = true) {
      this.dropdown = null

      if (newQ) {
        this.$emit('reset')

        setTimeout(() => {
          if (this.score.out_of === 0) {
            this.options[option] = !this.options[option]
            this.$parent.$refs.quiz.newQuestion()
          }
        }, 10)
      } else {
        this.options[option] = !this.options[option]
      }
    },
    changeOption (option, value) {
      this.$emit('reset')
      this.dropdown = null

      setTimeout(() => {
        if (this.options[option] !== value && this.score.out_of === 0) {
          this.options[option] = value
          this.$parent.$refs.quiz.newQuestion()
        }
      }, 10)
    }
  },
  filters: {
    capitalize (value) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>

<style>

#menu {
  display: flex;
  position: fixed;
  top: 10px;
  right: 10px;
  left: 10px;
  z-index: 99;
  font-weight: bold;
  font-size: 16px;
  justify-content: space-between;
  pointer-events: none;
}

@media (max-width: 600px) {
  #menu {
    top: 0;
    right: 0;
    left: 0;
    background: #060903;
    border-bottom: solid 1px #fff;
  }
}

.options {
  display: flex;
}

@media (max-width: 600px) {
  .options {
    font-size: 12px;
  }
}

.options dl,
.score-card .total dl {
  display: flex;
  flex-direction: column;
  float: left;
  margin: 0;
  padding: 5px 0;
  width: 80px;
  height: 80px;
  border: solid 1px #fff;
  background: #060903;
  text-align: center;
  justify-content: center;
  pointer-events: all;
  user-select: none;
}

@media (max-width: 600px) {
  .options dl,
  .score-card .total dl {
    border-top: 0;
    border-left: 0;
    border-bottom: 0;
  }

  .score-card .total dl {
    border-left: solid 1px #fff;
    border-right: 0;
  }
}

@media (max-width: 600px) {
  .options dl {
    width: 60px;
    height: 60px;
  }
}

.options dl + dl,
.options .dropdown + dl,
.options dl + .dropdown > dl,
.options .dropdown + .dropdown > dl {
  border-left: 0;
}

.options dt {
  padding: 0 5px;
  margin: 0;
  font-size: 62.5%;
  text-transform: uppercase;
}

.options dd {
  margin: 0;
  font-size: 175%;
}

.options dd.small {
  margin: 0;
  font-size: 100%;
}

.options dl.toggle,
.options .dropdown dl {
  cursor: pointer;
}

.options dl.toggle:hover,
.options .dropdown dl:hover {
  background: #fff;
  color: #060903;
}

.options .dropdown {
  position: relative;
}

.options .dropdown.active .dropdown-content {
  display: block;
}

.options .dropdown .dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: -1px;
  padding: 2px 8px;
  min-width: 100%;
  border: solid 1px #fff;
  background: #060903;
  text-align: left;
  font-size: 16px;
  pointer-events: all;
}

@media (max-width: 600px) {
  .options .dropdown .dropdown-content {
    margin-top: 0;
  }

  .options .dropdown .option {
    padding: .5em 0;
  }
}

.options .dropdown .option {
  padding: .25em 0;
  cursor: pointer;
  color: rgba(255,255,255, 0.5);
}

.options .dropdown .option {
  cursor: pointer;
}

.options .dropdown .option.divider {
  pointer-events: none;
}

.options .dropdown .option:hover,
.options .dropdown .option.active {
  color: #fff;
}
</style>
