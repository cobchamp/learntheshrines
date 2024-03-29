<template>
  <main id="options">
    <MainContainer>
      <div class="quiz-question" v-if="question">
        <ShrineImage game="botw" ref="shrine-image" :image="[question.id, answered === null ? question.image : question.imageAnswered]" :class="{'alert-correct': answered !== null && isCorrect, 'alert-incorrect': answered !== null && !isCorrect}"></ShrineImage>

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
          <progress :value="((timer / ((!isCorrect) ? questionTimeoutIncorrect : questionTimeoutCorrect)) * 100)" :max="100" v-if="options.fastMode"></progress>
          <button class="button button--wide" v-else @click="nextQuestion" title="Press N">Next Question</button>
        </template>

        <hr />

        <router-link class="button button--wide" v-if="answered !== null && question.shrine" :to="'/botw-shrines/' + monkNameURLSafe(this.question.shrine.monk)" title="Press I">About {{ this.question.shrine.monk }}</router-link>
      </div>
    </MainContainer>

    <SideContainer :indicator="answered === null ? '#000' : isCorrect ? '#56B81A' : '#B85C1A'">
      <template v-slot:title v-if="question && question.type">
        <h2>
          {{ options.difficulty | capitalising }} Question {{ score.count + ((answered === null) ? 1 : 0) }}
          <strong v-if="question && question.type">{{ question.type }}</strong>
        </h2>
      </template>

      <QuizChoices v-if="question && question.choices" :choices="question.choices" :correct="question.answer" @answer="answer"></QuizChoices>
      <QuizMap v-else-if="question && !question.choices && typeof question.answer === 'object'" :correct="question.answer" :answered="answered" :difficulty="options.difficulty" game="botw" @answer="answer"></QuizMap>
      <QuizText v-else-if="!question.choices" :correct="question.answer" :answered="answered" :leven="2" @answer="answer"></QuizText>
      <div v-else><!-- --></div>
    </SideContainer>

    <QuizScore :score="score" />
  </main>
</template>
<script>

import QuizChoices from '../components/QuizChoices.vue'
import QuizText from '../components/QuizText.vue'
import QuizMap from '../components/QuizMap.vue'
import ShrineImage from '../components/ShrineImage.vue'
import QuizScore from '../components/QuizScore.vue'
import { newQuestion, nextQuestion, hasImages, randomShrine, defaultAfterText, DLC, monkNameURLSafe, answer, answerKeypress, randomType, questionWatcher, preparedQuestionWatcher } from '../lib/quiz.js'

export default {
  name: 'BotwQuiz',
  components: {
    QuizChoices,
    QuizText,
    QuizMap,
    QuizScore,
    ShrineImage
  },
  computed: {
    options () {
      return this.$parent.options
    },
    score () {
      return this.$parent.score
    },
    shrines () {
      return this.$parent.shrines.botw
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
  mounted () {
    document.removeEventListener('keypress', this.answerKeypress)
    if (this.options.game === 'totk') {
      const myOptions = this.options
      myOptions.game = 'botw'
      this.$emit('updateOptions', myOptions)
      this.$emit('updateScore', 'reset')
    }

    if (this.question == null || this.question.answered) {
      this.nextQuestion()
    } else {
      this.$emit('updateBg', this.question.id, this.question.image)
    }
  },
  watch: {
    question: questionWatcher,
    preparedQuestion: preparedQuestionWatcher
  },
  data () {
    return {
      questionTimeoutCorrect: 2000,
      questionTimeoutIncorrect: 4000,
      questionTypes: {
        choice: {
          easy: [
            'guessTheTrial',
            'guessTheShrineFromQuest',
            'guessTheShrineFromLandmark',
            'guessTheShrine',
            'guessTheShrine'
          ],
          normal: [
            'guessTheMonk',
            'guessTheTrial',
            'guessTheShrineNoTrial',
            'guessTheShrine',
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
            'guessTheItem'
          ]
        },
        map: {
          easy: ['findTheShrine'],
          normal: ['findTheShrine'],
          hard: ['findTheShrine']
        },
        text: {
          easy: [], // too hard for easy
          normal: [], // too hard for normal
          hard: [
            'guessTheMonkText'
          ]
        }
      },
      answered: null,
      previousShrines: [],
      historyLimit: 10,
      timer: 0,
      correctSound: require('../assets/sounds/botw/correct.wav'),
      incorrectSound: require('../assets/sounds/botw/incorrect.wav'),
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
    randomShrine,
    monkNameURLSafe,
    answer,
    hasImages,
    DLC,
    defaultAfterText,
    answerKeypress,
    randomType,

    guessTheMonk () {
      const set = this._filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               (this.options.difficulty === 'hard' || o.trial.indexOf('Test of Strength') === -1) &&
               this.hasImages(o, ['interior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const merged = {
        Central: 'Ridgeland',
        Gerudo: 'Wasteland',
        Lake: 'Faron',
        Woodland: 'Hebra',
        Hateno: 'Dueling Peaks'
      }

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
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
        type: 'Guess the Shrine by Trial',
        choices: this._map(choices, o => o.monk),
        answer: choices.indexOf(shrine),
        title: `The trial <strong>${shrine.trial}</strong> is in which shrine?`,
        titleRepeat: `Remember this shrine? It contains the <strong>${shrine.trial}</strong> trial.`,
        id: shrine.id,
        shrine: shrine,
        image: 'interior',
        imageAnswered: 'title'
      }
    },
    guessTheMonkText () {
      const set = this._filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               o.trial.indexOf('Test of Strength') === -1 &&
               this.hasImages(o, ['interior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Type the Shrine Name by Trial',
        answer: shrine.monk,
        title: `What is the name of this shrine containing the <strong>${shrine.trial}</strong> trial?`,
        titleRepeat: `Remember which shrine contains the <strong>${shrine.trial}</strong> trial?`,
        image: 'exterior',
        imageAnswered: 'title',
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheTrial () {
      const set = this._filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const merged = {
        Akkala: 'Lanayru',
        Woodland: 'Hebra'
      }

      const choices = this._shuffle(this._concat(shrine, this._slice(this._uniqBy(this._shuffle(this._filter(this.shrines,
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
        type: 'Guess the Trial by Shrine Name',
        choices: this._map(choices, o => o.trial),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `The shrine <strong>${shrine.monk}</strong> has which trial for you?`,
        titleRepeat: `Do you remember which trial <strong>${shrine.monk}</strong> has in store for you?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrine () {
      const set = this._filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
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
        type: 'Guess Shrine + Trial by Region',
        choices: this._map(choices, o => `${o.monk}: ${o.trial}`),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
        shrine: shrine,
        id: shrine.id
      }
    },
    findTheShrine () {
      const set = this._filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title', 'interior']) && o.coords &&
              (this.options.difficulty !== 'easy' || o.trial.indexOf('Blessing') === -1) && // exclude Blessing on easy
              (this.options.difficulty !== 'easy' || o.trial.indexOf('Test of Strength') === -1) // exclude Blessing on easy
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Find the Shrine on a Map',
        answer: shrine.coords,
        image: this._sample(['interior', 'title']),
        imageAnswered: 'exterior',
        title: `This shrine is called <strong>${shrine.monk}: ${shrine.trial}</strong>`,
        titleRepeat: `This shrine is called <strong>${shrine.monk}: ${shrine.trial}</strong>`,
        afterText: `<strong>${shrine.monk}</strong> is here, in the <strong>${shrine.region}</strong> region`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineNoTrial () {
      const set = this._filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
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
        type: 'Guess Shrine by Region',
        choices: this._map(choices, o => `${o.monk}`),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineFromQuest () {
      const set = this._filter(this.shrines, o => {
        return o.quest &&
               this.hasImages(o, ['quest', 'title'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Quest',
        choices: this._map(choices, o => `${o.monk}: ${o.trial}`),
        answer: choices.indexOf(shrine),
        image: 'quest',
        imageAnswered: 'title',
        title: `Completing the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        titleRepeat: `Again, the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineFromLandmark () {
      const set = this._filter(this.shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Landmark',
        choices: this._map(choices, o => `${o.monk}: ${o.trial}`),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `<strong>${shrine.landmark}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${shrine.landmark}</strong> again. What's the shrine called?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineFromLandmarkHard () {
      const set = this._filter(this.shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Minor Landmark',
        choices: this._map(choices, o => `${o.monk}: ${o.trial}`),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `<strong>${(shrine.landmark || shrine.minor_landmark)}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${(shrine.landmark || shrine.minor_landmark)}</strong> again. What's the shrine called?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheLandmark () {
      const set = this._filter(this.shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Landmark by Shrine',
        choices: this._map(choices, o => `${o.landmark}`),
        answer: choices.indexOf(shrine),
        image: 'title',
        imageAnswered: 'exterior',
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheLandmarkHard () {
      const set = this._filter(this.shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Minor Landmark by Shrine',
        choices: this._map(choices, o => `${(o.landmark || o.minor_landmark)}`),
        answer: choices.indexOf(shrine),
        image: 'title',
        imageAnswered: 'exterior',
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheQuest () {
      const set = this._filter(this.shrines, o => {
        return o.quest &&
               this.hasImages(o, ['title', 'quest'])
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
        o => {
          return o.quest &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Quest by Shrine',
        choices: this._map(choices, o => `${o.quest}`),
        answer: choices.indexOf(shrine),
        image: 'title',
        imageAnswered: 'quest',
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        titleRepeat: `This one again, <strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheItem () {
      const set = this._filter(this.shrines, o => {
        return o.main_item &&
               this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.nextQuestion()
      const shrine = this.randomShrine(set)

      const choices = this._shuffle(this._concat(shrine, this._slice(this._shuffle(this._filter(this.shrines,
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
        type: 'Guess Item in the Shrine',
        choices: this._map(choices, o => `${o.main_item}`),
        answer: choices.indexOf(shrine),
        image: 'exterior',
        imageAnswered: 'title',
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
        titleRepeat: `Remind me, <strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
        shrine: shrine,
        id: shrine.id
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
    }
  },
  metaInfo: {
    title: 'BOTW Shrine Quiz',
    meta: [
      { name: 'description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },
      { property: 'og:title', content: 'BOTW Shrine Quiz :: Learn the Shrines' },
      { property: 'og:site_name', content: 'Learn the Shrines' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://learntheshrines.com/botw/' },
      { property: 'og:image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },
      { property: 'og:description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },

      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:site', content: 'https://learntheshrines.com/botw/' },
      { name: 'twitter:title', content: 'BOTW Shrine Quiz :: Learn the Shrines' },
      { name: 'twitter:description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },

      { name: 'twitter:creator', content: '@cobwoms' },
      { name: 'twitter:image:src', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },

      { itemprop: 'name', content: 'BOTW Shrine Quiz :: Learn the Shrines' },
      { itemprop: 'description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.' },
      { itemprop: 'image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') }
    ],
    link: [
      { rel: 'canonical', href: 'https://learntheshrines.com/botw/' }
    ]
  }
}
</script>

<style lang="scss" src="../styles/quiz.scss" />
