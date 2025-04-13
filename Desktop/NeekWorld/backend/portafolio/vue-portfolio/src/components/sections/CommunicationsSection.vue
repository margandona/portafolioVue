<template>
  <section class="communications-section">
    <div class="container">
      <h2 class="section-title">Comunicaciones</h2>
      <p>
        Aquí puedes incluir información sobre las diferentes formas de comunicación que utilizas, 
        tus redes sociales, y cualquier otra información relevante que desees compartir.
      </p>
      <div class="social-links">
        <a href="https://www.youtube.com/channel/UCCh9xE8c6_olI22wB2Y8mWA" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-youtube"></i> YouTube
        </a>
        <a href="https://www.tiktok.com/@makuaz.dev" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-tiktok"></i> TikTok
        </a>
        <a href="https://www.linkedin.com/in/marcos-argandoña-ugarte-09731a37/" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-linkedin"></i> LinkedIn
        </a>
        <a href="https://discord.gg/Pj6PHM7Xte" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-discord"></i> Discord
        </a>
        <a href="mailto:makuaz@makuaz.cl">
          <i class="fas fa-envelope"></i> Email
        </a>
        <a href="https://github.com/margandona" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CommunicationsSection'
}
</script>

<style scoped>
.communications-section {
  padding: 50px 0;
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
  color: white;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.social-links a {
  color: white;
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #ddd;
}
</style>