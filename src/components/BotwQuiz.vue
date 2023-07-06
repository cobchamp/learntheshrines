<template>
  <main id="options">
    <MainContainer>
      <div class="quiz-question" v-if="question">
        <ShrineImage game="botw" :image="[question.id, answered === null ? question.image : question.imageAnswered]"></ShrineImage>

        <h1 class="question-text" v-if="answered === null"><span v-html="question.title"></span></h1>

        <template v-else>
          <h2 class="question-text after-text" :class="{'alert-correct': isCorrect, 'alert-incorrect': !isCorrect}">
            {{ isCorrect ? yeses[score.count % yeses.length] : nopes[score.count % nopes.length] }}
            <span v-html="question.afterText ? question.afterText : defaultAfterText(!question.choices ? question.answer : question.choices[question.answer], isCorrect)"></span>
          </h2>
        </template>

        <template v-if="answered !== null">
          <progress :class="{'correct': isCorrect, 'incorrect': !isCorrect}" :value="timer" :max="((!isCorrect) ? questionTimeoutIncorrect : questionTimeoutCorrect) - 100" v-if="options.fastMode"></progress>
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
import _ from 'lodash'
import QuizChoices from './QuizChoices.vue'
import QuizText from './QuizText.vue'
import QuizMap from './QuizMap.vue'
import ShrineImage from './ShrineImage.vue'
import QuizScore from './QuizScore.vue'

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
      return this.$parent.shrines['botw']
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
      let myOptions = this.options
      myOptions['game'] = 'botw'
      this.$emit('updateOptions', myOptions)
      this.$emit('updateScore', 'reset')
    }

    if (this.question == null || this.question.answered) {
      this.newQuestion()
    } else {
      this.$emit('updateBg', this.question.id, this.question.image)
    }
  },
  data () {
    return {
      questionTimeoutCorrect: 2000,
      questionTimeoutIncorrect: 4000,
      quizTypes: {
        easy: [
          'guessTheTrial',
          'guessTheShrineFromQuest',
          'guessTheShrineFromLandmark',
          'guessTheShrine',
          'guessTheShrine',
          'findTheShrine'
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
          'guessTheQuest',
          'findTheShrine'
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
          'guessTheMonkText',
          'findTheShrine'
        ],
        text: [
          'guessTheMonkText'
        ],
        map: [
          'findTheShrine'
        ]
      },
      answered: null,
      previousShrines: [],
      historyLimit: 10,
      timer: 0,
      correctSound: '/static/sounds/botw/correct.wav',
      incorrectSound: '/static/sounds/botw/incorrect.wav',
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
      document.removeEventListener('keypress', this.answerKeypress)
      const quizTypes = this.quizTypes[this.options.difficulty]
      const quiz = quizTypes[_.random(0, quizTypes.length - 1)]
      this.answered = null
      this.quiz = quiz
      this.$emit('updateQuestion', this[quiz]())

      if (this.previousShrines.indexOf(this.question.id) > -1 && this.question.titleRepeat) {
        this.question.title = this.question.titleRepeat
      }

      this.previousShrines.push(this.question.id)

      this.preloadImage(`/static/images/botw/${this.question.imageAnswered}.jpg`)

      this.$emit('updateBg', this.question.id, this.question.image)
    },
    nextQuestion () {
      this.newQuestion()
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
    monkNameURLSafe (name) {
      return name.toLowerCase().replace(' ', '-').replace('\'', '')
    },
    answer (response) {
      if ((this.question.choices && response > this.options.chooseFrom - 1) || this.answered != null) {
        return
      }

      window.scrollTo(0, 0)
      document.addEventListener('keypress', this.answerKeypress)

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
    defaultAfterText (theAnswer, isCorrect) {
      if (isCorrect) {
        return 'It\'s <strong>' + theAnswer + '</strong>'
      } else {
        return 'The correct answer is <strong>' + theAnswer + '</strong>'
      }
    },
    guessTheMonk () {
      const set = _.filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               (this.options.difficulty === 'hard' || o.trial.indexOf('Test of Strength') === -1) &&
               this.hasImages(o, ['interior', 'title']) &&
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

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
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
        choices: _.map(choices, o => o.monk),
        answer: _.indexOf(choices, shrine),
        title: `The trial <strong>${shrine.trial}</strong> is in which shrine?`,
        titleRepeat: `Remember this shrine? It contains the <strong>${shrine.trial}</strong> trial.`,
        id: shrine.id,
        shrine: shrine,
        image: 'interior',
        imageAnswered: 'title'
      }
    },
    guessTheMonkText () {
      const set = _.filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               o.trial.indexOf('Test of Strength') === -1 &&
               this.hasImages(o, ['interior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Type the Shrine Name by Trial',
        answer: shrine.monk,
        title: `What is the name of this shrine containing the <strong>${shrine.trial}</strong> trial?`,
        titleRepeat: `Remember which shrine contains the <strong>${shrine.trial}</strong> trial?`,
        image: `exterior`,
        imageAnswered: `title`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheTrial () {
      const set = _.filter(this.shrines, o => {
        return o.trial.indexOf(o.monk) === -1 &&
               this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const merged = {
        'Akkala': 'Lanayru',
        'Woodland': 'Hebra'
      }

      const choices = _.shuffle(_.concat(shrine, _.slice(_.uniqBy(_.shuffle(_.filter(this.shrines,
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
        choices: _.map(choices, o => o.trial),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `The shrine <strong>${shrine.monk}</strong> has which trial for you?`,
        titleRepeat: `Do you remember which trial <strong>${shrine.monk}</strong> has in store for you?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrine () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
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
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
        shrine: shrine,
        id: shrine.id
      }
    },
    findTheShrine () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) && o.coords
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      return {
        type: 'Find the Shrine on a Map',
        answer: shrine.coords,
        image: `title`,
        imageAnswered: `exterior`,
        title: `This shrine is called <strong>${shrine.monk}: ${shrine.trial}</strong>`,
        titleRepeat: `This shrine is called <strong>${shrine.monk}: ${shrine.trial}</strong>`,
        afterText: `<strong>${shrine.monk}</strong> is here, in the <strong>${shrine.region}</strong> region`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineNoTrial () {
      const set = _.filter(this.shrines, o => {
        return this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
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
        choices: _.map(choices, o => `${o.monk}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `This shrine is in the <strong>${shrine.region}</strong> region`,
        titleRepeat: `What was this shrine called again? It's in the <strong>${shrine.region}</strong> region`,
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
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `quest`,
        imageAnswered: `title`,
        title: `Completing the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        titleRepeat: `Again, the <strong>${shrine.quest}</strong> quest reveals which shrine?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineFromLandmark () {
      const set = _.filter(this.shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Landmark',
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${shrine.landmark}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${shrine.landmark}</strong> again. What's the shrine called?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheShrineFromLandmarkHard () {
      const set = _.filter(this.shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Shrine by Minor Landmark',
        choices: _.map(choices, o => `${o.monk}: ${o.trial}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${(shrine.landmark || shrine.minor_landmark)}</strong> is home to what shrine?`,
        titleRepeat: `I'm near <strong>${(shrine.landmark || shrine.minor_landmark)}</strong> again. What's the shrine called?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheLandmark () {
      const set = _.filter(this.shrines, o => {
        return o.landmark &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return o.landmark &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Landmark by Shrine',
        choices: _.map(choices, o => `${o.landmark}`),
        answer: _.indexOf(choices, shrine),
        image: `title`,
        imageAnswered: `exterior`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheLandmarkHard () {
      const set = _.filter(this.shrines, o => {
        return (o.landmark || o.minor_landmark) &&
               this.hasImages(o, ['exterior', 'title'])
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
        o => {
          return (o.landmark || o.minor_landmark) &&
                 o.id !== shrine.id
        }
      )), 0, this.options.chooseFrom - 1)))

      return {
        type: 'Guess Minor Landmark by Shrine',
        choices: _.map(choices, o => `${(o.landmark || o.minor_landmark)}`),
        answer: _.indexOf(choices, shrine),
        image: `title`,
        imageAnswered: `exterior`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is near what landmark?`,
        titleRepeat: `Warping back to <strong>${shrine.monk}: ${shrine.trial}</strong> will put you at what landmark?`,
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
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        titleRepeat: `This one again, <strong>${shrine.monk}: ${shrine.trial}</strong> is the shrine for which quest?`,
        shrine: shrine,
        id: shrine.id
      }
    },
    guessTheItem () {
      const set = _.filter(this.shrines, o => {
        return o.main_item &&
               this.hasImages(o, ['exterior', 'title']) &&
               this.DLC(o)
      })

      if (set.length < 1) this.newQuestion()
      const shrine = this.randomShrine(set)

      const choices = _.shuffle(_.concat(shrine, _.slice(_.shuffle(_.filter(this.shrines,
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
        choices: _.map(choices, o => `${o.main_item}`),
        answer: _.indexOf(choices, shrine),
        image: `exterior`,
        imageAnswered: `title`,
        title: `<strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
        titleRepeat: `Remind me, <strong>${shrine.monk}: ${shrine.trial}</strong> contains which item?`,
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
            this.$router.push('/botw-shrines/' + this.monkNameURLSafe(this.question.shrine.monk))
          }
          break
        case 73: // i
          if (this.answered != null) {
            this.$router.push('/botw-shrines/' + this.monkNameURLSafe(this.question.shrine.monk))
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
    title: 'BOTW Shrine Quiz',
    meta: [
      {name: 'description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {property: 'og:title', content: 'BOTW Shrine Quiz :: Learn the Shrines'},
      {property: 'og:site_name', content: 'Learn the Shrines'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://learntheshrines.com/botw'},
      {property: 'og:image', content: 'https://learntheshrines.com/static/images/share-image.jpg'},
      {property: 'og:description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:site', content: 'https://learntheshrines.com/botw'},
      {name: 'twitter:title', content: 'BOTW Shrine Quiz :: Learn the Shrines'},
      {name: 'twitter:description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},

      {name: 'twitter:creator', content: '@cobwoms'},
      {name: 'twitter:image:src', content: 'https://learntheshrines.com/static/images/share-image.jpg'},

      {itemprop: 'name', content: 'BOTW Shrine Quiz :: Learn the Shrines'},
      {itemprop: 'description', content: 'How well do you know the shrines in BOTW? Learn the Shrines is an infinite stream of random questions. Play for as long as you want to improve over time.'},
      {itemprop: 'image', content: 'https://learntheshrines.com/static/images/share-image.jpg'}
    ],
    link: [
      {rel: 'canonical', href: 'https://learntheshrines.com/botw'}
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
