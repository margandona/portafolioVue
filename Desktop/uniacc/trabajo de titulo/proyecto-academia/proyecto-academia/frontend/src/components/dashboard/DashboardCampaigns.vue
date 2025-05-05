<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-tag-multiple</v-icon>
      Campañas Activas
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="campaign in campaigns" :key="campaign.id" :to="`/admin/campaigns/${campaign.id}`">
          <v-list-item-title>{{ campaign.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ campaign.discount }}% descuento
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-chip color="success" size="small">
              {{ formatDate(campaign.endDate) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
      
      <div v-if="campaigns.length === 0" class="text-center py-4 text-grey">
        No hay campañas activas.
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" to="/admin/campaigns">
        <v-icon start>mdi-tag-plus</v-icon>
        Gestionar Campañas
      </v-btn>
      <!-- New button for creating campaign -->
      <v-btn color="success" to="/admin/campaigns/create" class="ms-2">
        <v-icon start>mdi-plus</v-icon>
        Nueva Campaña
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardCampaigns',
  
  props: {
    campaigns: {
      type: Array,
      default: () => []
    },
    formatDate: {
      type: Function,
      required: true
    }
  }
}
</script>
