<template>
  <div class="shrine-image" :class="{'loading': loading}">
    <a class="button button--map" href="" v-if="map" @click.prevent="showMap" ref="map-button">{{ (checkingMap) ? 'Put Away Map' : 'Check Map' }}</a>
  </div>
</template>
<script>

export default {
  name: 'ShrineImage',
  props: ['game', 'image', 'map', 'alt'],
  watch: {
    image (imageArray) {
      this.checkingMap = false
      this.shrineId = imageArray[0]
      this.variant = imageArray[1]
      this.updateImage(this.shrineId, this.variant)
    }
  },
  computed: {
    soundOn () {
      return this.$parent.options.soundOn
    }
  },
  mounted () {
    let $el = this.$el
    $el.querySelectorAll('img').forEach(img => {
      img.remove()
    })
    // i'm not sure this condtion ever actually happens tbh
    if (this.image && this.currentImage !== `/static/images/${this.game}/${this.shrineId}-${this.variant}.jpg`) {
      this.shrineId = this.image[0]
      this.variant = this.image[1]
      this.updateImage(this.shrineId, this.variant)
    }
  },
  data () {
    return {
      loading: true,
      shrineId: null,
      variant: null,
      currentImage: null,
      checkingMap: false,
      default: 'exterior',
      fadeIn: 400,
      mapOpenSound: '/static/sounds/totk/map-open.wav',
      mapCloseSound: '/static/sounds/totk/map-close.wav'
    }
  },
  methods: {
    updateImage (shrineId, variant) {
      const oldImages = []
      const newImage = new Image()

      if (!variant) {
        variant = this.default
      }

      if (variant !== 'map') {
        this.checkingMap = false
      }

      newImage.src = `/static/images/${this.game}/${shrineId}-${variant}.jpg`
      if (this.alt) {
        newImage.alt = this.alt
        if (variant === 'map') {
          newImage.alt = this.alt + ' (Map)'
        }
      }
      this.$el.querySelectorAll('img').forEach(img => oldImages.push(img))

      this.currentImage = newImage.src
      this.loading = true
      this.$el.appendChild(newImage)

      if (newImage.complete) {
        // image is cached, proceed
        this.transitionToNewImg(newImage, oldImages)
      } else {
        // image needs to load first
        newImage.onload = () => this.transitionToNewImg(newImage, oldImages)
      }

      // image fails to load
      newImage.onerror = () => {
        this.loading = false
        oldImages.forEach((i) => i.remove())
      }
    },
    transitionToNewImg (newImage, oldImages) {
      this.loading = false
      newImage.classList.add('fade-in')
      setTimeout(() => oldImages.forEach((i) => i.remove()), this.fadeIn)
    },
    showMap () {
      if (this.checkingMap) {
        if (this.soundOn) {
          window.sound.play(this.mapCloseSound)
        }
        this.checkingMap = false
        this.updateImage(this.shrineId, this.variant)
      } else {
        if (this.soundOn) {
          window.sound.play(this.mapOpenSound)
        }
        this.checkingMap = true
        this.updateImage(this.shrineId, 'map')
      }

      this.$refs['map-button'].blur()
    }
  }
}
</script>

<style>
  .shrine-image {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; // 9:16;
    border-radius: 8px;
    background: rgba(0, 0, 0, .6);
    box-shadow: 0 0 0 2px rgba(190,190,190,.2);
  }

  .shrine-image.loading::before {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    content: '';
    opacity: .4;
    background: no-repeat center url('../assets/spinner.gif') #000;
  }

  .shrine-image:hover .button--map {
    opacity: 1;
  }

  .shrine-image img {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    transition: opacity 400ms ease-out;
  }

  .shrine-image .fade-in {
    opacity: 1;
  }

  .button--map {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    transition: opacity .4s ease-in-out;
    font-size: 14px;
    opacity: 0;
  }
</style>
