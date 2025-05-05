<template>
  <button 
    class="back-to-dashboard-btn" 
    @click="navigateToDashboard"
    aria-label="Volver al Dashboard"
  >
    <i class="fas fa-arrow-left"></i> Volver al Dashboard
  </button>
</template>

<script>
export default {
  name: "BackToDashboardButton",
  methods: {
    navigateToDashboard() {
      this.$router.push('/dashboard');
    }
  }
};
</script>

<style scoped>
.back-to-dashboard-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  margin: 10px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Roboto", sans-serif;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.back-to-dashboard-btn:hover {
  background-color: #5a6268;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.back-to-dashboard-btn i {
  font-size: 12px;
}

.back-to-dashboard-btn:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
</style>
