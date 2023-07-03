<template>
  <div class="quiz" v-if="question">
    <h2 class="question-text" v-if="answered === null"><span v-html="question.title"></span></h2>

    <template v-else>
      <h2 class="question-text" :class="{'alert-correct': isCorrect, 'alert-incorrect': !isCorrect}" v-if="!question.text"><span v-html="(isCorrect) ? 'Yep! It\'s <strong>'+question.choices[correct]+'</strong>' : 'Sorry, the answer was <strong>'+question.choices[correct]+'</strong>.'"></span></h2>
      <h2 v-else>
        <span v-html="(isCorrect) ? 'You\'re correct! The answer is  <strong>'+question.answer+'</strong>' : 'Sorry, the answer was <strong>'+question.answer+'</strong>.'"></span>
      </h2>
      <router-link :to="'/'+question.shrineSlug">About {{question.shrineName}}</router-link>
    </template>

    <progress :value="timer" :max="((!isCorrect) ? questionTimeoutIncorrect : questionTimeoutCorrect) - 100"></progress>

    <img :src="(answered === null) ? `/static/images/${question.image}.jpg` : `../static/images/${question.imageAnswered}.jpg`" class="image" :class="{'image-correct': isCorrect && answered !== null, 'image-incorrect': !isCorrect && answered !== null}"/><br />

    <template v-if="!question.text">
      <strong>Choices:</strong>
      <ol class="choices">
        <li v-for="(choice, index) in question.choices" class="choice" :key="index">
          <button @click="answer(index)" :class="{correct: index === correct, answered: index === answered}" :disabled="answered !== null">
            {{ abc[index] }}. {{ choice }}
          </button>
        </li>
      </ol>
    </template>
    <form v-else @submit.prevent="answerText()">
      <strong>Type the answer below, and press enter:</strong>

      <input type="text" id="textAnswer" class="text-answer" v-model="textAnswer" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" :readonly="answered !== null" />
      <small>Answers are evaluated for approximate spelling.</small>
      <br /><br />
      <button type="button" class="skip-button" @click="answerText(true)" :disabled="answered !== null">
        I don't know
      </button>
    </form>
  </div>
</template>

<script>
import _ from 'lodash'
import leven from 'leven'

function Sound (src) {
  this.sound = document.createElement('audio')
  this.sound.src = src
  this.sound.setAttribute('preload', 'auto')
  this.sound.setAttribute('controls', 'none')
  this.sound.style.display = 'none'
  document.body.appendChild(this.sound)
  this.play = () => this.sound.play()
}

export default {
  name: 'Quiz',
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
    }
  },
  mounted () {
    this.newQuestion()
    document.addEventListener('keypress', this.answerKeypress)
  },
  data () {
    return {
      publicPath: process.env.BASE_URL,
      abc: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      question: null,
      quiz: null,
      questionTimeoutCorrect: 2000,
      questionTimeoutIncorrect: 4000,
      quizTypes: {
        easy: [
          'guessTheTrial',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmark',
          'guessTheShrineNoTrial',
          'guessTheShrine',
          'guessTheShrine'
        ],
        normal: [
          'guessTheMonk',
          'guessTheTrial',
          'guessTheShrineNoTrial',
          'guessTheShrineNoTrial',
          'guessTheShrine',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmark',
          'guessTheLandmark',
          'guessTheQuest'
        ],
        hard: [
          'guessTheMonk',
          'guessTheMonk',
          'guessTheMonk',
          'guessTheTrial',
          'guessTheShrineNoTrial',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmarkHard',
          'guessTheLandmarkHard',
          'guessTheQuest',
          'guessTheItem',
          'guessTheMonkText',
          'guessTheMonkText'
        ],
        text: [
          'guessTheMonkText'
        ]
      },
      answered: null,
      correct: null,
      previousShrines: [],
      textAnswer: '',
      historyLimit: 10,
      timer: 0,
      correctSound: new Sound('./static/correct.wav'),
      incorrectSound: new Sound('./static/incorrect.wav')
    }
  },
  computed: {
    isCorrect () {
      if (this.answered == null) {
        return null
      }

      if (!this.question.text) {
        return this.correct === this.answered
      } else {
        return this.correct
      }
    }
  },
  methods: {
    newQuestion () {
      const quizTypes = this.quizTypes[this.options.difficulty]
      const quiz = quizTypes[_.random(0, quizTypes.length - 1)]
      this.answered = null
      this.correct = null
      this.textAnswer = ''
      this.quiz = quiz
      this.question = this[quiz]()

      if (this.previousShrines.indexOf(this.question.id) > -1 && this.question.titleRepeat) {
        this.question.title = this.question.titleRepeat
      }

      this.previousShrines.push(this.question.id)

      this.preloadImage(`../static/images/${this.question.imageAnswered}.jpg`)

      if (this.question.text) {
        setTimeout(() => {
          const textField = document.getElementById('textAnswer')
          textField.focus()
        }, 500)
      }
    },
    randomShrine (shrines) {
      const vm = this
      const filteredShrines = _.filter(shrines, o => {
        return vm.previousShrines.slice(vm.previousShrines.length - vm.historyLimit).indexOf(o.id) === -1
      })
      return filteredShrines[_.random(0, filteredShrines.length - 1)]
    },
    preloadImage (image) {
      const img = document.createElement('img')
      img.src = image
    },
    answer (index) {
      if (index > this.options.chooseFrom - 1 || this.answered != null || this.question.text) {
        return
      }

      window.scrollTo(0, 0)

      if (this.options.soundOn) {
        if (index === this.question.answer) {
          this.correctSound.play()
        } else {
          this.incorrectSound.play()
        }
      }
      this.$emit('answer', index === this.question.answer, this.quiz)
      this.answered = index
      this.correct = this.question.answer

      const interval = window.setInterval(() => {
        this.timer += 10
      }, 10)

      setTimeout(() => {
        this.timer = 0
        clearInterval(interval)
        this.newQuestion()
      }, index === this.question.answer ? this.questionTimeoutCorrect : this.questionTimeoutIncorrect)
    },
    answerText (skip) {
      if (this.textAnswer.length < 2 && skip !== true) {
        return
      }

      window.scrollTo(0, 0)

      const evaluatedScore = leven(this.textAnswer.toLowerCase().replace(/!\W/g, ''), this.question.answer.toLowerCase().replace(/!\W/g, ''))

      const correct = evaluatedScore <= 2

      if (this.options.soundOn) {
        if (correct) {
          this.correctSound.play()
        } else {
          this.incorrectSound.play()
        }
      }
      this.$emit('answer', correct, this.quiz)
      this.answered = this.textAnswer
      this.correct = correct

      const interval = window.setInterval(() => {
        this.timer += 10
      }, 10)

      setTimeout(() => {
        this.timer = 0
        clearInterval(interval)
        this.newQuestion()
      }, correct ? this.questionTimeoutCorrect : this.questionTimeoutIncorrect)
    },
    resetScore () {
      this.$emit('reset')
    },
    answerKeypress (e) {
      if (this.question.text) {
        return
      }
      const key = e.keyCode
      switch (key) {
        case 97: // a
          this.answer(0)
          break
        case 65: // A
          this.answer(0)
          break
        case 98: // b
          this.answer(1)
          break
        case 66: // B
          this.answer(1)
          break
        case 99: // c
          this.answer(2)
          break
        case 67: // C
          this.answer(2)
          break
        case 100: // d
          this.answer(3)
          break
        case 68: // D
          this.answer(3)
          break
        case 101: // e
          this.answer(4)
          break
        case 69: // E
          this.answer(4)
          break
        case 102: // f
          this.answer(5)
          break
        case 70: // F
          this.answer(5)
          break
        case 103: // g
          this.answer(6)
          break
        case 71: // G
          this.answer(6)
          break
        case 104: // g
          this.answer(7)
          break
        case 72: // G
          this.answer(7)
          break
        case 105: // h
          this.answer(7)
          break
        case 73: // H
          this.answer(7)
          break
        default:
      }
    },
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
    },
    DLC (shrine) {
      if (!this.options.includeDLC) {
        return shrine.dlc !== true
      }
      return true
    },
    guessTheMonk () {
      const set = _.filter(shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               (this.options.difficulty === 'hard' || o.trial.indexOf('Test of Strength') === -1) &&
               this.hasImages(o, ['internal', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const merged = {
        'Central': 'Ridgeland',
        'Gerudo': 'Wasteland',
        'Lake': 'Faron',
        'Woodland': 'Hebra',
        'Hateno': 'Dueling Peaks'
      }

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          if (shrine.dlc) {
            return o.dlc === true &&
                   o.id !== shrine.id
          }
          if (merged[shrine.region]) {
            return (o.region === shrine.region || o.region === merged[shrine.region]) && // same region merged
                o.trial.indexOf(o.monk) === -1 && // trial contains monk name (blessings, etc)
                (this.options.difficulty === 'hard' || o.trial.indexOf('Test of Strength') === -1) && // exclude similar trials
                this.DLC(o) && // is DLC enabled? if so, mix it in
                o.id !== shrine.id // no duplicates
          }
          return (o.region === shrine.region) && // same region
                 o.trial.indexOf(o.monk) === -1 && // trial contains monk name (blessings, etc)
                 (this.options.difficulty === 'hard' || o.trial.indexOf('Test of Strength') === -1) && // exclude similar trials
                 this.DLC(o) && // is DLC enabled? if so, mix it in
                 o.id !== shrine.id // no duplicates
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => o.monk),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-internal`,
        imageAnswered: `${shrine.id}-title`,
        title: `The trial <strong>${shrine.trial}</strong> is in which shrine?`,
        titleRepeat: `Remember this shrine? It contains the <strong>${shrine.trial}</strong> trial.`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheMonkText () {
      const set = _.filter(shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               o.trial.indexOf('Test of Strength') === -1 &&
               this.hasImages(o, ['internal', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      return {
        text: true,
        answer: shrine.monk,
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `What is the name of this shrine containing the <strong>${shrine.trial}</strong> trial?`,
        titleRepeat: `Remember which shrine contains the <strong>${shrine.trial}</strong> trial?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheTrial () {
      const set = _.filter(shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               this.hasImages(o, ['external', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const merged = {
        'Akkala': 'Lanayru',
        'Woodland': 'Hebra'
      }

      const choices = _.shuffle(_.concat(shrine, _.slice(_.uniqBy(_.shuffle(_.filter(shrines,
        o => {
          if (shrine.dlc) {
            return o.dlc === true &&
                   o.id !== shrine.id
          }
          if (merged[shrine.region]) {
            return (o.region === shrine.region ||
                   o.region === merged[shrine.region]) && // same region merged
                   o.trial.indexOf(o.monk) === -1 && // trial contains monk name (blessings, etc)
                   this.DLC(o) && // is DLC enabled? if so, mix it in
                   o.trial !== shrine.trial && // for 'twin memories'
                   o.id !== shrine.id
          }
          return (o.region === shrine.region) && // same region
                 o.trial.indexOf(o.monk) === -1 && // trial contains monk name (blessings, etc)
                 this.DLC(o) && // is DLC enabled? if so, mix it in
                 o.trial !== shrine.trial && // for 'twin memories'
                 o.id !== shrine.id
        }
      )), 'trial'), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => o.trial),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `The shrine <strong>${shrine.monk}</strong> has which trial for you?`,
        titleRepeat: `Do you remember which trial <strong>${shrine.monk}</strong> has in store for you?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheShrine () {
      const set = _.filter(shrines, o => {
        return this.hasImages(o, ['external', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          if (shrine.dlc) {
            return o.dlc === true &&
                   o.id !== shrine.id // only select other DLC shrines
          }
          return (o.region === shrine.region) &&
                 this.DLC(o) && // is DLC enabled? if so, mix it in
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheShrineNoTrial () {
      const set = _.filter(shrines, o => {
        return this.hasImages(o, ['external', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          if (shrine.dlc) {
            return o.dlc === true &&
                   o.id !== shrine.id // only select other DLC shrines
          }
          return (o.region === shrine.region) &&
                 this.DLC(o) && // is DLC enabled? if so, mix it in
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.monk}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheShrineFromQuest () {
      const set = _.filter(shrines, o => {
        return o.quest &&
               this.hasImages(o, ['quest', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-quest`,
        imageAnswered: `${shrine.id}-title`,
        title: `Completing the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        titleRepeat: `Again, the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheShrineFromLandmark () {
      const set = _.filter(shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['external', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `<strong>${shrine.landmark}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${shrine.landmark}</strong> again. What's the shrine called?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheShrineFromLandmarkHard () {
      const set = _.filter(shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['external', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `<strong>${(shrine.landmark || shrine.minor_landmark)}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${(shrine.landmark || shrine.minor_landmark)}</strong> again. What's the shrine called?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheLandmark () {
      const set = _.filter(shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['external', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.landmark}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-title`,
        imageAnswered: `${shrine.id}-external`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheLandmarkHard () {
      const set = _.filter(shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['external', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${(o.landmark || o.minor_landmark)}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-title`,
        imageAnswered: `${shrine.id}-external`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheQuest () {
      const set = _.filter(shrines, o => {
        return o.quest &&
               this.hasImages(o, ['title', 'quest'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.quest}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-title`,
        imageAnswered: `${shrine.id}-quest`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        titleRepeat: `This one again, <strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    },
    guessTheItem () {
      const set = _.filter(shrines, o => {
        return o.main_item &&
               this.hasImages(o, ['external', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(shrines,
        o => {
          if (shrine.dlc) {
            return o.dlc === true &&
                   o.main_item !== shrine.main_item &&
                   o.id !== shrine.id
          }
          return this.DLC(o) &&
                 o.main_item !== shrine.main_item &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        choices: _.map(choices, o => `${o.main_item}`),
        answer: _.indexOf(choices, shrine),
        image: `${shrine.id}-external`,
        imageAnswered: `${shrine.id}-title`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
        titleRepeat: `Remind me, <strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
        id: shrine.id,
        shrineSlug: shrine.shrine_name,
        shrineName: shrine.monk
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}

@media (max-width: 600px) {
  h1,
  h2 {
    font-size: 18px;
  }
}
.quiz {
  margin: 0 auto;
  max-width: 800px;
}

.question-text {
  display: flex;
  min-height: 3em;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .question-text {
    min-height: 3em;
  }
}

.choices {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto 50px;
  max-width: 600px;
}
ol {
  margin-right: -10px;
  margin-left: -10px;
  padding: 0;
  list-style-type: none;
}
li {
  display: inline-block;
  padding: 0 10px;
  box-sizing: border-box;
}
a {
  color: #42b983;
}
.choice {
  width: 50%;
}

.choice button,
.choice button:disabled,
.skip-button {
  margin-bottom: 1em;
  padding: 1em;
  width: 100%;
  color: #363636;
  background-color: rgba(178, 186, 179, .8);
  border-color: #363636;
  cursor: pointer;
  font-size: 110%;
  min-height: 5em;
}

.skip-button {
  max-width: 250px;
}

@media (max-width: 600px) {
  .choice {
    width: 100%;
    padding: 0;
  }

  .choice button,
  .choice button:disabled,
  .skip-button {
    margin-bottom: 2px;
    padding: .5em 1em;
    min-height: 3em;
    font-size: 100%;
  }
}

.choice button:disabled,
.skip-button:disabled {
  cursor: default;
}

.choice button:hover,
.skip-button:hover {
  background-color: rgba(178, 186, 179, 1);
}

@media (hover: none) {
  .choice button:hover,
  .skip-button:hover {
    background-color: rgba(178, 186, 179, .7);
  }
}

.choice button.answered {
  color: #4b2c25;
  border-color: #4b2c25;
  background-color: #d0a298;
  opacity: 1;
}
.choice button.correct,
.choice button.correct.answered {
  color: #2b472b;
  border-color: #2b472b;
  background-color: #98d098;
  opacity: 1;
}
.image {
  margin: 0 auto 1em;
  max-width: 100%;
  height: auto;
  padding: 5px;
  border-radius: 5px;
  background: rgba(255,255,255,0.5);
}

@media (max-width: 600px) {
  .image {
    margin-bottom: 0;
  }
}

.image-correct {
  background-color: #98d098;
}
.alert-correct {
  color: #98d098;
}

.image-incorrect {
  background-color: #d0a298;
}
.alert-incorrect {
  color: #d0a298;
}

progress[value] {
  margin-bottom: 1em;
  max-width: 800px;
  width: 100%;
  height: 2px;
  appearance: none;
}

@media (max-width: 600px) {
  progress[value] {
    position: fixed;
    bottom: 0;
    left: 0;
    margin-bottom: 0;
    width: 100%;
  }
}

progress[value]::-webkit-progress-bar {
  background-color: transparent;
}

progress[value]::-webkit-progress-value {
  background-color: #fff;
}

.text-answer {
  display: block;
  padding: 10px .25em;
  width: 100%;
  color: #363636;
  background-color: rgba(178, 186, 179, .8);
  border-color: #363636;
  cursor: pointer;
  font-size: 200%;
}

</style>
<!--

Type of quizes:

1. Guess the monk:
   - choices: shrines in the same region
   - image: trial name + internal shrine image (without title)
   - exclude: shrines with monk's name in trial
2. Guess the trial:
   - choices: shrines in the same region
   - image: monk name + internal shrine image (without title)
3. Guess the monk & trial:
   - choices: shrines in the same region
   - image: external shrine image
4. Guess the monk & trial (shrine quest):
   - choices: shrines for other shrine quests
   - image: shrine quest assignment (from NPC)
5. Guess the monk & trial (landmark):
   - choices: shrines for other landmarks
   - image: external shrine image
6. Guess the landmark:
   - choices: other landmarks
   - image: internal shrine image (with title)
7. Guess the shrine quest:
   - choices: other shrine quests
   - image: internal shrine image (with title)
8. HARD MODE - Guess the main item:
   - choices: shrines in the same region
   - image: internal shrine image (with title)

Images needed:

1. internal - Internal shrine image (without title)
2. title - Internal shrine image (with title)
3. external - External shrine image
5. quest - Shrine quest assignment (from NPC)

-->
