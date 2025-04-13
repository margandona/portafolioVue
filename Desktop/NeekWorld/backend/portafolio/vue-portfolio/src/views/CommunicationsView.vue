<template>
  <div class="communications-view">
    <NavbarComponent />
    <CommunicationsSection />
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import CommunicationsSection from '@/components/sections/CommunicationsSection.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'

export default {
  name: 'CommunicationsView',
  components: {
    NavbarComponent,
    CommunicationsSection,
    ScrollToTop
  }
}
</script>
