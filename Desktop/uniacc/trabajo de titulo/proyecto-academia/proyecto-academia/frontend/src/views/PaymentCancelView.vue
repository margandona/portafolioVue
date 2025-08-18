<template>
  <div class="payment-cancel-view">
    <h1>Pago Cancelado</h1>
    <p>Tu pago ha sido cancelado. Si fue un error, puedes volver a intentarlo desde el curso.</p>
    <router-link to="/courses" class="btn btn-primary">Volver a los cursos</router-link>
  </div>
</template>

<script>
export default {
  name: 'PaymentCancelView'
}
</script>

<style scoped>
.payment-cancel-view {
  max-width: 500px;
  margin: 60px auto;
  text-align: center;
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.btn {
  margin-top: 30px;
}
</style>
