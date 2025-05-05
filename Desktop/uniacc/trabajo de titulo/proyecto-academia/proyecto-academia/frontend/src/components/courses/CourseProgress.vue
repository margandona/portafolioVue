<template>
  <v-card class="course-progress">
    <v-card-title class="pb-0">Tu progreso</v-card-title>
    
    <v-card-text>
      <v-progress-linear
        :model-value="progress"
        color="primary"
        height="25"
        striped
      >
        <template v-slot:default="{ value }">
          <strong>{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>
      
      <div class="mt-4">
        <div v-if="completedLessons > 0" class="d-flex align-center">
          <v-icon color="success" size="small" class="me-2">mdi-check-circle</v-icon>
          <span>{{ completedLessons }} de {{ totalLessons }} lecciones completadas</span>
        </div>
        
        <div v-if="completedEvaluations.length > 0" class="d-flex align-center mt-2">
          <v-icon color="success" size="small" class="me-2">mdi-checkbox-marked-circle</v-icon>
          <span>{{ completedEvaluations.length }} de {{ totalEvaluations }} evaluaciones completadas</span>
        </div>
        
        <div v-if="enrollment.grade !== null" class="d-flex align-center mt-2">
          <v-icon :color="gradeColor" size="small" class="me-2">mdi-school</v-icon>
          <span>Calificación: {{ enrollment.grade }}/100</span>
        </div>
        
        <div v-if="enrollment.certificateIssued" class="d-flex align-center mt-2">
          <v-icon color="primary" size="small" class="me-2">mdi-certificate</v-icon>
          <span>Certificado emitido</span>
          <v-btn
            v-if="certificateUrl"
            variant="text"
            color="primary"
            size="small"
            class="ms-2"
            :href="certificateUrl"
            target="_blank"
          >
            Ver certificado
          </v-btn>
        </div>
      </div>
    </v-card-text>
    
    <v-divider v-if="showActions"></v-divider>
    
    <v-card-actions v-if="showActions">
      <v-btn
        variant="elevated"
        color="primary"
        :to="courseContentLink"
        block
      >
        {{ continueButtonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'CourseProgress',
  
  props: {
    enrollment: {
      type: Object,
      required: true
    },
    course: {
      type: Object,
      required: true
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    totalEvaluations: {
      type: Number,
      default: 0
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  
  computed: {
    progress() {
      return this.enrollment?.progress || 0;
    },
    
    completedEvaluations() {
      return this.enrollment?.completedEvaluations || [];
    },
    
    certificateUrl() {
      return this.enrollment?.certificateUrl || null;
    },
    
    courseContentLink() {
      return `/courses/${this.course.id}/content`;
    },
    
    continueButtonText() {
      if (this.progress === 0) return 'Comenzar curso';
      if (this.progress === 100) return 'Revisar contenido';
      return 'Continuar curso';
    },
    
    gradeColor() {
      const grade = this.enrollment?.grade;
      if (grade === null) return 'grey';
      
      if (grade >= 80) return 'success';
      if (grade >= 60) return 'warning';
      return 'error';
    }
  }
}
</script>
