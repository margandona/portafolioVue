<template>
  <div class="admin-dashboard">
    <v-container>
      <h1 class="text-h3 text-center mb-6">Panel de Administración</h1>
      
      <!-- Admin Navigation Cards -->
      <v-row>
        <v-col v-for="(item, index) in adminModules" :key="index" cols="12" sm="6" md="4">
          <v-card :to="item.to" hover height="100%">
            <v-card-title class="d-flex align-center">
              <v-avatar color="primary" class="me-3" size="48">
                <v-icon color="white" size="large">{{ item.icon }}</v-icon>
              </v-avatar>
              {{ item.title }}
            </v-card-title>
            <v-card-text>
              <p>{{ item.description }}</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" :to="item.to">
                Acceder
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      adminModules: [
        {
          title: 'Gestión de Usuarios',
          icon: 'mdi-account-group',
          description: 'Administra usuarios, roles y permisos de la plataforma.',
          to: '/admin/users'
        },
        {
          title: 'Gestión de Cursos',
          icon: 'mdi-book-multiple',
          description: 'Administra los cursos, categorías y contenido.',
          to: '/admin/courses'
        },
        {
          title: 'Ventas',
          icon: 'mdi-currency-usd',
          description: 'Gestiona las ventas, pagos y facturación.',
          to: '/admin/sales'
        },
        {
          title: 'Campañas',
          icon: 'mdi-tag-multiple',
          description: 'Crea y administra campañas de descuentos y promociones.',
          to: '/admin/campaigns'
        },
        {
          title: 'Reportes',
          icon: 'mdi-file-chart',
          description: 'Visualiza estadísticas y genera reportes.',
          to: '/admin/reports'
        },
        {
          title: 'Configuración',
          icon: 'mdi-cog',
          description: 'Configura los ajustes generales de la plataforma.',
          to: '/admin/settings'
        }
      ]
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  padding: 24px 0;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
}
</style>
