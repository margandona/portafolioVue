<template>
  <div id="app">
    <NavbarComponent />
    <main class="content">
      <router-view />
    </main>
    <FooterComponent />
    <Snackbar
      v-if="errorMessage"
      :message="errorMessage"
      :timeout="5000"
      @close="clearError"
    />
  </div>
</template>

<script>
import NavbarComponent from "@/components/NavbarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import Snackbar from "@/components/SnackbarComponent.vue";
import { mapState, mapMutations } from "vuex";

export default {
  name: "App",
  components: {
    NavbarComponent,
    FooterComponent,
    Snackbar,
  },
  computed: {
    ...mapState(["errorMessage"]),
  },
  methods: {
    ...mapMutations(["CLEAR_ERROR"]),
    clearError() {
      this.CLEAR_ERROR();
    },
  },
  mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/login");
    } else {
      // Podrías validar el token aquí
      console.log("Validando token...");
    }
  },
};
</script>

<style lang="scss">
/* Contenedor principal */
#app {
  font-family: "Roboto", Arial, sans-serif;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Navbar siempre visible */
#app > nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #ffffff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

/* Contenido principal */
.content {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
}

/* Snackbar */
.snackbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #323232;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

.snackbar[aria-hidden="true"] {
  display: none;
}

/* Router active links */
.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 10px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
