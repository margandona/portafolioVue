<template>
  <section class="playground-section" id="playground">
    <div class="container">
      <h2 class="section-title">Patio de Juegos</h2>
      <div class="row">
        <div class="col-md-6">
          <h3>De los Juguetes a los Videojuegos: Un Viaje de Transformación</h3>
          <p>"Desde mi infancia, los juguetes y la naturaleza fueron mis compañeros de juego, 
          alimentando mi imaginación y curiosidad. Sin embargo, fue el descubrimiento del mundo 
          de los videojuegos y la informática lo que verdaderamente transformó mi vida. 
          Los videojuegos no solo se convirtieron en una fuente de entretenimiento, sino en un 
          motor de inspiración y desarrollo personal. Con la ayuda de mi imaginación, 
          he logrado convertir esta pasión en un camino de creación y aprendizaje constante."</p>
          
          <h4 class="text-center">Descubre cómo los sueños de la infancia pueden convertirse en realidades sorprendentes</h4>
        </div>
        <div class="col-md-6">
          <div class="card">
            <img src="@/assets/img/poke.png" class="card-img-top" alt="Proyecto 1">
            <div class="card-body">
              <h5 class="card-title">Consumo de la PokeApi</h5>
              <p class="card-text">¿Quién no ha deseado tener una de esas maravillas del anime japonés Pokémon? Aunque existen muchos 
              artefactos similares, desarrollarlo utilizando mis habilidades e imaginación ha hecho de esto algo más que diversión.
                Este juego se inspira en un juguete de mi infancia, deseando que pudiera hacer todo lo que este juego ofrece. 
                Te invito a probar un prototipo que he creado, diseñado para ser lo más parecido a la realidad, usando tu celular 
                o computadora.
              </p>
              
              <button class="btn btn-primary" @click="showPokedexModal">Jugar con la Dex</button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <img src="@/assets/img/pet.png" class="card-img-top" alt="Proyecto 2">
            <div class="card-body">
              <h5 class="card-title">GoshtPetz: Juego de simulación de vida</h5>
              <p class="card-text">Un prototipo de juego basado en una historia original, 
              diseñado para ofrecerte momentos de imaginación y diversión sin límites.</p>
              <button class="btn btn-primary" @click="showDisponibilityModal">Prueba y diviertete</button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h3>Mi inspiración viene del mundo de los videojuegos</h3>
          <p>"En los diversos capítulos de la vida, enfrentamos un torbellino de emociones. 
          En esos momentos cruciales, los videojuegos se convierten en mi refugio: 
          una fuente de entretenimiento, relajación, motivación e inspiración."</p>
          
          <h4 class="text-center">Te invito a explorar, crear, pero sobretodo a reflexionar</h4>
        </div>
      </div>
      
      <div class="mt-5 text-center">
        <h1>Hagamos volar la imaginación</h1>
        <h2>Modelemos nuestros sueños</h2>
        <p>"En el vasto lienzo de la existencia, un gran proyecto emerge como un destello 
        de luz en la penumbra. Es la semilla de una idea, un susurro del alma que se eleva 
        desde las profundidades de nuestras frustraciones. Cada tropiezo, cada desafío, 
        es un pincel que da forma a nuestra visión. Y cuando volvemos a intentarlo, 
        cuando tejemos la esperanza con hilos de perseverancia, nuestros sueños se 
        materializan en colores vibrantes. Así, en el telar de la vida, tejemos la 
        epopeya de nuestras aspiraciones, y cada hilo entrelazado es un paso hacia la grandeza."</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PlaygroundSection',
  methods: {
    showDisponibilityModal() {
      this.$store.dispatch('modals/showDisponibilityModal');
    },
    showPokedexModal() {
      this.$store.dispatch('modals/showPokedexModal');
    }
  }
};
</script>

<style scoped>
.playground-section {
  padding: 50px 0;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.playground-section h3,
.playground-section h4 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.playground-section p {
  font-size: 1.2rem;
}
</style>