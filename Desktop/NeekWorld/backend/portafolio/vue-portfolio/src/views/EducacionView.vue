<template>
  <div class="educacion-view">
    <NavbarComponent />
    <EducationSection />
    <EducationModal />
    <FigmaPrototypeModal />
    <ScrollToTop />
  </div>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue'
import EducationSection from '@/components/sections/EducationSection.vue'
import EducationModal from '@/components/modals/EducationModal.vue'
import FigmaPrototypeModal from '@/components/modals/FigmaPrototypeModal.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'

export default {
  name: 'EducacionView',
  components: {
    NavbarComponent,
    EducationSection,
    EducationModal,
    FigmaPrototypeModal,
    ScrollToTop
  }
}
</script>
