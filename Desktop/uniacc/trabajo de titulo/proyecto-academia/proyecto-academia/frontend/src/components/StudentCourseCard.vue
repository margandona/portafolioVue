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
      <small class="course-meta">
        Categoría: {{ course.category }} | Profesor: {{ course.teacher?.name || "Desconocido" }}
      </small>
  
      <!-- Botón para inscribirse -->
      <div class="course-actions">
        <button
          v-if="!isEnrolled"
          class="btn btn-primary"
          @click.stop="$emit('enroll', course.id)"
          aria-label="Inscribirse al curso"
        >
          Inscribirse
        </button>
        <span v-else class="enrolled-tag" aria-label="Ya inscrito">
          Inscrito
        </span>
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
  </style>
  