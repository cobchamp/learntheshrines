<template>
  <div id="bg"></div>
</template>
<script>

import _ from 'lodash'

export default {
  name: 'BackgroundImage',
  props: ['game', 'random'],
  mounted () {
    const vm = this
    setTimeout(function () {
      if (!vm.timeout && vm.random) {
        vm.updateImage(vm.randomShrineId())
        vm.timeout = setInterval(vm.randomImage, vm.interval)
      }
    }, 5)
  },
  computed: {
    shrines () {
      return this.$parent.shrines[this.game]
    }
  },
  watch: {
    game () {
      this.updateImage(this.randomShrineId())
    },
    random (to) {
      if (to) {
        this.updateImage(this.randomShrineId())
        this.timeout = setInterval(this.randomImage, this.interval)
      } else {
        clearInterval(this.timeout)
      }
    }
  },
  data () {
    return {
      interval: 10000,
      timeout: null
    }
  },
  methods: {
    randomShrineId () {
      // gets a random shrine with an available 'exterior' image
      const availableShrines = _.filter(this.shrines, (s) => {
        return !s.missing_images || s.missing_images.indexOf('exterior') === -1
      })
      const randomShrine = availableShrines[Math.floor(Math.random() * availableShrines.length) - 1]
      return randomShrine ? randomShrine.id : null
    },
    randomImage () {
      this.updateImage(this.randomShrineId())
    },
    updateImage (shrineId, variant) {
      let oldBg = null
      let fadeIn = 2000
      let $el = this.$el

      if (!variant) {
        variant = 'exterior'
      }

      const newBg = new Image()
      newBg.src = `/static/images/${this.game}/${shrineId}-${variant}.jpg`
      $el.querySelectorAll('img').forEach(img => {
        oldBg = img
      })

      // image is cached, proceed
      if (newBg.complete) {
        $el.appendChild(newBg)
        setTimeout(function () {
          newBg.classList.add('fade-in')
        }, 10)
        setTimeout(function () {
          oldBg.remove()
        }, fadeIn)
      } else {
        // image needs to load first
        newBg.onload = function () {
          $el.appendChild(newBg)
          setTimeout(function () {
            newBg.classList.add('fade-in')
          }, 10)
          if (oldBg) {
            setTimeout(function () {
              oldBg.remove()
            }, fadeIn)
          }
        }
      }
    }
  }
}
</script>

<style>
  #bg {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    background: #000;
  }

  #bg::after {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    content: '';
    background: rgba(0,0,0,0.2);
  }

  #bg img {
    position: absolute;
    top: 0;
    left: 0;
    margin: -25px 0 0 -25px;
    width: calc(100% + 50px);
    height: calc(100% + 50px);
    object-fit: cover;
    object-position: center;
    filter: blur(12px);
    opacity: 0;
    transition: opacity 1500ms ease-out;
  }

  #bg .fade-in {
    opacity: 1;
  }
</style>
