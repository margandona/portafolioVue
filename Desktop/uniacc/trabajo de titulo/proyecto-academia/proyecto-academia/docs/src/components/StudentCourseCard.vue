<template>
    <div
      class="student-course-card"
      @click="$emit('showDetails', course)"
      role="button"
      tabindex="0"
      :aria-label="'Detalles del curso: ' + course.title"
    >
      <h2 class="course-title">{{ course.title }}</h2>
      <p class="course-description">{{ course.description }}</p>
      
      <!-- Etiquetas de curso -->
      <div class="course-tags">
        <span v-if="course.isFree" class="tag free">Gratis</span>
        <span 
          v-else-if="course.hasActiveDiscount" 
          class="tag discount"
        >
          {{ course.discount }}% Descuento
        </span>
      </div>
      
      <div class="course-info">
        <small class="course-meta">
          Categoría: {{ course.category }} | Profesor: {{ course.teacher?.name || "Desconocido" }}
        </small>
        
        <!-- Información de precio -->
        <div class="course-price" v-if="!course.isFree">
          <span v-if="course.hasActiveDiscount" class="original-price">${{ formatPrice(course.totalPrice) }}</span>
          <span class="current-price">${{ formatPrice(course.hasActiveDiscount ? course.discountedTotalPrice : course.totalPrice) }}</span>
        </div>
        <div class="course-price free-course" v-else>
          <span>Gratis</span>
        </div>
        
        <div class="enrollment-status" v-if="isEnrolled || course.isEnrolled">
          <span class="enrolled-badge">Inscrito</span>
        </div>
      </div>
  
      <!-- Botón para inscribirse (solo si no está inscrito) -->
      <div class="course-actions">
        <button
          v-if="!isEnrolled && !course.isEnrolled"
          class="btn btn-primary"
          @click.stop="$emit('enroll', course.id)"
          aria-label="Inscribirse en el curso"
        >
          {{ course.isFree ? 'Inscribirse Gratis' : 'Comprar Ahora' }}
        </button>
        <button 
          v-else 
          class="btn btn-secondary"
          @click.stop="$emit('showDetails', course)"
          aria-label="Ver detalles del curso"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StudentCourseCard",
    props: {
      course: {
        type: Object,
        required: true,
      },
      isEnrolled: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      formatPrice(price) {
        if (price === undefined || price === null) return '0';
        return Number(price).toLocaleString('es-CL');
      }
    }
  };
  </script>
  
  <style scoped>
  /* General styles for the course card */
  .student-course-card {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    cursor: pointer;
    position: relative;
  }
  
  .student-course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  .student-course-card:focus {
    outline: 2px solid #2e8b57;
    box-shadow: 0px 0px 8px rgba(46, 139, 87, 0.8);
  }
  
  /* Title styles */
  .course-title {
    font-size: 20px;
    color: #2a3b5f;
    margin-bottom: 10px;
    font-family: "Playfair Display", serif;
  }
  
  /* Description styles */
  .course-description {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 15px;
    font-family: "Roboto", sans-serif;
  }
  
  /* Meta information styles */
  .course-meta {
    font-size: 12px;
    color: #9a9a9a;
    margin-bottom: 15px;
    display: block;
    font-family: "Roboto", sans-serif;
  }
  
  /* Actions container */
  .course-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 15px;
  }
  
  /* Button styles */
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-family: "Roboto", sans-serif;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  
  .btn-primary {
    background-color: #2e8b57;
    color: #ffffff;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #3aa870;
  }
  
  .enrolled-tag {
    font-size: 14px;
    color: #28a745;
    font-weight: bold;
  }

  .course-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  
  .enrolled-badge {
    background-color: #28a745;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .btn-secondary {
    background-color: #6c757d;
    color: #ffffff;
    border: none;
  }
  
  .btn-secondary:hover {
    background-color: #5a6268;
  }
  
  /* Nuevos estilos para precios y descuentos */
  .course-price {
    font-family: "Roboto", sans-serif;
    display: flex;
    align-items: center;
    margin: 10px 0;
  }
  
  .original-price {
    text-decoration: line-through;
    color: #6c757d;
    margin-right: 10px;
    font-size: 14px;
  }
  
  .current-price {
    font-size: 18px;
    font-weight: bold;
    color: #2e8b57;
  }
  
  .free-course span {
    font-size: 16px;
    font-weight: bold;
    color: #28a745;
  }
  
  .course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
  }
  
  .tag {
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .tag.free {
    background-color: #28a745;
    color: white;
  }
  
  .tag.discount {
    background-color: #fd7e14;
    color: white;
  }
  </style>
