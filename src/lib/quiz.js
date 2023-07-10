export function randomType (enabledTypes) {
  const random = this._random(1, 10)
  const choiceEnabled = enabledTypes.includes('choice')
  const mapEnabled = enabledTypes.includes('map')
  const textEnabled = enabledTypes.includes('text')

  if ((random > 9 && textEnabled) || (!mapEnabled && !choiceEnabled)) {
    return 'text'
  } else if ((random > 7 && mapEnabled) || !choiceEnabled) {
    return 'map'
  } else {
    return 'choice'
  }
}

export function newQuestion () {
  // select a quiz type
  const randomType = this.randomType(this.options.questionTypes)
  const questionTypes = this.questionTypes[randomType][this.options.difficulty]
  const randomQuestionType = this._sample(questionTypes)

  if (!randomQuestionType) {
    this.$alert('There was an error and no question could be selected').then(() => {
      // set default options
      this.$emit('updateOptions', {
        game: 'totk',
        soundOn: true,
        advancedOptions: false,
        includeDLC: false,
        fastMode: true,
        difficulty: 'normal',
        chooseFrom: 4,
        questionTypes: ['choice', 'map']
      })
      this.$router.push('/')
    })
    return
  }

  this.answered = null
  this.correct = null
  return this[randomQuestionType]()
}

export function nextQuestion () {
  document.removeEventListener('keypress', this.answerKeypress)
  if (!this.preparedQuestion) {
    this.$emit('updateQuestion', this.newQuestion())
    this.preparedQuestion = this.newQuestion()
  } else {
    this.$emit('updateQuestion', this.preparedQuestion)
    this.preparedQuestion = this.newQuestion()
  }
}

export function hasImages (shrine, images) {
  if (!shrine.missing_images) {
    return true
  }
  for (let i = 0; i < images.length; i++) {
    if (shrine.missing_images.indexOf(images[i]) >= 0) {
      return false
    }
  }
  return true
}

export function randomShrine (shrines) {
  const vm = this
  const filteredShrines = this._filter(shrines, o => {
    // exclude the current shrine as well, for when preparedQuestion is created
    if (o.id === this.question.id) {
      return false
    }
    return vm.previousShrines.slice(vm.previousShrines.length - vm.historyLimit).indexOf(o.id) === -1
  })
  return this._sample(filteredShrines)
}

export function lightrootify (name) {
  let lr = name.split('').reverse().join('').toLowerCase()
  lr = lr[0].toUpperCase() + lr.slice(1)
  return lr
}

export function defaultAfterText (theAnswer, isCorrect) {
  if (isCorrect) {
    return 'It\'s <strong>' + theAnswer + '</strong>'
  } else {
    return 'The correct answer is <strong>' + theAnswer + '</strong>'
  }
}

export function zonaiNameURLSafe (name) {
  return name.toLowerCase()
}

export function monkNameURLSafe (name) {
  return name.toLowerCase().replace(' ', '-').replace('\'', '')
}

export function answer (response) {
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

  const answeredQuestion = this.question
  answeredQuestion.answered = true
  this.$emit('updateQuestion', answeredQuestion)

  if (this.options.fastMode) {
    const currentPath = this.$route.path
    const timerEnds = (response === this.question.answer ? this.questionTimeoutCorrect : this.questionTimeoutIncorrect)
    const interval = window.setInterval(() => {
      this.timer += 50
      if (this.timer > timerEnds) {
        this.timer = 0
        clearInterval(interval)
        if (this.$route.path === currentPath) { // prevents an error if the user navigates away during timer
          this.nextQuestion()
        }
      }
    }, 50)
  }
}

export function DLC (shrine) {
  if (!this.options.includeDLC) {
    return shrine.dlc !== true
  }
  return true
}

export function answerKeypress (e) {
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
        this.$router.push('/' + this.options.game + '-shrines/' + this.zonaiNameURLSafe(this.question.shrine.name) + '/')
      }
      break
    case 73: // i
      if (this.answered != null) {
        this.$router.push('/' + this.options.game + '-shrines/' + this.zonaiNameURLSafe(this.question.shrine.name) + '/')
      }
      break
    default:
  }
}

export function questionWatcher (to) {
  if (this.previousShrines.indexOf(to.id) > -1 && to.titleRepeat) {
    to.title = to.titleRepeat
  }
  this.previousShrines.push(to.id)

  if (this.$refs['shrine-image']) {
    if (to.map && to.imageAnswered !== 'map') {
      this.$refs['shrine-image'].preloadImage(to.id, 'map')
    }
    this.$refs['shrine-image'].preloadImage(to.id, to.imageAnswered)
  }

  this.$emit('updateBg', to.id, to.image)
}

export function preparedQuestionWatcher (to) {
  if (this.$refs['shrine-image']) {
    this.$refs['shrine-image'].preloadImage(to.id, to.image)
    this.$refs['shrine-image'].preloadImage(to.id, to.imageAnswered)
    if (to.map && to.imageAnswered !== 'map') {
      this.$refs['shrine-image'].preloadImage(to.id, 'map')
    }
  }
}
