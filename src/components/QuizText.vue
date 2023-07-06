<template>
  <form class="quiz-text" @submit.prevent="answerText()">
    <h3>Type the answer below, and press enter:</h3>

    <input type="text" ref="text-input" class="text-input" v-model="textAnswer" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" :readonly="answered !== null" />
    <small class="text-input--help-text">Answers are evaluated for approximate spelling.</small>
    <hr />
    <button type="button" class="button skip-button" @click="answerText(true)" :disabled="answered !== null">
      I don't know
    </button>
  </form>
</template>

<script>
import leven from 'leven'

export default {
  name: 'QuizText',
  props: ['correct', 'answered', 'leven'],
  mounted () {
    this.textAnswer = ''
    this.$refs['text-input'].focus()
  },
  watch: {
    correct () {
      this.textAnswer = ''
    }
  },
  data () {
    return {
      textAnswer: ''
    }
  },
  methods: {
    answerText (skipped) {
      if (skipped) {
        this.$emit('answer', '')
        return
      }

      if (this.textAnswer.length < 2) {
        this.$alert('Please type something a little longer, or click "I don\'t know"')
        return
      }

      const evaluatedScore = leven(this.textAnswer.toLowerCase().replace(/!\W/g, ''), this.correct.toLowerCase().replace(/!\W/g, ''))
      if (evaluatedScore <= this.leven) {
        this.$emit('answer', this.correct)
      } else {
        this.$emit('answer', '')
      }
    }
  }
}
</script>

<style>
  .text-input {
    margin: 0 0 8px;
    padding: 16px 32px;
    display: block;
    width: 100%;
    background: rgba(0, 0, 0, .4);
    border: 0;
    border-bottom: solid 2px #fff;
    color: #fff;
    font-size: 20px;
    line-height: 1;
  }

  .text-input:focus {
    outline: 0;
    background: rgba(0, 0, 0, 1);
  }

  .text-input--help-text {
    display: block;
    text-align: center;
    font-style: italic;
    color: rgb(190,190,190);
  }
</style>
