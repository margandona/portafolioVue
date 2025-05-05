<template>
  <v-app>
    <NavbarComponent />
    <v-main>
      <router-view />
    </v-main>
    <FooterComponent />
  </v-app>
</template>

<script>
import NavbarComponent from '@/components/NavbarComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    NavbarComponent,
    FooterComponent
  }
};
</script>

<style>
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;500;700&display=swap');

/* Import global styles */
@import './assets/styles/global.scss';

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.v-card {
  margin-bottom: 16px;
}
</style>
