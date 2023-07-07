/* global _ */

export function newQuestion () {
  document.removeEventListener('keypress', this.answerKeypress)
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
}

export function nextQuestion () {
  this.newQuestion()
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
  const filteredShrines = _.filter(shrines, o => {
    return vm.previousShrines.slice(vm.previousShrines.length - vm.historyLimit).indexOf(o.id) === -1
  })
  return filteredShrines[_.random(0, filteredShrines.length - 1)]
}

export function preloadImage (image) {
  const img = document.createElement('img')
  img.src = image
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
}

export function DLC (shrine) {
  if (!this.options.includeDLC) {
    return shrine.dlc !== true
  }
  return true
}
