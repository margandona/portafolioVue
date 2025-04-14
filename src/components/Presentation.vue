<template>
  <section class="presentation" id="presentation" :class="accessibilityClasses">
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
        <a href="mailto:m.argando@gmail.com" data-toggle="tooltip" title="Email"><i class="fas fa-envelope"></i></a>
        <a href="https://github.com/margandona" data-toggle="tooltip" title="GitHub"><i class="fab fa-github"></i></a>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ProfilePresentation',
  computed: {
    ...mapGetters('accessibility', [
      'isColorblindMode', 
      'isVisualRestMode', 
      'isNightMode'
    ]),
    accessibilityClasses() {
      return {
        'daltonismo': this.isColorblindMode,
        'descanso-visual': this.isVisualRestMode,
        'modo-nocturno': this.isNightMode
      }
    }
  }
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

/* Colores específicos para cada icono al hacer hover */
.presentation__links a:hover .fa-youtube {
  color: #FF0000; /* Rojo para YouTube */
}

.presentation__links a:hover .fa-tiktok {
  color: #00f2ea; /* Cian para TikTok */
}

.presentation__links a:hover .fa-linkedin {
  color: #0077B5; /* Azul para LinkedIn */
}

.presentation__links a:hover .fa-discord {
  color: #7289DA; /* Morado para Discord */
}

.presentation__links a:hover .fa-envelope {
  color: #D44638; /* Rojo para Email/Gmail */
}

.presentation__links a:hover .fa-github {
  color: #211F1F; /* Negro para GitHub */
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

/* Estilos para modos de accesibilidad dentro del componente */
.presentation.descanso-visual {
  background: linear-gradient(135deg, #f7f7f7, #e2e2e2) !important;
  color: #333 !important;
}

.presentation.modo-nocturno {
  background: linear-gradient(135deg, #333, #444) !important;
  color: #cccccc !important;
}

.presentation.modo-nocturno .presentation__link,
.presentation.modo-nocturno .presentation__links a {
  color: #cccccc !important;
}

.presentation.descanso-visual .presentation__link,
.presentation.descanso-visual .presentation__links a {
  color: #333 !important;
}
</style>