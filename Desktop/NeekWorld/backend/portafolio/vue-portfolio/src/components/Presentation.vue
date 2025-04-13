<template>
  <section class="presentation" id="presentation">
    <div class="presentation__text">
      <h1>Soy Marcos Argandoña</h1>
      <p>
        Conocido como Makuaz, un creativo, reflexivo y emprendedor desarrollador web y 
        diseñador UX. Con una combinación única de habilidades técnicas y humanistas, 
        me especializo en crear experiencias de usuario memorables y soluciones 
        front-end innovadoras.
      </p>
      <p>
        <router-link to="/work" class="presentation__link">Mira Mi Trabajo</router-link> |
        <a href="@/assets/documents/curriculum.pdf" class="presentation__link" target="_blank">Descarga mi Currículum</a> |
        <router-link to="/playground" class="presentation__link">¿Quieres Jugar?</router-link> |
        <router-link to="/educacion" class="presentation__link">Contribución en Educación</router-link>
      </p>
    </div>

    <div class="presentation__image-container" id="rrss">
      <img src="@/assets/img/img.jpg" alt="Marcos Argandoña" class="presentation__image">
      <div class="presentation__links">
        <a href="https://www.youtube.com/channel/UCCh9xE8c6_olI22wB2Y8mWA" data-toggle="tooltip" title="Youtube"><i class="fab fa-youtube"></i></a>
        <a href="https://www.tiktok.com/@makuaz.dev" data-toggle="tooltip" title="Tik-Tok"><i class="fab fa-tiktok"></i></a>
        <a href="https://linkedin.com/in/marcos-argandoña-ugarte-09731a37/" data-toggle="tooltip" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a href="https://discord.gg/Pj6PHM7Xte" data-toggle="tooltip" title="Discord"><i class="fab fa-discord"></i></a>
        <a href="mailto:makuaz@makuaz.cl" data-toggle="tooltip" title="Email"><i class="fas fa-envelope"></i></a>
        <a href="https://github.com/margandona" data-toggle="tooltip" title="GitHub"><i class="fab fa-github"></i></a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProfilePresentation',
};
</script>

<style scoped>
.presentation {
  display: flex;
  flex-wrap: wrap;
  padding: 50px;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
}

.presentation__text,
.presentation__image-container {
  flex: 1;
  margin: 10px;
  min-width: 300px;
}

.presentation__text h1 {
  font-size: 3rem;
}

.presentation__text p {
  font-size: 1.2rem;
}

.presentation__links {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.presentation__links a {
  color: white;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.presentation__links a:hover {
  color: #ddd;
}

.presentation__image {
  max-width: 200px;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
}

.presentation__link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.presentation__link:hover {
  color: #ddd;
}
</style>