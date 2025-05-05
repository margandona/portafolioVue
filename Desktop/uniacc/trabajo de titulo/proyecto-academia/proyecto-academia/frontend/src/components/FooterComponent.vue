<template>
  <footer class="footer">
    <div class="container">
      <p class="footer-text">
        © {{ currentYear }} Academia Virtual. Todos los derechos reservados.
      </p>
      <ul class="footer-links">
        <li>
          <router-link to="/about" class="footer-link">Acerca de</router-link>
        </li>
        <li>
          <a href="#" class="footer-link" target="_blank" rel="noopener noreferrer">
            Academia Virtual
          </a>
        </li>
        <li>
          <router-link to="/contact" class="footer-link">Contacto</router-link>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterComponent",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
.footer {
  background-color: #2a3b5f;
  color: #f5f5f5;
  padding: 20px 0;
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  width: 100%;
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
}

.footer-text {
  margin: 0;
  padding-bottom: 10px;
  color: #f5f5f5;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.footer-link {
  color: #ffa500;
  text-decoration: none;
}

.footer-link:hover {
  color: #ffffff;
}
</style>
