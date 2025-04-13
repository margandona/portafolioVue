<template>
  <div class="scroll-up" @click="scrollToTop">
    <i class="fas fa-arrow-up"></i>
  </div>
</template>

<script>
export default {
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
</script>

<style scoped>
.scroll-up {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(51, 51, 51, 0.8);
  color: white;
  padding: 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s, opacity 0.3s;
  opacity: 0.5;
  font-size: 24px;
}

.scroll-up:hover {
  background: rgba(51, 51, 51, 1);
  transform: translateX(-50%) scale(1.1);
  opacity: 1;
}

.scroll-up i {
  transition: transform 0.3s;
}

.scroll-up:hover i {
  transform: rotate(360deg);
}
</style>