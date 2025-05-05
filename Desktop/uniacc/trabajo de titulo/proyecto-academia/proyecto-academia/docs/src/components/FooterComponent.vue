<template>
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          © {{ currentYear }} Academia Virtual. Todos los derechos reservados.
        </p>
        <ul class="footer-links">
          <li>
            <a href="/about" class="footer-link">Acerca de</a>
          </li>
          <li>
            <a
              href="https://virtual.neekworld.cl/moodle41/login/index.php"
              class="footer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Academia Virtual
            </a>
          </li>
          <li>
            <a href="/contact" class="footer-link">Contacto</a>
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
    background-color: #2a3b5f; /* Mismo color que el Navbar */
    color: #f5f5f5;
    padding: 20px 0;
    text-align: center;
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    position: relative;
    bottom: 0;
    width: 100%;
    box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
  }
  
  .footer-text {
    margin: 0;
    padding-bottom: 10px;
    color: #f5f5f5; /* Blanco */
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
    color: #ffa500; /* Color complementario */
    text-decoration: none;
  }
  
  .footer-link:hover {
    color: #ffffff; /* Blanco al pasar el mouse */
  }
  </style>
  