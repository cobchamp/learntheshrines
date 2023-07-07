<template>
  <main id="options">
    <MainContainer>
      <div class="quiz-question" v-if="question">
        <ShrineImage game="totk" ref="shrine-image" :image="[question.id, answered === null ? question.image : question.imageAnswered]" :map="answered === null ? question.hasMap : false"></ShrineImage>

        <div class="question-text" v-if="answered === null">
          <h1><span v-html="question.title"></span></h1>
        </div>

        <div class="question-text" :class="{'alert-correct': isCorrect, 'alert-incorrect': !isCorrect}" v-else>
          <h2 class="after-text">
            {{ isCorrect ? yeses[score.count % yeses.length] : nopes[score.count % nopes.length] }}
            <span v-html="question.afterText ? question.afterText.split('|')[0] : defaultAfterText((question.choices ? question.choices[question.answer] : question.answer), isCorrect)"></span>
          </h2>
          <p class="after-text" v-if="question.afterText && question.afterText.split('|')[1]" v-html="question.afterText.split('|')[1]"></p>
        </div>

        <template v-if="answered !== null">
          <progress :class="{'correct': isCorrect, 'incorrect': !isCorrect}" :value="timer" :max="((!isCorrect) ? questionTimeoutIncorrect : questionTimeoutCorrect) - 100" v-if="options.fastMode"></progress>
          <button class="button button--wide" v-else @click="nextQuestion" title="Press N">Next Question</button>
        </template>

        <hr />

        <router-link class="button button--wide" v-if="answered !== null && question.shrine" :to="'/totk-shrines/' + zonaiNameURLSafe(this.question.shrine.name)" title="Press I">About {{ this.question.shrine.name }}</router-link>
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
      <QuizMap v-else-if="question && !question.choices && typeof question.answer === 'object'" :correct="question.answer" :answered="answered" :difficulty="options.difficulty" :layer="question.shrine.layer" game="totk" @answer="answer"></QuizMap>
      <QuizText v-else-if="question && !question.choices" :correct="question.answer" :answered="answered" :leven="3" @answer="answer"></QuizText>
      <div v-else><!-- --></div>
    </SideContainer>

    <QuizScore :score="score" />
  </main>
</template>
<script>
/* global _ */

import QuizChoices from './QuizChoices.vue'
import QuizText from './QuizText.vue'
import QuizMap from './QuizMap.vue'
import ShrineImage from './ShrineImage.vue'
import QuizScore from './QuizScore.vue'
import { newQuestion, nextQuestion, hasImages, randomShrine, preloadImage, lightrootify, defaultAfterText, zonaiNameURLSafe, answer } from '../lib/quiz.js'

export default {
  name: 'TotkQuiz',
  components: {
    QuizChoices,
    QuizText,
    QuizMap,
    ShrineImage,
    QuizScore
  },
  mounted () {
    document.removeEventListener('keypress', this.answerKeypress)
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
          'guessTheShrine',
          'findTheShrine'
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
          'guessTheShrineFromCaveOrIsland',
          'findTheShrine',
          'findTheShrine',
          'findTheShrine',
          'findTheShrine'
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
          'guessTheShrineText',
          'findTheShrine',
          'findTheShrine',
          'findTheShrine'
        ],
        text: [
          'guessTheZonaiText',
          'guessTheShrineText'
        ],
        map: [
          'findTheShrine'
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
    newQuestion,
    nextQuestion,
    hasImages,
    randomShrine,
    preloadImage,
    lightrootify,
    defaultAfterText,
    zonaiNameURLSafe,
    answer,
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
        afterText: `<strong>${shrine.name}</strong> is the name of the shrine that contains <strong>${shrine.trial}</strong>|${shrine.layer === 'Surface' ? `<strong>${this.lightrootify(shrine.name)} Lightroot</strong> lay in the ${shrine.region} Depths below` : `<strong>${shrine.region}</strong> wouldn't be the same without ${shrine.name}`}`,
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
        afterText: `<strong>${shrine.name}</strong> is the name of the shrine that contains <strong>${shrine.trial}</strong>|${shrine.layer === 'Surface' ? `<strong>${this.lightrootify(shrine.name)} Lightroot</strong> lay in the ${shrine.region} Depths below` : `<strong>${shrine.region}</strong> wouldn't be the same without ${shrine.name}`}`,
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
        afterText: `<strong>${shrine.trial}</strong> is the trial in <strong>${shrine.name}</strong>|You may find <strong>${shrine.items}</strong> within its walls`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrine () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (this.options.difficulty !== 'easy' || o.trial.indexOf('Rauru') === -1) && // exclude Rauru's Blessing on easy
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                (this.options.difficulty !== 'easy' || o.trial.indexOf('Rauru') === -1) && // exclude Rauru's Blessing on easy
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
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is the name of this shrine in the <strong>${shrine.region}</strong> region.|${afterTextExtra}`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    guessTheShrineNoTrial () {
      const lightroot = Math.random() < 0.3 // 30% chance of this being a lightroot question

      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
          (!lightroot || o.layer === 'Surface') && // lightroot question surface only
          (!o.cave_or_island && o.layer === 'Surface') // exclude caves
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.map === shrine.map || o.region === shrine.region) && // same map OR region
                  (!lightroot || o.layer === 'Surface') && // lightroot question surface only
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
          afterText: `This shrine is <strong>${shrine.name}</strong> and <strong>${this.lightrootify(shrine.name)}</strong> Lightroot lays below in the <strong>${shrine.region}</strong> Depths.|There is no <strong>${this.lightrootify(shrine.trial)}</strong> trial`,
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
          afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is this shrine, in the <strong>${shrine.region}</strong> region.|${afterTextExtra}`,
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
        afterText: `<strong>${shrine.name}: ${shrine.trial}</strong> is this shrine, in the <strong>${shrine.region}</strong> region.|${afterTextExtra}`,
        hasMap: this.hasImages(shrine, ['map']),
        shrine: shrine,
        id: shrine.id
      }
    },

    findTheShrine () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title', 'map']) && o.coords &&
              (this.options.difficulty !== 'easy' || o.trial.indexOf('Rauru') === -1) // exclude Rauru's Blessing on easy
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Find the Shrine on a Map',
        answer: shrine.coords,
        image: `title`,
        imageAnswered: `map`,
        title: `This shrine is called <strong>${shrine.name}: ${shrine.trial}</strong>`,
        titleRepeat: `This shrine is called <strong>${shrine.name}: ${shrine.trial}</strong>`,
        afterText: `<strong>${shrine.name}</strong> is here, in the <strong>${shrine.region}</strong> region on the <strong>${shrine.map}</strong> Skyview Tower map`,
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
    },

    answerKeypress (e) {
      const key = e.keyCode
      switch (key) {
        case 110: // n
          if (!this.options.fastMode && this.answered != null) {
            this.nextQuestion()
          }
          break
        case 78: // N
          if (!this.options.fastMode && this.answered != null) {
            this.nextQuestion()
          }
          break
        case 105: // i
          if (this.answered != null) {
            this.$router.push('/totk-shrines/' + this.zonaiNameURLSafe(this.question.shrine.name))
          }
          break
        case 73: // i
          if (this.answered != null) {
            this.$router.push('/totk-shrines/' + this.zonaiNameURLSafe(this.question.shrine.name))
          }
          break
        default:
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
      {property: 'og:title', content: 'TOTK Shrine Quiz :: Learn the Shrines'},
      {property: 'og:site_name', content: 'Learn the Shrines'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://learntheshrines.com/totk'},
      {property: 'og:image', content: 'https://learntheshrines.com/static/images/share-image.jpg'},
      {property: 'og:description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:site', content: 'https://learntheshrines.com/totk'},
      {name: 'twitter:title', content: 'TOTK Shrine Quiz :: Learn the Shrines'},
      {name: 'twitter:description', content: 'How well do you know the shrines in TOTK? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:creator', content: '@cobwoms'},
      {name: 'twitter:image:src', content: 'https://learntheshrines.com/static/images/share-image.jpg'},

      {itemprop: 'name', content: 'TOTK Shrine Quiz :: Learn the Shrines'},
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
    text-align: center;
    line-height: 1.4;
  }

  .question-text h1 {
    font-size: 32px;
    font-weight: normal;
  }

  .question-text h2 {
    font-size: 26px;
    font-weight: normal;
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
