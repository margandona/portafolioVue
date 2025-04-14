<template>
  <header class="header" id="home">
    <img src="@/assets/img/logo1.png" alt="Logo" ref="logoImage" :class="logoEffect" />
    <div class="header__logo" ref="logoText" :class="textEffect">MaKuaZ</div>
    <p class="header__text mt-3" id="intro-text" @click="applyRandomEffect">
      Hola, Que bueno que estas por acá...
      <br /><b>¿Te gusta el Web Design?</b>
      <br /><b>¿Te gusta la Programación Web?</b>
      <br /> haz clic sobre este texto.
    </p>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      logoEffect: '',
      textEffect: '',
      effects: [
        'effect-rotate', 
        'effect-scale', 
        'effect-shake', 
        'effect-color', 
        'effect-flip',
        'effect-bounce'
      ]
    };
  },
  methods: {
    applyRandomEffect() {
      // Decide randomly whether to apply effect to logo or text
      const targetLogo = Math.random() > 0.5;
      
      // Select a random effect
      const randomEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
      
      // Reset previous effects
      this.logoEffect = '';
      this.textEffect = '';
      
      // Apply new effect
      if (targetLogo) {
        this.logoEffect = randomEffect;
        
        // Reset the effect after animation completes
        setTimeout(() => {
          this.logoEffect = '';
        }, 1000);
      } else {
        this.textEffect = randomEffect;
        
        // Reset the effect after animation completes
        setTimeout(() => {
          this.textEffect = '';
        }, 1000);
      }
    }
  }
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

/* Animation effects */
.effect-rotate {
  animation: rotate 1s ease;
}

.effect-scale {
  animation: scale 1s ease;
}

.effect-shake {
  animation: shake 0.5s ease;
}

.effect-color {
  animation: colorChange 1s ease;
}

.effect-flip {
  animation: flip 1s ease;
}

.effect-bounce {
  animation: bounce 1s ease;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

@keyframes scale {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
}

@keyframes colorChange {
  0% { color: white; }
  50% { color: #FFD700; }
  100% { color: white; }
}

@keyframes flip {
  0% { transform: perspective(400px) rotateY(0); }
  50% { transform: perspective(400px) rotateY(180deg); }
  100% { transform: perspective(400px) rotateY(360deg); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}
</style>