<template>
  <main id="options">
    <MainContainer>
      <div class="quiz-question" v-if="question">
        <ShrineImage game="totk" ref="shrine-image" :image="[question.id, answered === null ? question.image : question.imageAnswered]" :map="answered === null ? question.hasMap : false"></ShrineImage>

        <h1 class="question-text" v-if="answered === null"><span v-html="question.title"></span></h1>

        <template v-else>
          <h2 class="question-text after-text" :class="{'alert-correct': isCorrect, 'alert-incorrect': !isCorrect}">
            {{ isCorrect ? yeses[score.count % yeses.length] : nopes[score.count % nopes.length] }}
            <span v-html="question.afterText ? question.afterText : defaultAfterText(question.choices[question.answer], isCorrect)"></span>
          </h2>
        </template>

        <template v-if="answered !== null">
          <progress :class="{'correct': isCorrect, 'incorrect': !isCorrect}" :value="timer" :max="((!isCorrect) ? questionTimeoutIncorrect : questionTimeoutCorrect) - 100" v-if="options.fastMode"></progress>
          <button class="button" v-else @click="nextQuestion">Next Question</button>
        </template>

        <hr />

        <router-link class="button button--wide" v-if="answered !== null && question.shrine" :to="'/totk-shrines/' + zonaiNameURLSafe(this.question.shrine.name)">About {{ this.question.shrine.name }}</router-link>
      </div>
    </MainContainer>

    <SideContainer :indicator="answered === null ? '#000' : isCorrect ? '#56B81A' : '#B85C1A'">
      <template v-slot:title>
        <h2>
          {{ options.difficulty | capitalising }} Question {{ score.count + ((answered === null) ? 1 : 0) }}
          <strong v-if="question && question.type">{{ question.type }}</strong>
        </h2>
      </template>

      <QuizChoices v-if="question && question.choices" :choices="question.choices" :correct="question.answer" @answer="answer"></QuizChoices>
      <QuizText v-else-if="question && !question.choices" :correct="question.answer" :answered="answered" :leven="3" @answer="answer"></QuizText>
      <div v-else><!-- --></div>
    </SideContainer>

    <QuizScore :score="score" />
  </main>
</template>
<script>
import _ from 'lodash'
import QuizChoices from './QuizChoices.vue'
import QuizText from './QuizText.vue'
import ShrineImage from './ShrineImage.vue'
import QuizScore from './QuizScore.vue'

export default {
  name: 'TotkQuiz',
  components: {
    QuizChoices,
    QuizText,
    ShrineImage,
    QuizScore
  },
  mounted () {
    if (this.options.game === 'botw') {
      let myOptions = this.options
      myOptions['game'] = 'totk'
      this.$emit('updateOptions', myOptions)
      this.$emit('updateScore', 'reset')
    }

    if (this.question == null || this.question.answered) {
      this.newQuestion()
    } else {
      this.$emit('updateBg', this.question.id, this.question.image)
    }
  },
  computed: {
    options () {
      return this.$parent.options
    },
    score () {
      return this.$parent.score
    },
    shrines () {
      return this.$parent.shrines['totk']
    },
    question () {
      return this.$parent.question
    },
    isCorrect () {
      if (this.answered == null) {
        return null
      }

      return this.question.answer === this.answered
    }
  },
  data () {
    return {
      questionTimeoutCorrect: 3000,
      questionTimeoutIncorrect: 5000,
      quizTypes: {
        easy: [
          'guessTheTrial',
          'guessTheShrineFromLandmark',
          'guessTheShrine',
          'guessTheShrine'
        ],
        normal: [
          'guessTheZonai',
          'guessTheTrial',
          'guessTheTrial',
          'guessTheShrineNoTrial',
          'guessTheShrine',
          'guessTheShrine',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmark',
          'guessTheLandmark',
          'guessTheQuest',
          'guessTheShrineFromCaveOrIsland'
        ],
        hard: [
          'guessTheZonai',
          'guessTheZonai',
          'guessTheTrial',
          'guessTheShrineNoTrial',
          'guessTheShrineNoTrial',
          'guessTheShrine',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmarkHard',
          'guessTheLandmarkHard',
          'guessTheQuest',
          'guessTheItem',
          'guessTheShrineFromCaveOrIsland',
          'guessTheZonaiText',
          'guessTheShrineText'
        ],
        'text': [
          'guessTheZonaiText',
          'guessTheShrineText'
        ]
      },
      answered: null,
      previousShrines: [],
      historyLimit: 10,
      timer: 0,
      correctSound: '/static/sounds/totk/correct.wav',
      incorrectSound: '/static/sounds/totk/incorrect.wav',
      yeses: [
        'Correct!',
        'Yep!',
        'You\'re right!',
        'You got it!'
      ],
      nopes: [
        'No...',
        'Sorry.',
        'That\'s incorrect!',
        'Unfortunately...'
      ]
    }
  },
  methods: {
    newQuestion () {
      const quizTypes = this.quizTypes[this.options.difficulty]
      const quiz = quizTypes[_.random(0, quizTypes.length - 1)]
      this.answered = null
      this.correct = null
      this.$emit('updateQuestion', this[quiz]())

      if (this.previousShrines.indexOf(this.question.id) > -1 && this.question.titleRepeat) {
        this.question.title = this.question.titleRepeat
      }

      this.previousShrines.push(this.question.id)

      this.preloadImage(`/static/images/totk/${this.question.imageAnswered}.jpg`)

      this.$emit('updateBg', this.question.id, this.question.image)
    },
    nextQuestion () {
      this.newQuestion()
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
    lightrootify (name) {
      let lr = name.split('').reverse().join('').toLowerCase()
      lr = lr[0].toUpperCase() + lr.slice(1)
      return lr
    },
    defaultAfterText (theAnswer, isCorrect) {
      if (isCorrect) {
        return 'It\'s <strong>' + theAnswer + '</strong>'
      } else {
        return 'The correct answer is <strong>' + theAnswer + '</strong>'
      }
    },
    zonaiNameURLSafe (name) {
      return name.toLowerCase()
    },
    answer (response) {
      if ((this.question.choices && response > this.options.chooseFrom - 1) || this.answered != null) {
        return
      }

      window.scrollTo(0, 0)

      if (this.options.soundOn) {
        if (response === this.question.answer) {
          window.sound.play(this.correctSound)
        } else {
          window.sound.play(this.incorrectSound)
        }
      }
      this.answered = response

      this.$emit('updateBg', this.question.id, this.question.imageAnswered)

      this.$emit('updateScore', this.answered === this.question.answer)

      let answeredQuestion = this.question
      answeredQuestion.answered = true
      this.$emit('updateQuestion', answeredQuestion)

      if (this.options.fastMode) {
        const interval = window.setInterval(() => {
          this.timer += 10
        }, 10)

        setTimeout(() => {
          this.timer = 0
          clearInterval(interval)
          this.newQuestion()
        }, response === this.question.answer ? this.questionTimeoutCorrect : this.questionTimeoutIncorrect)
      }
    },

    guessTheZonai () {
      const set = _.filter(this.shrines, o => {
        return o.trial.indexOf('Rauru') === -1 &&
               (o.trial.indexOf('Archery') === -1 || o.trial.indexOf('Throwing') === -1) &&
               this.hasImages(o, ['interior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                 o.trial.indexOf('Rauru') === -1 && // exclude Rauru's Blessing
                 (o.trial.indexOf('Archery') === -1 || o.trial.indexOf('Throwing') === -1) && // exclude similar trials
                 o.id !== shrine.id // no duplicates
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess the Shrine Name by Trial',
        choices: _.map(choices, o => o.name),
        answer: _.indexOf(choices, shrine),
        title: `The trial <strong>${shrine.trial}</strong> is in which shrine?`,
        titleRepeat: `Remember this shrine? It contains the <strong>${shrine.trial}</strong> trial.`,
        afterText: `<strong>${shrine.name}</strong> is the name of the shrine that contains <strong>${shrine.trial}</strong>`,
        image: 'interior',
        imageAnswered: 'title',
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheZonaiText () {
      const set = _.filter(this.shrines, o => {
        return o.trial.indexOf('Rauru') === -1 &&
               (o.trial.indexOf('Archery') === -1 || o.trial.indexOf('Throwing') === -1) &&
               this.hasImages(o, ['interior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Type in the Shrine Name by Trial',
        answer: shrine.name,
        title: `What is the name of this shrine containing the <strong>${shrine.trial}</strong> trial?`,
        titleRepeat: `Remember which shrine contains the <strong>${shrine.trial}</strong> trial?`,
        afterText: `<strong>${shrine.name}</strong> is the name of the shrine that contains <strong>${shrine.trial}</strong>`,
        image: 'interior',
        imageAnswered: 'title',
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheTrial () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.uniqBy(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                 o.trial !== shrine.trial && // exclude shrines with the same name
                 o.id !== shrine.id
        }
      )), 'trial'), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess the Trial by Shrine Name',
        choices: _.map(choices, o => o.trial),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `interior`,
        title: `The shrine <strong>${shrine.name}</strong> has which trial for you?`,
        titleRepeat: `Do you remember which trial <strong>${shrine.name}</strong> has in store for you?`,
        afterText: `<strong>${shrine.trial}</strong> is the trial in <strong>${shrine.name}</strong>`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrine () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (this.options.difficulty !== 'easy' && o.trial.indexOf('Rauru') === -1) && // exclude Rauru's Blessing on easy
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                (this.options.difficulty !== 'easy' && o.trial.indexOf('Rauru') === -1) && // exclude Rauru's Blessing on easy
                o.trial !== shrine.trial && // exclude shrines with the same name
                o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      let afterTextExtra = ''

      if (shrine.major_landmark || shrine.minor_landmark) {
        afterTextExtra = `The closest landmark is <strong>${shrine.major_landmark || shrine.minor_landmark}</strong>.`
      }

      return {
        type: 'Guess Shrine + Trial by Region',
        choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the name of this shrine in the <strong>${shrine.region}</strong> region. ${afterTextExtra}`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrineNoTrial () {
      const lightroot = Math.random() < 0.3 // 30% chance of this being a lightroot question

      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (lightroot && o.layer === 'Surface') && // lightroot question surface only
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                  (lightroot && o.layer === 'Surface') && // lightroot question surface only
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      if (lightroot) {
        return {
          type: 'Guess Lightroot by Region',
          choices: _.map(choices, o => `<strong>${this.lightrootify(o.name)}</strong> Lightroot`),
          answer: _.indexOf(choices, shrine),
          image: `exterior`,
          imageAnswered: `title`,
          title: `A Lightroot lays beneath this shrine, in the <strong>${shrine.region}</strong> Depths. What is it called?`,
          titleRepeat: `Back in the <strong>${shrine.region}</strong> Depths, below this shrine, what was this Lightroot's name?`,
          afterText: `<strong>${this.lightrootify(shrine.name)}</strong> Lightroot lays below this shrine, in the <strong>${shrine.region}</strong> Depths.`,
          hasMap: this.hasImages(shrine, ['map']),
          shrine: shrine,
          id: shrine.id
        }
      } else {
        let afterTextExtra = ''
        if (shrine.major_landmark || shrine.minor_landmark) {
          afterTextExtra = `The closest landmark is <strong>${shrine.major_landmark || shrine.minor_landmark}</strong>.`
        }

        return {
          type: 'Guess Shrine by Region',
          choices: _.map(choices, o => `<strong>${o.name}</strong>`),
          answer: _.indexOf(choices, shrine),
          image: `exterior`,
          imageAnswered: `title`,
          title: `This shrine is in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
          titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
          afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is this shrine, in the <strong>${shrine.region}</strong> region. ${afterTextExtra}`,
          hasMap: this.hasImages(shrine, ['map']),
          shrine: shrine,
          id: shrine.id
        }
      }
    },

    guessTheShrineText () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      let afterTextExtra = ''
      if (shrine.major_landmark || shrine.minor_landmark) {
        afterTextExtra = `The closest landmark is <strong>${shrine.major_landmark || shrine.minor_landmark}</strong>.`
      }

      return {
        type: 'Type in the Shrine Name by Region',
        answer: shrine.name,
        image: `exterior`,
        imageAnswered: `title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is this shrine, in the <strong>${shrine.region}</strong> region. ${afterTextExtra}`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrineFromQuest () {
      const set = _.filter(this.shrines, o => {
        return o.quest &&
               this.hasImages(o, ['quest', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Quest',
        choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `quest`,
        imageAnswered: `exterior`,
        title: `Completing the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        titleRepeat: `Again, the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine for the quest <strong>${shrine.quest}</strong>`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrineFromCaveOrIsland () {
      const set = _.filter(this.shrines, o => {
        return o.cave_or_island &&
               this.hasImages(o, ['cave_or_island', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.cave_or_island &&
                 o.layer === shrine.layer &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      if (shrine.layer === 'Surface') {
        return {
          type: 'Guess Shrine by Cave',
          choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
          answer: _.indexOf(choices, shrine),
          image: `cave_or_island`,
          imageAnswered: `exterior`,
          title: `Within the <strong>${shrine.cave_or_island}</strong> in the <strong>${shrine.region}</strong> region is what shrine?`,
          titleRepeat: `Back inside <strong>${shrine.cave_or_island}</strong>. What's this shrine called in the <strong>${shrine.region}</strong> region?`,
          afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine within <strong>${shrine.cave_or_island}</strong> in the <strong>${shrine.region}</strong> region.`,
          hasMap: this.hasImages(shrine, ['map']),
          shrine: shrine,
          id: shrine.id
        }
      } else {
        return {
          type: 'Guess Shrine by Sky Island',
          choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
          answer: _.indexOf(choices, shrine),
          image: `cave_or_island`,
          imageAnswered: `exterior`,
          title: `In the skies of <strong>${shrine.region}</strong>, on <strong>${shrine.cave_or_island}</strong> is what shrine?`,
          titleRepeat: `Returning to the skies of <strong>${shrine.region}</strong>, on <strong>${shrine.cave_or_island}</strong>. What's the shrine here called?`,
          afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine on <strong>${shrine.cave_or_island}</strong> in the <strong>${shrine.region}</strong> region.`,
          hasMap: this.hasImages(shrine, ['map']),
          shrine: shrine,
          id: shrine.id
        }
      }
    },

    guessTheShrineFromLandmark () {
      const set = _.filter(this.shrines, o => {
        return o.major_landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.major_landmark &&
                 o.layer === shrine.layer && // same layer
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Landmark',
        choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${shrine.major_landmark}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${shrine.major_landmark}</strong> again. What's the shrine called?`,
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine located near <strong>${shrine.major_landmark}</strong>`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrineFromLandmarkHard () {
      const set = _.filter(this.shrines, o => {
        return (o.major_landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.major_landmark || o.minor_landmark) &&
                 o.layer === shrine.layer && // same layer
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Minor Landmark',
        choices: _.map(choices, o => `<strong>${o.name}:</strong> ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${(shrine.major_landmark || shrine.minor_landmark)}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${(shrine.major_landmark || shrine.minor_landmark)}</strong> again. What's the shrine called?`,
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine located near <strong>${(shrine.major_landmark || shrine.minor_landmark)}</strong>`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheLandmark () {
      const set = _.filter(this.shrines, o => {
        return o.major_landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.major_landmark &&
                 o.layer === shrine.layer && // same layer
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Landmark by Shrine',
        choices: _.map(choices, o => `${o.major_landmark}`),
        answer: _.indexOf(choices, shrine),
        image: `title`,
        imageAnswered: `exterior`,
        title: `<strong>${shrine.name}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.name}: ${shrine.trial}</strong> will put you at what landmark?`,
        afterText: `<strong>${shrine.major_landmark}</strong> can be found by <strong>${shrine.name}: ${shrine.trial}</strong> `,
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheLandmarkHard () {
      const set = _.filter(this.shrines, o => {
        return (o.major_landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.major_landmark || o.minor_landmark) &&
                 o.layer === shrine.layer && // same layer
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Minor Landmark by Shrine',
        choices: _.map(choices, o => `${(o.major_landmark || o.minor_landmark)}`),
        answer: _.indexOf(choices, shrine),
        image: `title`,
        imageAnswered: `exterior`,
        title: `<strong>${shrine.name}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.name}: ${shrine.trial}</strong> will put you at what landmark?`,
        afterText: `<strong>${(shrine.major_landmark || shrine.minor_landmark)}</strong> can be found by <strong>${shrine.name}: ${shrine.trial}</strong> `,
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheQuest () {
      const set = _.filter(this.shrines, o => {
        return o.quest &&
               this.hasImages(o, ['title', 'quest'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Quest by Shrine',
        choices: _.map(choices, o => `${o.quest}`),
        answer: _.indexOf(choices, shrine),
        image: `title`,
        imageAnswered: `quest`,
        title: `<strong>${shrine.name}: ${shrine.trial}</strong> is the shrine for which quest?`,
        titleRepeat: `This one again, <strong>${shrine.name}: ${shrine.trial}</strong> is the shrine for which quest?`,
        afterText: `Completing <strong>${shrine.quest}</strong> is how you unlock <strong>${shrine.name}: ${shrine.trial}</strong> `,
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheItem () {
      const set = _.filter(this.shrines, o => {
        return o.items &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.items !== shrine.items &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Item in the Shrine',
        choices: _.map(choices, o => `${o.items}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${shrine.name}: ${shrine.trial}</strong> contains which item?`,
        titleRepeat: `Remind me, <strong>${shrine.name}: ${shrine.trial}</strong> contains which item?`,
        afterText: `Open the chest(s) for <strong>${shrine.items}</strong> inside <strong>${shrine.name}: ${shrine.trial}</strong>`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
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
    }
  },
  metaInfo: {
    title: 'TOTK Shrine Quiz',
    meta: [
      {name: 'description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {property: 'og:title', content: 'TOTK Shrine Quiz - Learn the Shrines'},
      {property: 'og:site_name', content: 'Learn the Shrines'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://learntheshrines.com/totk'},
      {property: 'og:image', content: 'https://learntheshrines.com/static/images/share-image.jpg'},
      {property: 'og:description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:site', content: 'https://learntheshrines.com/totk'},
      {name: 'twitter:title', content: 'TOTK Shrine Quiz - Learn the Shrines'},
      {name: 'twitter:description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:creator', content: '@cobwoms'},
      {name: 'twitter:image:src', content: 'https://learntheshrines.com/static/images/share-image.jpg'},

      {itemprop: 'name', content: 'TOTK Shrine Quiz - Learn the Shrines'},
      {itemprop: 'description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {itemprop: 'image', content: 'https://learntheshrines.com/static/images/share-image.jpg'}
    ],
    link: [
      {rel: 'canonical', href: 'https://learntheshrines.com/totk'}
    ]
  }
}
</script>

<style>
  .image {
    max-width: 100%;
    height: auto;
  }

  .shrine-image {
    margin-bottom: 32px;
  }

  .question-text {
    margin-top: 32px;
    padding: 0 10%;
    margin-bottom: 32px;
    font-weight: normal;
    font-size: 32px;
    text-align: center;
    line-height: 1.4;
  }

  .question-text.after-text {
    font-size: 26px;
  }

  .question-text.alert-correct {
    color: #56B81A;
  }

  .question-text.alert-incorrect {
    color: #B85C1A;
  }

  progress[value] {
    display: block;
    margin-top: 0;
    margin-right: auto;
    margin-bottom: 1em;
    margin-left: auto;
    max-width: 200px;
    width: 100%;
    height: 3px;
    appearance: none;
  }

  progress[value]::-webkit-progress-bar {
    background-color: rgba(190,190,190,.2);
  }

  progress[value]::-webkit-progress-value {
    background-color: #fff;
  }

  @media (max-width: 1250px) {
    .shrine-image {
      margin-bottom: 16px;
    }

    .question-text {
      margin-top: 16px;
      margin-bottom: 16px;
      font-size: 24px;
    }

    .question-text.after-text {
      font-size: 20px;
    }
  }

</style>
