<template>
  <div class="playground-view">
    <NavbarComponent />
    <PlaygroundSection />
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import PlaygroundSection from '@/components/sections/PlaygroundSection.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'

export default {
  name: 'PlaygroundView',
  components: {
    NavbarComponent,
    PlaygroundSection,
    ScrollToTop
  }
}
</script>
