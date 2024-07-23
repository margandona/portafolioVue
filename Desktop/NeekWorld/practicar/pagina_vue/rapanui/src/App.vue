<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar__brand navbar-brand" href="#">Desarrollo Web</a>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar__list navbar-nav ml-auto">
          <li class="navbar__item nav-item"><a class="navbar__link nav-link" href="#">Inicio</a></li>
          <li class="navbar__item nav-item"><a class="navbar__link nav-link" href="#">Proyectos</a></li>
          <li class="navbar__item nav-item"><a class="navbar__link nav-link" href="#">Servicios</a></li>
          <li class="navbar__item nav-item"><a class="navbar__link nav-link" href="#">Contacto</a></li>
        </ul>
      </div>
    </nav>

    <div id="heroCarousel" class="hero-carousel carousel slide" data-ride="carousel">
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="https://via.placeholder.com/1920x600" class="d-block w-100" alt="Slide 1">
          <div class="carousel-caption d-none d-md-block">
            <h5>Soluciones de Desarrollo Web</h5>
            <p>Consultoría, Capacitación y Automatizaciones</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="https://via.placeholder.com/1920x600" class="d-block w-100" alt="Slide 2">
          <div class="carousel-caption d-none d-md-block">
            <h5>Metodologías Modernas</h5>
            <p>CSS BEM, Bootstrap, Google Fonts, Font Awesome</p>
          </div>
        </div>
      </div>
      <a class="carousel-control-prev" href="#heroCarousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Anterior</span>
      </a>
      <a class="carousel-control-next" href="#heroCarousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Siguiente</span>
      </a>
    </div>

    <section class="projects container my-5">
      <h2 class="projects__title text-center">Nuestros Proyectos</h2>
      <div class="projects__grid row">
        <div class="projects__item col-md-4" v-for="project in projects" :key="project.id">
          <div class="projects__card card">
            <img :src="project.image" class="projects__img card-img-top" :alt="`Project ${project.id}`">
            <div class="projects__body card-body">
              <h5 class="projects__name card-title">{{ project.name }}</h5>
              <p class="projects__description card-text">{{ project.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="contact container my-5">
      <h2 class="contact__title text-center">Contacto</h2>
      <div class="contact__info row">
        <div class="contact__details col-md-6">
          <h3 class="contact__subtitle">Información</h3>
          <p><i class="fas fa-map-marker-alt"></i> Dirección: Calle Falsa 123</p>
          <p><i class="fas fa-phone"></i> Teléfono: +34 123 456 789</p>
          <p><i class="fas fa-envelope"></i> Email: info@desarrolloweb.com</p>
        </div>
        <div class="contact__social col-md-6">
          <h3 class="contact__subtitle">Redes Sociales</h3>
          <p><a href="#"><i class="fab fa-facebook"></i> Facebook</a></p>
          <p><a href="#"><i class="fab fa-twitter"></i> Twitter</a></p>
          <p><a href="#"><i class="fab fa-linkedin"></i> LinkedIn</a></p>
          <p><a href="#"><i class="fab fa-instagram"></i> Instagram</a></p>
        </div>
      </div>
    </section>

    <footer class="footer bg-light text-center py-3">
      <p>&copy; 2024 Desarrollo Web y Automatizaciones. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      projects: [
        { id: 1, name: 'Proyecto 1', description: 'Descripción del proyecto 1.', image: 'https://via.placeholder.com/350' },
        { id: 2, name: 'Proyecto 2', description: 'Descripción del proyecto 2.', image: 'https://via.placeholder.com/350' },
        { id: 3, name: 'Proyecto 3', description: 'Descripción del proyecto 3.', image: 'https://via.placeholder.com/350' },
      ],
    };
  },
};
</script>

<style lang="scss">
@import "~@/assets/scss/vendors/bootstrap-vue/index";
@import url('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.navbar__brand {
  font-family: 'Roboto', sans-serif;
}

.navbar__item .nav-link {
  font-family: 'Roboto', sans-serif;
}

.projects__title {
  font-family: 'Roboto', sans-serif;
}

.projects__name {
  font-family: 'Roboto', sans-serif;
}

.contact__title, .contact__subtitle {
  font-family: 'Roboto', sans-serif;
}

.footer {
  font-family: 'Roboto', sans-serif;
}
</style>
