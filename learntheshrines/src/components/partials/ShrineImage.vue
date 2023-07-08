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
      if (this.image && !this.currentImage.includes(this.imageSrc(imageArray[0], imageArray[1]))) {
        this.shrineId = imageArray[0]
        this.variant = imageArray[1]
        this.updateImage(this.shrineId, this.variant)
      }
    }
  },
  computed: {
    soundOn () {
      return this.$parent.options.soundOn
    }
  },
  mounted () {
    const $el = this.$el
    $el.querySelectorAll('img').forEach(img => {
      img.remove()
    })
    // i'm not sure this condtion ever actually happens tbh
    if (this.image && this.currentImage !== this.imageSrc(this.image[0], this.image[1])) {
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
      mapOpenSound: '/sounds/totk/map-open.wav',
      mapCloseSound: '/sounds/totk/map-close.wav'
    }
  },
  methods: {
    imageSrc (shrineId, variant) {
      return `/images/${this.game}/${shrineId}-${variant}.jpg`
    },
    preloadImage (shrineId, variant) {
      const img = document.createElement('img')
      img.src = this.imageSrc(shrineId, variant)
    },
    updateImage (shrineId, variant) {
      const oldImages = []
      const newImage = new Image()

      if (!variant) {
        variant = this.default
      }

      if (variant !== 'map') {
        this.checkingMap = false
      }

      this.currentImage = this.imageSrc(shrineId, variant)
      newImage.src = this.currentImage
      if (this.alt) {
        newImage.alt = this.alt
        if (variant === 'map') {
          newImage.alt = this.alt + ' (Map)'
        }
      }
      this.$el.querySelectorAll('img').forEach(img => oldImages.push(img))

      this.currentImage = newImage.src
      this.$el.appendChild(newImage)

      if (newImage.complete) {
        // image is cached, proceed
        this.transitionToNewImg(newImage, oldImages)
      } else {
        // image needs to load first
        this.loading = true
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
    padding-bottom: 56.25%;
    border-radius: 8px;
    background: rgba(0, 0, 0, .6);
    box-shadow: 0 0 0 2px rgba(190,190,190,.2);
  }

  .shrine-image::after {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    content: '';
    pointer-events: none;
  }

  .shrine-image.alert-incorrect {
    box-shadow: 0 0 0 2px rgb(184, 92, 26);
  }

  .shrine-image.alert-correct {
    box-shadow: 0 0 0 2px rgb(86, 184, 26);
  }

  .shrine-image.alert-incorrect::after {
    box-shadow: inset 0 0 2px 8px rgba(184, 92, 26, .4);
  }

  .shrine-image.alert-correct::after {
    box-shadow: inset 0 0 2px 8px rgba(86, 184, 26, .4);
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
    background: no-repeat center url('../../assets/spinner.gif') #000;
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
    z-index: 9;
    overflow: hidden;
    text-decoration: none;
    display: inline-block;
    text-align: start;
    white-space: nowrap;
    margin: 16px;
    padding: 0 40px 0 0;
    line-height: 40px;
    width: 32px;
    height: 32px;
    box-shadow: none;
    border-radius: 0;
    background: no-repeat center right / 32px 32px;
    background-image: url('../../assets/objmap.png');
    font-weight: normal;
    vertical-align: top;
    transition: width .4s ease-out;
    direction:rtl;
  }

  .button--map:hover,
  .button--map:focus {
    box-shadow: none;
    background: no-repeat center right / 32px 32px;
    background-image: url('../../assets/objmap.png');
    animation: none;
  }

  .button--map:focus {
    width: 200px;
  }

  @media (pointer: fine) {
    .button--map:hover {
      width: 200px;
    }
  }

</style>
