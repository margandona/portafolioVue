<template>
  <div class="navbar-brand">
    <router-link to="/" class="logo">
      <img src="@/assets/logo.png" alt="Academia Logo" class="logo-img">
      <span class="logo-text">NeekWorld</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NavbarBrand'
}
</script>

<style scoped>
.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #2A3B5F;
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-family: "Playfair Display", serif;
  font-size: 22px;
  font-weight: 700;
}
</style>
