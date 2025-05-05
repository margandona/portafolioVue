<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="courses"
      :loading="loading"
      :loading-text="'Cargando cursos...'"
      :no-data-text="'No hay cursos para mostrar'"
      class="elevation-1"
    >
      <template v-slot:[`item.title`]="{ item }">
        <div class="d-flex align-center">
          <v-avatar size="36" class="mr-2" color="grey-lighten-3">
            <v-img v-if="item.imageUrl" :src="item.imageUrl" alt="Course image"></v-img>
            <v-icon v-else>mdi-book-education</v-icon>
          </v-avatar>
          <div>
            <div>{{ item.title }}</div>
            <div class="text-caption text-grey">{{ item.category }}</div>
          </div>
        </div>
      </template>
      
      <template v-slot:[`item.price`]="{ item }">
        <div v-if="item.isFree" class="text-success font-weight-bold">Gratis</div>
        <div v-else>
          <div v-if="item.hasActiveDiscount" class="d-flex align-center">
            <span class="text-success font-weight-bold">{{ formatPrice(item.discountedTotalPrice) }}</span>
            <span class="text-decoration-line-through text-caption text-grey ml-1">
              {{ formatPrice(item.totalPrice) }}
            </span>
          </div>
          <div v-else>
            {{ formatPrice(item.totalPrice) }}
          </div>
        </div>
      </template>
      
      <template v-slot:[`item.isPublished`]="{ item }">
        <v-chip
          :color="item.isPublished ? 'success' : 'grey'"
          size="small"
        >
          {{ item.isPublished ? 'Publicado' : 'Borrador' }}
        </v-chip>
      </template>
      
      <template v-slot:[`item.enrollmentCount`]="{ item }">
        {{ item.enrollmentCount || 0 }}
        <v-btn
          v-if="item.enrollmentCount > 0"
          size="x-small"
          variant="plain"
          icon
          :to="`/courses/${item.id}/students`"
          title="Ver estudiantes"
        >
          <v-icon>mdi-account-group</v-icon>
        </v-btn>
      </template>
      
      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            color="primary"
            variant="text"
            :to="`/courses/${item.id}`"
            title="Ver curso"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          
          <v-btn
            size="small"
            color="info"
            variant="text"
            @click="$emit('edit-course', item)"
            title="Editar curso"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                size="small"
                color="grey"
                variant="text"
                v-bind="props"
                title="Más acciones"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="togglePublishStatus(item)" :title="item.isPublished ? 'Despublicar' : 'Publicar'">
                <template v-slot:prepend>
                  <v-icon>{{ item.isPublished ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </template>
              </v-list-item>
              
              <v-list-item :to="`/courses/${item.id}/modules`" title="Gestionar contenido">
                <template v-slot:prepend>
                  <v-icon>mdi-folder-multiple</v-icon>
                </template>
              </v-list-item>
              
              <v-list-item :to="`/courses/${item.id}/students`" title="Ver estudiantes">
                <template v-slot:prepend>
                  <v-icon>mdi-account-group</v-icon>
                </template>
              </v-list-item>
              
              <v-list-item @click="$emit('show-discount', item)" title="Gestionar descuentos">
                <template v-slot:prepend>
                  <v-icon>mdi-tag-multiple</v-icon>
                </template>
              </v-list-item>

              <v-list-item @click="$emit('show-access', item)" title="Asignar acceso">
                <template v-slot:prepend>
                  <v-icon>mdi-account-key</v-icon>
                </template>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item @click="$emit('delete-course', item)" title="Eliminar curso" class="text-error">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'CourseManageTable',
  
  props: {
    courses: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['delete-course', 'toggle-publish', 'show-discount', 'show-access', 'edit-course'],
  
  data() {
    return {
      headers: [
        { title: 'Curso', key: 'title', sortable: true },
        { title: 'Precio', key: 'price', sortable: false },
        { title: 'Estado', key: 'isPublished', sortable: true },
        { title: 'Estudiantes', key: 'enrollmentCount', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
      ]
    };
  },
  
  methods: {
    formatPrice,
    
    togglePublishStatus(course) {
      this.$emit('toggle-publish', course);
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
