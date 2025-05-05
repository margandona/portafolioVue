<template>
  <v-dialog v-model="dialogVisible" max-width="900px" persistent>
    <v-card>
      <v-card-title class="headline d-flex align-center">
        <div>Editar Curso</div>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text v-if="editedCourse">
        <v-form ref="form" v-model="isFormValid">
          <v-container>
            <v-row>
              <!-- Información básica -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedCourse.title"
                  label="Título del Curso"
                  :rules="[v => !!v || 'El título es obligatorio']"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedCourse.category"
                  :items="categoryOptions"
                  label="Categoría"
                  :rules="[v => !!v || 'La categoría es obligatoria']"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editedCourse.description"
                  label="Descripción del Curso"
                  :rules="[v => !!v || 'La descripción es obligatoria']"
                  rows="3"
                ></v-textarea>
              </v-col>
              
              <!-- Tipo de curso y precio -->
              <v-col cols="12" md="4">
                <v-switch
                  v-model="editedCourse.isFree"
                  label="Curso Gratuito"
                  color="primary"
                  @change="handleFreeChange"
                ></v-switch>
              </v-col>
              
              <v-col cols="12" md="4" v-if="!editedCourse.isFree">
                <v-text-field
                  v-model.number="editedCourse.netPrice"
                  label="Precio (sin IVA)"
                  type="number"
                  min="0"
                  prefix="$"
                  :rules="[
                    v => v !== null && v !== '' || 'El precio es obligatorio para cursos de pago',
                    v => v >= 0 || 'El precio debe ser mayor o igual a 0'
                  ]"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="4" v-if="!editedCourse.isFree">
                <v-text-field
                  v-model="editedCourse.sku"
                  label="SKU"
                  :rules="[v => !!v || 'El SKU es obligatorio para cursos de pago']"
                ></v-text-field>
              </v-col>
              
              <!-- Modalidad del curso -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedCourse.modality"
                  :items="modalityOptions"
                  item-title="text"
                  item-value="value"
                  label="Modalidad"
                  :rules="[v => !!v || 'La modalidad es obligatoria']"
                  @change="handleModalityChange"
                ></v-select>
              </v-col>
              
              <!-- Para cursos sincrónicos -->
              <template v-if="editedCourse.modality === 'synchronized'">
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="startDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="formattedStartDate"
                        label="Fecha de Inicio"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        :rules="[v => !!editedCourse.start_date || 'La fecha de inicio es obligatoria']"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editedCourse.start_date"
                      @change="startDateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="formattedEndDate"
                        label="Fecha de Término"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        :rules="[
                          v => !!editedCourse.end_date || 'La fecha de término es obligatoria',
                          v => !isEndDateBeforeStart || 'La fecha de término debe ser posterior a la fecha de inicio'
                        ]"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editedCourse.end_date"
                      @change="endDateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </template>
              
              <!-- Para cursos asíncronos -->
              <template v-else>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="editedCourse.duration_days"
                    label="Duración (días)"
                    type="number"
                    min="1"
                    :rules="[
                      v => !!v || 'La duración es obligatoria',
                      v => v > 0 || 'La duración debe ser mayor a 0'
                    ]"
                  ></v-text-field>
                </v-col>
              </template>
              
              <!-- Información adicional -->
              <v-col cols="12">
                <v-textarea
                  v-model="editedCourse.requirements"
                  label="Requisitos Previos"
                  rows="2"
                ></v-textarea>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editedCourse.objectives"
                  label="Objetivos del Curso"
                  rows="2"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="closeModal">
          Cancelar
        </v-btn>
        <v-btn 
          color="primary" 
          :loading="loading"
          :disabled="!isFormValid || loading"
          @click="saveCourse"
        >
          Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
import { formatDate } from '@/utils/dateUtils';

export default {
  name: 'CourseEditModal',
  
  props: {
    // Support both value and modelValue for backward compatibility
    value: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    course: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      dialogVisible: false,
      isFormValid: false,
      editedCourse: null,
      startDateMenu: false,
      endDateMenu: false,
      loading: false,
      categoryOptions: [
        'Desarrollo Web', 
        'Programación', 
        'Data Science', 
        'Diseño UX/UI', 
        'Marketing Digital', 
        'Business', 
        'Otros'
      ],
      modalityOptions: [
        { text: 'Sincronizado (con fechas de inicio y término)', value: 'synchronized' },
        { text: 'Asincrónico (a tu ritmo)', value: 'asynchronized' }
      ]
    };
  },
  
  computed: {
    formattedStartDate() {
      return this.editedCourse && this.editedCourse.start_date 
        ? formatDate(this.editedCourse.start_date) 
        : '';
    },
    
    formattedEndDate() {
      return this.editedCourse && this.editedCourse.end_date 
        ? formatDate(this.editedCourse.end_date) 
        : '';
    },
    
    isEndDateBeforeStart() {
      if (!this.editedCourse || !this.editedCourse.start_date || !this.editedCourse.end_date) {
        return false;
      }
      
      const startDate = new Date(this.editedCourse.start_date);
      const endDate = new Date(this.editedCourse.end_date);
      
      return endDate < startDate;
    }
  },
  
  watch: {
    value(val) {
      this.dialogVisible = val;
    },
    
    modelValue(val) {
      this.dialogVisible = val;
    },
    
    dialogVisible(val) {
      this.$emit('input', val);
      this.$emit('update:modelValue', val);
    },
    
    course: {
      handler(newCourse) {
        if (newCourse && Object.keys(newCourse).length > 0) {
          // Deep clone to avoid modifying the original object
          this.editedCourse = JSON.parse(JSON.stringify(newCourse));
        }
      },
      immediate: true,
      deep: true
    }
  },
  
  methods: {
    ...mapActions('courses', ['updateCourse']),
    
    handleFreeChange(isFree) {
      if (isFree) {
        this.editedCourse.netPrice = 0;
      }
    },
    
    handleModalityChange(modality) {
      if (modality === 'synchronized') {
        this.editedCourse.duration_days = null;
        
        // If start/end dates aren't set, initialize with defaults
        if (!this.editedCourse.start_date) {
          // Default to today
          this.editedCourse.start_date = new Date().toISOString().split('T')[0];
        }
        
        if (!this.editedCourse.end_date) {
          // Default to 30 days from now
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          this.editedCourse.end_date = endDate.toISOString().split('T')[0];
        }
      } else {
        this.editedCourse.start_date = null;
        this.editedCourse.end_date = null;
        
        // If duration_days isn't set, initialize with default
        if (!this.editedCourse.duration_days) {
          this.editedCourse.duration_days = 30; // Default to 30 days
        }
      }
    },
    
    closeModal() {
      this.dialogVisible = false;
      this.$emit('close');
    },
    
    async saveCourse() {
      if (!this.$refs.form.validate()) {
        return;
      }
      
      this.loading = true;
      
      try {
        // Format the data properly before sending to API
        let courseDataToUpdate;
        
        try {
          courseDataToUpdate = this.prepareDataForUpdate();
        } catch (validationError) {
          this.$emit('error', validationError.message);
          this.loading = false;
          return;
        }
        
        console.log("Sending course data to API:", courseDataToUpdate);
        
        await this.updateCourse({
          courseId: this.editedCourse.id,
          courseData: courseDataToUpdate
        });
        
        this.$emit('updated', this.editedCourse);
        this.$emit('success', 'Curso actualizado exitosamente');
        this.closeModal();
      } catch (error) {
        console.error('Error al actualizar el curso:', error);
        // Extract more detailed error message if available
        const errorMessage = error.response?.data?.details || 
                            error.response?.data?.message || 
                            error.message || 
                            'Error al actualizar el curso';
        this.$emit('error', errorMessage);
      } finally {
        this.loading = false;
      }
    },
    
    // New method to properly format data for the API
    prepareDataForUpdate() {
      // Start with a clean object instead of copying everything
      const courseData = {};
      
      // Only include essential fields that we want to update
      const fieldsToInclude = [
        'title', 'description', 'category', 'isFree', 'netPrice',
        'sku', 'modality', 'requirements', 'objectives'
      ];
      
      // Copy only the fields we need
      fieldsToInclude.forEach(field => {
        if (this.editedCourse[field] !== undefined) {
          courseData[field] = this.editedCourse[field];
        }
      });
      
      // Handle specific field types based on modality
      if (courseData.modality === 'synchronized') {
        // For synchronized courses, handle start and end dates
        if (this.editedCourse.start_date) {
          courseData.start_date = this.formatDateForAPI(this.editedCourse.start_date);
        }
        
        if (this.editedCourse.end_date) {
          courseData.end_date = this.formatDateForAPI(this.editedCourse.end_date);
        }
        
        // Explicitly set duration_days to null for synchronized courses
        courseData.duration_days = null;
      } else if (courseData.modality === 'asynchronized') {
        // For asynchronous courses, duration_days is REQUIRED
        if (this.editedCourse.duration_days !== undefined && this.editedCourse.duration_days !== null) {
          // Ensure it's a valid number
          const durationDays = parseInt(this.editedCourse.duration_days, 10);
          
          // Make sure it's a positive number
          if (isNaN(durationDays) || durationDays <= 0) {
            throw new Error('La duración debe ser un número mayor a 0');
          }
          
          courseData.duration_days = durationDays;
        } else {
          throw new Error('La duración en días es obligatoria para cursos asincrónicos');
        }
        
        // Explicitly set start and end dates to null for asynchronous courses
        courseData.start_date = null;
        courseData.end_date = null;
      }
      
      // Ensure numeric fields are actually numbers
      if (courseData.netPrice !== undefined) {
        courseData.netPrice = Number(courseData.netPrice);
      }
      
      // Add teacherId/instructor_id if it exists in the original course
      if (this.editedCourse.teacherId) {
        courseData.teacherId = this.editedCourse.teacherId;
      }
      
      if (this.editedCourse.instructor_id) {
        courseData.instructor_id = this.editedCourse.instructor_id;
      }
      
      // Provide detailed debugging
      console.log('Original course data:', this.editedCourse);
      console.log('Prepared course data:', courseData);
      console.log('Modality:', courseData.modality);
      console.log('Duration days:', courseData.duration_days);
      
      return courseData;
    },
    
    // Helper to format dates consistently for API
    formatDateForAPI(dateInput) {
      if (!dateInput) return null;
      
      let dateObj;
      
      if (typeof dateInput === 'string') {
        dateObj = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        dateObj = dateInput;
      } else {
        return null;
      }
      
      // Return ISO string which Firebase can handle
      return dateObj.toISOString();
    }
  }
};
</script>
