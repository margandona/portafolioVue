<template>
    <transition name="fade">
      <div v-if="visible" class="snackbar" :class="typeClass" @click="closeSnackbar">
        <span>{{ message }}</span>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: "SnackbarComponent",
    props: {
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: "info", // Puede ser "info", "success", "error"
      },
      duration: {
        type: Number,
        default: 3000, // Tiempo en milisegundos antes de desaparecer
      },
    },
    data() {
      return {
        visible: false,
        timeout: null,
      };
    },
    computed: {
      typeClass() {
        switch (this.type) {
          case "success":
            return "snackbar-success";
          case "error":
            return "snackbar-error";
          default:
            return "snackbar-info";
        }
      },
    },
    watch: {
      message: {
        immediate: true,
        handler() {
          this.showSnackbar();
        },
      },
    },
    methods: {
      showSnackbar() {
        this.visible = true;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.visible = false;
        }, this.duration);
      },
      closeSnackbar() {
        this.visible = false;
        clearTimeout(this.timeout);
      },
    },
    beforeUnmount() {
      // Limpiar el temporizador antes de desmontar
      clearTimeout(this.timeout);
    },
  };
  </script>
  
  <style scoped>
  .snackbar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 20px;
    border-radius: 8px;
    color: #fff;
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    animation: fadeIn 0.3s ease-in-out;
    z-index: 1000;
  }
  
  .snackbar-info {
    background-color: #2196f3; /* Azul */
  }
  
  .snackbar-success {
    background-color: #4caf50; /* Verde */
  }
  
  .snackbar-error {
    background-color: #f44336; /* Rojo */
  }
  
  /* Animación de entrada */
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
  