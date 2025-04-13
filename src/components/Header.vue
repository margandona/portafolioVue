<template>
  <header class="header" id="home">
    <img src="@/assets/img/logo1.png" alt="Logo" />
    <div class="header__logo">MaKuaZ</div>
    <p class="header__text mt-3" id="intro-text">
      Hola, Que bueno que estas por acá...
      <br /><b>¿Te gusta el Web Design?</b>
      <br />Si tienes problemas visuales haz
      <br /> clic sobre este texto.
    </p>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
};
</script>

<style scoped>
.header {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #71b7e6, #9b59b6);
  color: white;
  text-align: center;
  transition: background-color 0.5s, color 0.5s;
}

.header__logo {
  font-size: 5rem;
  font-family: 'Lobster', cursive;
}

.header__text {
  font-size: 1.5rem;
  cursor: pointer;
}
</style>