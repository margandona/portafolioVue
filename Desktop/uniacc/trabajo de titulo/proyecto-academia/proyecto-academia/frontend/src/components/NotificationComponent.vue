<template>
    <div>
      <button @click="showSuccessNotification">Mostrar Notificación de Éxito</button>
      <notification-component ref="notification" />
    </div>
  </template>
  
  <script>
  import NotificationComponent from "@/components/NotificationComponent.vue";
  
  export default {
    components: { NotificationComponent },
    methods: {
      showSuccessNotification() {
        this.$refs.notification.addNotification({
          title: "Éxito",
          message: "La acción se realizó correctamente.",
          type: "success",
        });
      },
    },
  };
  </script>
  