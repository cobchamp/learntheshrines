<template>
  <transition name="fade">
    <div class="quiz-score" v-if="showScore" :class="{'botw-orb': options.game == 'botw', 'update': updateClass}">
      <div class="quiz-score__main">
        <img v-if="options.game == 'botw'" src="../assets/botw-orb.png" />
        <img v-else src="../assets/totk-lob.png"/>
        <strong>{{ percentage }}%</strong> Correct Answers
      </div>
      <div class="quiz-score__grade">
        {{ grade(percentage) }}
      </div>
    </div>
  </transition>
</template>
<script>

export default {
  name: 'QuizScore',
  watch: {
    percentage () {
      const vm = this
      vm.updateClass = true
      setTimeout(() => {
        vm.updateClass = false
      }, 2000)
    }
  },
  computed: {
    showScore () {
      return this.score.count >= 10
    },
    options () {
      return this.$parent.options
    },
    percentage () {
      const considered = this.score.tally.slice(-100) // only consider the most recent 100 answers
      const numCorrect = considered.reduce(this.add, 0) // add the tally
      return Math.round(numCorrect / considered.length * 100) // return the percentage
    }
  },
  data () {
    return {
      updateClass: false,
      grades: {
        S: 'Epic gamer!',
        A: 'Awesome shrine knowledge!',
        B: 'Better than most!',
        C: 'You\'re pretty basic',
        D: 'Sub-par performance',
        E: 'It\'s going pretty rough',
        F: 'Washed up! Do better!',
        Z: 'Abysmal, the worst there is'
      }
    }
  },
  methods: {
    add (acc, a) {
      return acc + a
    },
    grade (percent) {
      if (percent >= 95) {
        return this.grades.S
      } else if (percent >= 86) {
        return this.grades.A
      } else if (percent >= 49) {
        return this.grades.B
      } else if (percent >= 34) {
        return this.grades.C
      } else if (percent >= 24) {
        return this.grades.D
      } else if (percent >= 15) {
        return this.grades.E
      } else if (percent >= 1) {
        return this.grades.F
      } else {
        return this.grades.Z
      }
    }
  },
  props: ['score']
}
</script>

<style>
@keyframes pulse {
  from { transform: scale(1); }
  50% { transform: scale(1.3); }
  to { transform: scale(1); }
}

.quiz-score {
  position: fixed;
  z-index: 4;
  top: 145px;
  right: 0;
  text-align: right;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, .4);
  opacity: 1;
  transform: translateX(0);
  transition: all .3s ease-out;
}

.quiz-score.fade-enter {
  opacity: 0;
  transform: translateX(60px);
}

.quiz-score__main {
  padding: 4px 32px 4px 58px;
  border-radius: 16px 0 0 16px;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.2;
  background: linear-gradient(to right, rgba(0,0,0,.6) 70%, rgba(0,0,0,0));
}

.quiz-score__main img {
  position: absolute;
  top: -32px;
  left: -6px;
  width: 65px;
  height: 65px;
  transform: scale(1);
  transition: transform .6s ease-out;
}

.quiz-score.fade-enter .quiz-score__main img {
  transform: scale(0.6);
}

.quiz-score.update .quiz-score__main strong {
  animation-name: pulse;
  animation-duration: 1s;
}

.quiz-score__main strong {
  display: inline-block;
  color: #FFE500;
}

.botw-orb .quiz-score__main strong {
  color: #be93e6;
}

.quiz-score__grade {
  margin: 4px 16px;
}

@media (max-width: 1024px) {
  .quiz-score {
    top: 32px;
  }
}
</style>
