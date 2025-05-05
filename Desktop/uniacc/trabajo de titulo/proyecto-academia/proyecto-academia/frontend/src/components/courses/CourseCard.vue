<template>
  <v-card :to="detailLink" class="course-card" elevation="2" hover>
    <v-img
      :src="course.imageUrl || defaultImage"
      height="200"
      cover
      class="align-end"
    >
      <v-chip
        v-if="statusLabel"
        :color="statusLabel.color"
        class="ma-2 text-uppercase"
        size="small"
      >
        {{ statusLabel.text }}
      </v-chip>
    </v-img>
    
    <v-card-title class="text-h6">
      {{ course.title }}
    </v-card-title>
    
    <v-card-subtitle>
      <div class="d-flex align-center">
        <v-icon size="small" class="me-1">mdi-tag</v-icon>
        {{ course.category }}
      </div>
    </v-card-subtitle>
    
    <v-card-text>
      <div class="text-truncate-2 mb-3">
        {{ course.description }}
      </div>
      
      <div class="d-flex align-center mb-2">
        <v-icon size="small" class="me-1">mdi-account</v-icon>
        <span>{{ course.teacher?.name || 'Instructor' }}</span>
      </div>
      
      <div class="d-flex align-center">
        <v-icon size="small" class="me-1">mdi-calendar</v-icon>
        <span>{{ courseDuration }}</span>
      </div>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions>
      <div v-if="!course.isFree" class="d-flex align-center">
        <div v-if="course.hasActiveDiscount" class="d-flex flex-column">
          <span class="text-decoration-line-through text-caption text-grey">
            {{ formattedOriginalPrice }}
          </span>
          <span class="text-primary font-weight-bold text-h6">
            {{ formattedDiscountedPrice }}
          </span>
        </div>
        <span v-else class="text-primary font-weight-bold">
          {{ formattedOriginalPrice }}
        </span>
      </div>
      <div v-else class="text-success font-weight-bold">
        Gratis
      </div>
      
      <v-spacer></v-spacer>
      
      <v-btn
        v-if="showEnrollButton"
        color="primary"
        variant="text"
        @click.stop="$emit('enroll', course.id)"
      >
        {{ enrollButtonText }}
      </v-btn>
      
      <v-menu v-if="canEdit">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            variant="text"
            v-bind="props"
            @click.stop
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click.stop="$emit('edit', course.id)">
            <v-list-item-title>Editar</v-list-item-title>
          </v-list-item>
          <v-list-item @click.stop="$emit('delete', course.id)">
            <v-list-item-title>Eliminar</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script>
import { formatPrice, getCourseStatusLabel, formatCourseDuration, canEditCourse } from '@/utils/courseUtils';
import { mapState } from 'vuex';
import { coursePlaceholder } from '@/assets/placeholders';

export default {
  name: 'CourseCard',
  
  props: {
    course: {
      type: Object,
      required: true
    },
    showEnrollButton: {
      type: Boolean,
      default: true
    }
  },
  
  computed: {
    ...mapState('auth', ['user']),
    
    defaultImage() {
      return coursePlaceholder;
    },
    
    detailLink() {
      return `/courses/${this.course.id}`;
    },
    
    statusLabel() {
      return getCourseStatusLabel(this.course);
    },
    
    formattedOriginalPrice() {
      return formatPrice(this.course.totalPrice);
    },
    
    formattedDiscountedPrice() {
      return formatPrice(this.course.discountedTotalPrice);
    },
    
    courseDuration() {
      return formatCourseDuration(this.course);
    },
    
    canEdit() {
      return canEditCourse(this.course, this.user);
    },
    
    enrollButtonText() {
      if (this.course.isFree) return 'Inscribirse';
      return 'Comprar';
    }
  },
  
  emits: ['enroll', 'edit', 'delete']
}
</script>

<style scoped>
.course-card {
  transition: transform 0.2s;
}

.course-card:hover {
  transform: translateY(-5px);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
