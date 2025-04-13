<template>
  <div>
    <NavbarComponent />
    <AboutSection />
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'

export default {
  name: 'AboutView',
  components: {
    NavbarComponent,
    AboutSection,
    ScrollToTop
  }
}
</script>
