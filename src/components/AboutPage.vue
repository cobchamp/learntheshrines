<template>
  <main id="about" class="one-col">
    <MainContainer>
      <img src="../assets/logo-learntheshrines-white.png" alt="Learn the Shrines" />
      <p>Learn the Shrines is a learning resource developed for the <strong>The Legend of Zelda: Breath of the Wild</strong> and <strong>The Legend of Zelda: Tears fo the Kingdom</strong> speedrunning communities. The purpose is to help newcomers and fans of the games to learn the names, locations, and associated shrine quests for all the shrines of Hyrule using flashcards and multiple choice. It's not essential to learn the names of the shrines in order to speedrun the games, but it helps in conversation with other people in the community.</p>

      <p>I created it because I was constantly having to look up names of shrines when they were mentioned on streams, and in chats. I wanted to practice some web development stuff, and this seemed like a good excercise that could help me learn and help others learn too.</p>

      <p>If you have any ideas for additional features to Learn the Shrines, found some mistakes, or just want to say "hi"; You can DM me (cob woms) in the <a href="https://discord.gg/rF4XeFC">BoTW Speedrunning Discord</a> or just add me at <strong>@cobwoms</strong>.</p>

      <hr />

      <p><em><strong>Spoiler disclaimer:</strong> The information and images in this app contain massive spoilers for the games, possible shrine solutions, and locations of things that are way more fun finding on you own. If you havn't yet completed the games and found all shrines yourself, please don't spoil it for yourself!</em></p>
    </MainContainer>
  </main>
</template>
<script>

export default {
  name: 'AboutPage',
  mounted () {
    this.$emit('updateBg', 'random')
  },
  computed: {
    options () {
      return this.$parent.options
    }
  },
  data () {
    return {
    }
  },
  metaInfo: {
    title: 'About',
    meta: [
      { name: 'description', content: 'The Legend of Zelda: Tears of the Kingdom and Breath of the Wild shrine quiz for the Speedrunning communities.' },
      { property: 'og:title', content: 'Learn the Shrines' },
      { property: 'og:site_name', content: 'Learn the Shrines' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://learntheshrines.com/about' },
      { property: 'og:image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },
      { property: 'og:description', content: 'The Legend of Zelda: Tears of the Kingdom and Breath of the Wild shrine quiz for the Speedrunning communities' },

      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:site', content: 'https://learntheshrines.com/about' },
      { name: 'twitter:title', content: 'Learn the Shrines' },
      { name: 'twitter:description', content: 'The Legend of Zelda: Tears of the Kingdom and Breath of the Wild shrine quiz for the Speedrunning communities' },

      { name: 'twitter:creator', content: '@cobwoms' },
      { name: 'twitter:image:src', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') },

      { itemprop: 'name', content: 'Learn the Shrines' },
      { itemprop: 'description', content: 'The Legend of Zelda: Tears of the Kingdom and Breath of the Wild shrine quiz for the Speedrunning communities' },
      { itemprop: 'image', content: 'https://learntheshrines.com' + require('../assets/share-image.jpg') }
    ],
    link: [
      { rel: 'canonical', href: 'https://learntheshrines.com/about' }
    ]
  }
}
</script>

<style>
#about {
  line-height: 1.4;
}

#about a {
  color: #ff7a00;
  font-weight: bold;
  font-style: normal;
}

#about img {
  display: block;
  margin: 0 auto;
}
</style>
