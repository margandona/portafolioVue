<template>
  <div class="work-view">
    <NavbarComponent />
    <AccessibilitySection />
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import AccessibilitySection from '@/components/sections/AccessibilitySection.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'

export default {
  name: 'WorkView',
  components: {
    NavbarComponent,
    AccessibilitySection,
    ScrollToTop
  }
}
</script>
