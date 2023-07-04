<template>
  <div class="quiz-choices">
    <h3>Choices:</h3>
    <ol class="choices">
      <li v-for="(choice, index) in choices" class="choice" :key="index" :class="{correct: answered !== null && index === correct, answered: index === answered}" >
        <span class="abc">{{ abc[index] }}</span>
        <button @click="answer(index)" :disabled="answered !== null" v-html="choice" ref="choice"></button>
      </li>
    </ol>
  </div>
</template>
<script>

export default {
  name: 'QuizChoices',
  props: ['choices', 'correct'],
  mounted () {
    document.addEventListener('keypress', this.answerKeypress)
  },
  beforeDestroy () {
    document.removeEventListener('keypress', this.answerKeypress)
  },
  watch: {
    choices () {
      this.answered = null
    }
  },
  data () {
    return {
      answered: null,
      abc: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    }
  },
  methods: {
    answer (index) {
      if (index < this.choices.length) {
        this.answered = index
        this.$emit('answer', index)
      }
    },
    answerKeypress (e) {
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
    }
  }
}
</script>

<style>
  @keyframes radiateGlow {
    from {
      box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #f7e17b, inset 0 0 6px 4px #f7e17b;
    }
    to {
      box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
    }
  }

  .choice {
    display: grid;
    grid-template-columns: 42px 1fr;
  }

  .choice + .choice {
    margin-top: 12px;
  }

  .choice .abc {
    padding-top: 6px;
    font-size: 32px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .choice button {
    padding: 8px;
    width: 100%;
    border-radius: 6px;
    border: 0;
    background: rgba(0, 0, 0, .7);
    color: white;
    box-shadow: 0 0 4px #000, 0 0 0 2px rgba(190,190,190,.2);
    font-size: 20px;
    cursor: pointer;
  }

  .choice button:focus {
    outline: 0;
    box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
    animation: .5s linear 2s infinite alternate radiateGlow;
  }

  @media (pointer: fine) {
    .choice button:hover {
      outline: 0;
      box-shadow: 0 0 4px #f7e17b, 0 0 4px #000, inset 0 0 0 4px #edce1c, inset 0 0 6px 4px #f7e17b;
      animation: .5s linear 2s infinite alternate radiateGlow;
    }
  }

  .choice button:disabled {
    opacity: 1;
    background: rgba(0, 0, 0, .7);
    box-shadow: 0 0 4px #000, 0 0 0 2px rgba(190,190,190,.2);
    animation: none;
    cursor: default;
  }

  .choice.answered .abc {
    color: #B85C1A;
  }

  .choice.answered button {
    background: rgba(45, 22, 6, .7);
    box-shadow: 0 0 4px #000, 0 0 0 2px #B85C1A;
    color: #B85C1A;
  }

  .choice.correct .abc,
  .choice.correct.answered .abc {
    color: #56B81A;
  }

  .choice.correct button,
  .choice.correct.answered button {
    background: rgba(17, 36, 5, .7);
    box-shadow: 0 0 4px #000, 0 0 0 2px #56B81A;
    color: #56B81A;
  }

  .choices {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  @media (max-width: 1023px) {
    .choice button {
      padding: 8px 16px;
      font-size: 16px;
    }

    .choice {
      grid-template-columns: 1fr;
    }

    .choice .abc {
      display: none;
    }
  }
</style>
