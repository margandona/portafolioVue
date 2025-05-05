<template>
  <div class="contact">
    <h1>Contacto</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Contáctanos</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Nombre"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  required
                ></v-text-field>

                <v-textarea
                  v-model="message"
                  :rules="messageRules"
                  label="Mensaje"
                  required
                ></v-textarea>

                <v-btn
                  color="primary"
                  class="mr-4"
                  @click="submit"
                  :disabled="!valid"
                >
                  Enviar
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Información de contacto</v-card-title>
            <v-card-text>
              <p>
                <v-icon>mdi-email</v-icon> 
                <strong>Email:</strong> contacto@academia.com
              </p>
              <p>
                <v-icon>mdi-phone</v-icon> 
                <strong>Teléfono:</strong> +56 2 1234 5678
              </p>
              <p>
                <v-icon>mdi-map-marker</v-icon> 
                <strong>Dirección:</strong> Avenida Ejemplo 123, Santiago, Chile
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ContactView',
  data: () => ({
    valid: true,
    name: '',
    nameRules: [
      v => !!v || 'Nombre es requerido',
      v => (v && v.length >= 2) || 'El nombre debe tener al menos 2 caracteres'
    ],
    email: '',
    emailRules: [
      v => !!v || 'E-mail es requerido',
      v => /.+@.+\..+/.test(v) || 'E-mail debe ser válido'
    ],
    message: '',
    messageRules: [
      v => !!v || 'Mensaje es requerido',
      v => (v && v.length >= 10) || 'El mensaje debe tener al menos 10 caracteres'
    ]
  }),

  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        // Submit form logic here
        alert('Gracias por tu mensaje. Te contactaremos pronto.');
        this.$refs.form.reset();
      }
    }
  }
}
</script>

<style scoped>
.contact {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 30px;
  text-align: center;
}
</style>
