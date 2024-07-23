<template>
  <div id="app" class="container mt-5">
    <div class="botbody">
      <div class="botcontent card">
        <div id="botheader" class="card-header d-flex justify-content-between align-items-center">
          <h1 class="h3">ChatBot</h1>
          <button class="btn btn-secondary" @click="reset">
            <i class="fa fa-refresh"></i>
          </button>
        </div>
        <div id="message-section" class="card-body overflow-auto" style="max-height: 300px;">
          <div class="message bot">
            <span id="bot-response">{{ initialMessage }}</span>
          </div>
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
            <span>{{ message.text }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="quickbtns mb-3">
            <button class="btn btn-outline-secondary" @click="send('Check USN 📝')">Revisa 📝</button>
            <button class="btn btn-outline-secondary" @click="send('Report a Bug 🐞')">Reporte 🐞</button>
          </div>
          <div id="input-section" class="input-group">
            <input v-model="userInput" @keyup.enter="sendMessage" type="text" class="form-control" placeholder="Escribe un mensaje" autocomplete="on" autofocus>
            <button class="btn btn-primary" @click="sendMessage">
              <i class="fa fa-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userInput: '',
      messages: [],
      initialMessage: 'Hola, estoy acá para escucharte...',
      API_KEY: 'AIzaSyBw2Uiz-qj2VcDMYcdWeHxMow8LH3eYYIw',
    };
  },
  methods: {
    async getAIResponse(message) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5:generateMessage?key=${this.API_KEY}`;
        const payload = {
          prompt: {
            text: message,
          },
        };
        const response = await axios.post(url, payload);

        console.log('API Result:', response.data); // Añadir esta línea para ver la estructura de la respuesta

        if (!response.data || !response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].output || !response.data.candidates[0].output[0]) {
          console.error('Estructura de la respuesta de la API no esperada:', response.data);
          throw new Error('Respuesta inválida de la API');
        }

        return response.data.candidates[0].output[0].text;
      } catch (error) {
        console.error('Error fetching AI response:', error);
        return 'Lo siento, hubo un problema al procesar tu solicitud.';
      }
    },
    async sendMessage() {
      if (this.userInput.trim() === '') return;
      const input = this.userInput.trim();
      this.addMessage('user', input);
      this.userInput = '';
      const response = await this.getAIResponse(input);
      this.addMessage('bot', response);
    },
    addMessage(type, text) {
      this.messages.push({ type, text });
      this.$nextTick(() => {
        const messageSection = document.getElementById('message-section');
        messageSection.scrollTop = messageSection.scrollHeight;
      });
    },
    reset() {
      this.messages = [];
    },
    send(message) {
      this.userInput = message;
      this.sendMessage();
    },
    sendFeedback(feedback) {
      console.log(feedback);
    }
  }
};
</script>

<style>
/* Estilos CSS proporcionados */
.botbody {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.botcontent {
  width: 100%;
  max-width: 500px;
}

#message-section {
  border: 1px solid #e0e0e0;
}

.message {
  margin-bottom: 12px;
  font-family: 'Roboto', sans-serif;
}

.message.user {
  text-align: right;
}

.message.bot {
  text-align: left;
}

.quickbtns {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}
</style>
