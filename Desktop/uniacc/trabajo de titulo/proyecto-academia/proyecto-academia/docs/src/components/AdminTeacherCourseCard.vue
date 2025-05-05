<template>
    <div
      class="course-card"
      @click="$emit('showDetails', course)"
      role="button"
      tabindex="0"
      :aria-label="'Detalles del curso: ' + course.title"
    >
      <h2 class="course-title">{{ course.title }}</h2>
      <p class="course-description">{{ course.description }}</p>
      <small class="course-meta">
        Categoría: {{ course.category }} | Profesor: {{ course.teacher?.name || "Desconocido" }}
      </small>
      <div class="course-status" v-if="role === 'admin'">
        <span :class="['status-badge', course.active ? 'active' : 'inactive']">
          {{ course.active ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
      <div class="course-actions">
        <button
          class="btn btn-primary"
          v-if="canManageCourse"
          @click.stop="$emit('edit', course.id)"
          aria-label="Editar curso: + course.title"
        >
          Editar
        </button>
        <button
          class="btn btn-danger"
          v-if="canManageCourse"
          @click.stop="$emit('delete', course.id)"
          aria-label="Eliminar curso: + course.title"
        >
          Eliminar
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AdminTeacherCourseCard",
    props: {
      course: {
        type: Object,
        required: true,
      },
      role: {
        type: String,
        required: true, // 'admin' or 'teacher'
      },
      userId: {
        type: [Number, String],
        default: null,
      },
    },
    computed: {
      // Determina si el usuario puede administrar este curso
      canManageCourse() {
        // Los administradores pueden administrar todos los cursos
        if (this.role === "admin") {
          return true;
        }
        
        // Los profesores solo pueden administrar sus propios cursos
        if (this.role === "teacher") {
          return parseInt(this.course.teacher_id) === parseInt(this.userId) ||
                 this.course.teacher?.id === this.userId;
        }
        
        return false;
      },
    },
  };
  </script>
  
  <style scoped>
  /* General styles for the course card */
  .course-card {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    cursor: pointer;
  }
  
  .course-card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  .course-card:focus {
    outline: 2px solid #2e8b57;
    box-shadow: 0px 0px 8px rgba(46, 139, 87, 0.8);
  }
  
  /* Title styles */
  .course-title {
    font-size: 20px;
    color: #2a3b5f; /* Deep blue */
    margin-bottom: 10px;
    font-family: "Playfair Display", serif;
  }
  
  /* Description styles */
  .course-description {
    font-size: 14px;
    color: #6c757d; /* Gray */
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
    background-color: #2e8b57; /* Emerald green */
    color: #ffffff;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #3aa870; /* Darker emerald green */
  }
  
  .btn-danger {
    background-color: #dc3545; /* Red */
    color: #ffffff;
    border: none;
  }
  
  .btn-danger:hover {
    background-color: #b21f2d; /* Darker red */
  }
  
  .course-status {
    margin-bottom: 15px;
  }
  
  .status-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .status-badge.active {
    background-color: #28a745;
    color: white;
  }
  
  .status-badge.inactive {
    background-color: #dc3545;
    color: white;
  }
  </style>
