<template>
  <div class="course-edit">
    <v-container>
      <!-- Loader -->
      <div v-if="isLoading" class="d-flex justify-center my-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>
      
      <!-- Error -->
      <v-alert v-else-if="error" type="error" class="mb-4">
        {{ error }}
        <div class="mt-2">
          <v-btn @click="fetchCourse" color="white" variant="text">Reintentar</v-btn>
        </div>
      </v-alert>
      
      <!-- Editor de curso -->
      <template v-else-if="course.id">
        <v-row>
          <v-col cols="12">
            <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 mb-3">Editar Curso</h1>
            <p class="text-subtitle-1 text-grey mb-6">
              Actualiza la información de tu curso
            </p>
          </v-col>
        </v-row>

        <v-form ref="courseForm" v-model="formValid" @submit.prevent="onUpdateCourse">
          <v-card>
            <v-tabs v-model="activeTab" show-arrows>
              <v-tab value="basic">Información Básica</v-tab>
              <v-tab value="content">Contenido</v-tab>
              <v-tab value="pricing">Precios y Disponibilidad</v-tab>
              <v-tab value="settings">Configuración</v-tab>
              <v-tab value="discount">Descuentos</v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="activeTab">
                <!-- Información básica -->
                <v-window-item value="basic">
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-text-field
                        v-model="form.title"
                        label="Título del curso"
                        :rules="[v => !!v || 'El título es obligatorio']"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-select
                        v-model="form.category"
                        label="Categoría"
                        :items="categories"
                        :rules="[v => !!v || 'La categoría es obligatoria']"
                        required
                      ></v-select>
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="form.description"
                        label="Descripción del curso"
                        rows="4"
                        :rules="[v => !!v || 'La descripción es obligatoria']"
                        required
                      ></v-textarea>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.modality"
                        label="Modalidad"
                        :items="[
                          { title: 'Asincrónico (A tu ritmo)', value: 'asynchronized' },
                          { title: 'Sincrónico (Con fechas)', value: 'synchronized' }
                        ]"
                        item-title="title"
                        item-value="value"
                        :rules="[v => !!v || 'La modalidad es obligatoria']"
                        @update:model-value="handleModalityChange"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.level"
                        label="Nivel"
                        :items="['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles']"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6" v-if="form.modality === 'synchronized'">
                      <v-text-field
                        v-model="form.start_date"
                        label="Fecha de inicio"
                        type="date"
                        :rules="[v => !!v || 'La fecha de inicio es obligatoria']"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6" v-if="form.modality === 'synchronized'">
                      <v-text-field
                        v-model="form.end_date"
                        label="Fecha de término"
                        type="date"
                        :rules="[v => !!v || 'La fecha de término es obligatoria']"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6" v-if="form.modality === 'asynchronized'">
                      <v-text-field
                        v-model.number="form.duration_days"
                        label="Duración (en días)"
                        type="number"
                        min="1"
                        :rules="[v => !!v || 'La duración es obligatoria']"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-img
                        v-if="course.imageUrl"
                        :src="course.imageUrl"
                        max-height="200"
                        contain
                        class="mb-4"
                      ></v-img>
                      
                      <v-file-input
                        v-model="courseImage"
                        label="Cambiar imagen del curso"
                        accept="image/*"
                        prepend-icon="mdi-camera"
                        :rules="[v => !v || v.size < 2000000 || 'La imagen debe pesar menos de 2 MB']"
                      ></v-file-input>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!-- Contenido -->
                <v-window-item value="content">
                  <v-row>
                    <v-col cols="12">
                      <h3 class="text-h6 mb-3">Objetivos de Aprendizaje</h3>
                      <p class="text-caption mb-2">¿Qué aprenderán los estudiantes en este curso?</p>
                      
                      <div v-for="(objective, index) in form.learningObjectives" :key="`obj-${index}`" class="d-flex mb-2">
                        <v-text-field
                          v-model="form.learningObjectives[index]"
                          label="Objetivo"
                          placeholder="Ej: Aprenderán a crear aplicaciones web con Vue.js"
                          density="compact"
                        ></v-text-field>
                        <v-btn icon class="ml-2 mt-1" @click="removeObjective(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      
                      <v-btn
                        color="primary"
                        variant="text"
                        prepend-icon="mdi-plus"
                        @click="addObjective"
                        class="mt-2"
                      >
                        Agregar objetivo
                      </v-btn>
                    </v-col>

                    <v-col cols="12">
                      <h3 class="text-h6 mb-3">Requisitos</h3>
                      <p class="text-caption mb-2">¿Qué conocimientos previos necesitan los estudiantes?</p>
                      
                      <div v-for="(req, index) in form.requirements" :key="`req-${index}`" class="d-flex mb-2">
                        <v-text-field
                          v-model="form.requirements[index]"
                          label="Requisito"
                          placeholder="Ej: Conocimientos básicos de HTML y CSS"
                          density="compact"
                        ></v-text-field>
                        <v-btn icon class="ml-2 mt-1" @click="removeRequirement(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                      
                      <v-btn
                        color="primary"
                        variant="text"
                        prepend-icon="mdi-plus"
                        @click="addRequirement"
                        class="mt-2"
                      >
                        Agregar requisito
                      </v-btn>
                    </v-col>

                    <v-col cols="12">
                      <v-divider class="my-4"></v-divider>
                      <v-btn
                        color="primary"
                        :to="`/courses/${course.id}/modules`"
                      >
                        <v-icon start>mdi-book-open-variant</v-icon>
                        Gestionar Módulos y Lecciones
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!-- Precios y Disponibilidad -->
                <v-window-item value="pricing">
                  <v-row>
                    <v-col cols="12">
                      <v-switch
                        v-model="form.isFree"
                        label="Este es un curso gratuito"
                        color="success"
                        hide-details
                        class="mb-4"
                      ></v-switch>
                    </v-col>

                    <v-col cols="12" md="6" v-if="!form.isFree">
                      <v-text-field
                        v-model.number="form.netPrice"
                        label="Precio (sin IVA)"
                        type="number"
                        min="0"
                        :rules="[v => form.isFree || !!v || 'El precio es obligatorio para cursos de pago']"
                        suffix="CLP"
                      ></v-text-field>
                      <div class="text-caption text-grey">
                        Precio final con IVA: {{ calculateTotalPrice(form.netPrice) }} CLP
                      </div>
                    </v-col>

                    <v-col cols="12" md="6" v-if="!form.isFree">
                      <v-text-field
                        v-model="form.sku"
                        label="SKU (Código único)"
                        :rules="[v => form.isFree || !!v || 'El SKU es obligatorio para cursos de pago']"
                      ></v-text-field>
                      <div class="text-caption text-grey">
                        El SKU debe ser único para cada curso.
                      </div>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!-- Configuración -->
                <v-window-item value="settings">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.language"
                        label="Idioma"
                        :items="['Español', 'Inglés', 'Portugués']"
                        :rules="[v => !!v || 'El idioma es obligatorio']"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-switch
                        v-model="form.isPublished"
                        label="Curso publicado"
                        color="success"
                      ></v-switch>
                    </v-col>

                    <v-col cols="12">
                      <v-divider class="my-4"></v-divider>
                      <v-btn
                        color="red"
                        variant="outlined"
                        @click="confirmDeleteCourse"
                      >
                        <v-icon start>mdi-delete</v-icon>
                        Eliminar Curso
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!-- Descuentos -->
                <v-window-item value="discount">
                  <v-row>
                    <v-col cols="12" v-if="form.isFree">
                      <v-alert type="info" text="Los cursos gratuitos no pueden tener descuentos"></v-alert>
                    </v-col>

                    <template v-else>
                      <v-col cols="12">
                        <h3 class="text-h6 mb-3">Gestión de Descuentos</h3>
                        
                        <v-card class="mb-4" variant="outlined">
                          <v-card-text>
                            <div class="d-flex align-center mb-2">
                              <span class="text-subtitle-1 font-weight-bold">Estado de descuento:</span>
                              <v-chip
                                :color="course.hasActiveDiscount ? 'success' : 'grey'"
                                class="ml-2"
                              >
                                {{ course.hasActiveDiscount ? 'Activo' : 'Inactivo' }}
                              </v-chip>
                            </div>

                            <div v-if="course.hasActiveDiscount" class="mb-2">
                              <div class="d-flex align-center">
                                <span class="text-subtitle-1">Descuento actual:</span>
                                <v-chip color="primary" class="ml-2">{{ course.discount }}%</v-chip>
                              </div>
                              <div class="d-flex align-center mt-2">
                                <span class="text-subtitle-1">Precio original:</span>
                                <span class="ml-2 text-decoration-line-through">{{ formatPrice(course.totalPrice) }}</span>
                              </div>
                              <div class="d-flex align-center mt-2">
                                <span class="text-subtitle-1">Precio con descuento:</span>
                                <span class="ml-2 text-success font-weight-bold">{{ formatPrice(course.discountedTotalPrice) }}</span>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="12">
                        <v-expand-transition>
                          <div v-if="!course.hasActiveDiscount">
                            <h4 class="text-h6 mb-3">Aplicar nuevo descuento</h4>
                            <v-form ref="discountForm" v-model="discountFormValid" @submit.prevent="applyDiscount">
                              <v-row>
                                <v-col cols="12" md="6">
                                  <v-text-field
                                    v-model.number="discountData.discount"
                                    label="Porcentaje de descuento"
                                    type="number"
                                    min="1"
                                    max="100"
                                    :rules="[
                                      v => v >= 1 && v <= 100 || 'El descuento debe estar entre 1% y 100%'
                                    ]"
                                    required
                                  ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                  <v-select
                                    v-model="discountData.discountType"
                                    label="Tipo de descuento"
                                    :items="[
                                      { title: 'Manual', value: 'manual' },
                                      { title: 'Campaña', value: 'campaign' }
                                    ]"
                                    item-title="title"
                                    item-value="value"
                                    required
                                  ></v-select>
                                </v-col>
                                <v-col cols="12">
                                  <v-text-field
                                    v-model="discountData.discountName"
                                    label="Nombre del descuento"
                                    placeholder="Ej: Oferta Especial, Black Friday, etc."
                                  ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                  <v-text-field
                                    v-model="discountData.discountStartDate"
                                    label="Fecha de inicio del descuento"
                                    type="date"
                                  ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                  <v-text-field
                                    v-model="discountData.discountEndDate"
                                    label="Fecha de término del descuento"
                                    type="date"
                                  ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                  <v-btn
                                    color="primary"
                                    type="submit"
                                    :loading="applyingDiscount"
                                    :disabled="!discountFormValid"
                                  >
                                    Aplicar Descuento
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </v-form>
                          </div>
                        </v-expand-transition>

                        <v-btn
                          v-if="course.hasActiveDiscount"
                          color="error"
                          variant="outlined"
                          @click="confirmRemoveDiscount"
                          :loading="removingDiscount"
                          class="mt-4"
                        >
                          <v-icon start>mdi-discount-remove</v-icon>
                          Eliminar Descuento
                        </v-btn>
                      </v-col>

                      <v-col cols="12">
                        <v-divider class="my-4"></v-divider>
                        <v-expansion-panels variant="accordion">
                          <v-expansion-panel title="Asignar acceso gratuito a un estudiante">
                            <v-expansion-panel-text>
                              <p class="text-caption mb-4">
                                Puedes otorgar acceso gratuito a este curso a un estudiante específico, incluso si es un curso de pago.
                              </p>
                              <v-form ref="assignForm" v-model="assignFormValid" @submit.prevent="assignFreeAccess">
                                <v-row>
                                  <v-col cols="12">
                                    <v-text-field
                                      v-model="assignData.userId"
                                      label="ID o Email del estudiante"
                                      :rules="[v => !!v || 'El ID o email del estudiante es requerido']"
                                      required
                                    ></v-text-field>
                                  </v-col>
                                  <v-col cols="12">
                                    <v-textarea
                                      v-model="assignData.reason"
                                      label="Motivo"
                                      placeholder="Explica por qué estás asignando acceso gratuito"
                                      rows="2"
                                    ></v-textarea>
                                  </v-col>
                                  <v-col cols="12">
                                    <v-btn
                                      color="success"
                                      type="submit"
                                      :loading="assigning"
                                      :disabled="!assignFormValid"
                                    >
                                      <v-icon start>mdi-account-check</v-icon>
                                      Asignar Acceso Gratuito
                                    </v-btn>
                                  </v-col>
                                </v-row>
                              </v-form>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-col>
                    </template>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-btn
                color="grey"
                variant="text"
                @click="cancel"
              >
                Cancelar
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                :loading="saving"
                :disabled="!formValid"
              >
                Guardar Cambios
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </template>
      
      <div v-else class="text-center my-8">
        <p class="text-h5">Curso no encontrado</p>
        <v-btn color="primary" class="mt-4" to="/courses">Ver todos los cursos</v-btn>
      </div>
    </v-container>

    <!-- Diálogo de confirmación para eliminar curso -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar Curso</v-card-title>
        <v-card-text>
          Esta acción eliminará permanentemente el curso "{{ course.title }}" y todos sus contenidos. Esta acción no se puede deshacer.
          <div class="mt-4">
            <v-alert type="warning">
              También se eliminarán todas las inscripciones asociadas.
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn 
            color="error" 
            @click="deleteCourse"
            :loading="deleting"
          >
            Eliminar Definitivamente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar descuento -->
    <v-dialog v-model="removeDiscountDialog" max-width="500">
      <v-card>
        <v-card-title>Eliminar Descuento</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el descuento actual ({{ course.discount }}%) de este curso?
          <div class="mt-2">
            El precio volverá a ser: {{ formatPrice(course.totalPrice) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="removeDiscountDialog = false">Cancelar</v-btn>
          <v-btn 
            color="error" 
            @click="removeDiscount"
            :loading="removingDiscount"
          >
            Eliminar Descuento
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'CourseEdit',
  
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      formValid: false,
      discountFormValid: false,
      assignFormValid: false,
      activeTab: 'basic',
      saving: false,
      deleting: false,
      applyingDiscount: false,
      removingDiscount: false,
      assigning: false,
      courseImage: null,
      deleteDialog: false,
      removeDiscountDialog: false,
      form: {
        title: '',
        description: '',
        category: '',
        modality: '',
        level: '',
        isFree: false,
        netPrice: 0,
        sku: '',
        duration_days: 0,
        start_date: null,
        end_date: null,
        language: '',
        isPublished: true,
        learningObjectives: [],
        requirements: []
      },
      discountData: {
        discount: 10,
        discountType: 'manual',
        discountName: '',
        discountStartDate: null,
        discountEndDate: null
      },
      assignData: {
        userId: '',
        reason: ''
      },
      categories: ['Programación', 'Diseño', 'Marketing', 'Negocios', 'Desarrollo Personal', 'Ciencia', 'Idiomas', 'Música', 'Otro']
    };
  },
  
  computed: {
    ...mapGetters({
      course: 'courses/currentCourse',
      isLoading: 'courses/isLoading',
      error: 'courses/error'
    }),
    
    breadcrumbs() {
      return [
        { title: 'Inicio', disabled: false, to: '/' },
        { title: 'Cursos', disabled: false, to: '/courses' },
        { title: this.course?.title || 'Editar Curso', disabled: false, to: `/courses/${this.id}` },
        { title: 'Editar', disabled: true }
      ];
    }
  },
  
  created() {
    this.fetchCourse();
  },
  
  methods: {
    ...mapActions('courses', [
      'fetchCourse', 
      'updateCourse', 
      'deleteCourse',
      'applyCourseDiscount',
      'removeCourseDiscount',
      'assignFreeCourseAccess'
    ]),
    
    formatPrice,
    
    async fetchCourse() {
      try {
        await this.fetchCourse(this.id);
        // Inicializar el formulario con los datos del curso
        this.initializeForm();
      } catch (error) {
        console.error('Error al cargar el curso:', error);
      }
    },
    
    initializeForm() {
      if (!this.course) return;
      
      this.form = {
        title: this.course.title || '',
        description: this.course.description || '',
        category: this.course.category || '',
        modality: this.course.modality || 'asynchronized',
        level: this.course.level || '',
        isFree: !!this.course.isFree,
        netPrice: this.course.netPrice || 0,
        sku: this.course.sku || '',
        discount: this.course.discount || 0,
        discountType: this.course.discountType || 'manual',
        discountName: this.course.discountName || '',
        discountStartDate: this.formatDate(this.course.discountStartDate),
        discountEndDate: this.formatDate(this.course.discountEndDate),
        duration_days: this.course.duration_days || 30,
        start_date: this.formatDate(this.course.start_date),
        end_date: this.formatDate(this.course.end_date),
        language: this.course.language || 'Español',
        isPublished: this.course.isPublished !== false,
        learningObjectives: this.course.learningObjectives || [''],
        requirements: this.course.requirements || ['']
      };
    },
    
    formatDate(dateValue) {
      if (!dateValue) return null;
      
      let date;
      if (typeof dateValue === 'object' && dateValue.seconds) {
        // Firestore Timestamp
        date = new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === 'string') {
        // String date
        date = new Date(dateValue);
      } else {
        // Assume it's already a Date
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) return null;
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    },
    
    nextStep() {
      const tabs = ['basic', 'content', 'pricing', 'settings', 'discount'];
      const currentIndex = tabs.indexOf(this.activeTab);
      if (currentIndex < tabs.length - 1) {
        this.activeTab = tabs[currentIndex + 1];
      }
    },
    
    prevStep() {
      const tabs = ['basic', 'content', 'pricing', 'settings', 'discount'];
      const currentIndex = tabs.indexOf(this.activeTab);
      if (currentIndex > 0) {
        this.activeTab = tabs[currentIndex - 1];
      }
    },
    
    addObjective() {
      this.form.learningObjectives.push('');
    },
    
    removeObjective(index) {
      this.form.learningObjectives.splice(index, 1);
      if (this.form.learningObjectives.length === 0) {
        this.form.learningObjectives = [''];
      }
    },
    
    addRequirement() {
      this.form.requirements.push('');
    },
    
    removeRequirement(index) {
      this.form.requirements.splice(index, 1);
      if (this.form.requirements.length === 0) {
        this.form.requirements = [''];
      }
    },
    
    handleModalityChange(value) {
      if (value === 'synchronized') {
        // Para cursos sincrónicos, establecer fechas
        if (!this.form.start_date) {
          const today = new Date();
          this.form.start_date = today.toISOString().split('T')[0];
        }
        if (!this.form.end_date) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          this.form.end_date = nextMonth.toISOString().split('T')[0];
        }
      }
    },
    
    calculateTotalPrice(netPrice) {
      if (!netPrice) return formatPrice(0);
      const iva = 0.19; // 19% IVA
      const totalPrice = Math.round(netPrice * (1 + iva));
      return formatPrice(totalPrice);
    },
    
    async onUpdateCourse() {
      if (!this.$refs.courseForm.validate()) {
        return;
      }
      
      this.saving = true;
      
      try {
        // Limpiar objetivos y requisitos vacíos
        this.form.learningObjectives = this.form.learningObjectives.filter(obj => obj.trim() !== '');
        this.form.requirements = this.form.requirements.filter(req => req.trim() !== '');
        
        // Actualizar el curso
        await this.updateCourse({ 
          courseId: this.id, 
          courseData: this.form 
        });
        
        // Mostrar mensaje de éxito
        this.$toast.success('Curso actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar el curso:', error);
        this.$toast.error(error.response?.data?.details || error.message || 'Error al actualizar el curso');
      } finally {
        this.saving = false;
      }
    },
    
    confirmDeleteCourse() {
      this.deleteDialog = true;
    },
    
    async deleteCourse() {
      this.deleting = true;
      
      try {
        await this.$store.dispatch('courses/deleteCourse', this.id);
        this.$toast.success('Curso eliminado exitosamente');
        this.$router.push('/courses');
      } catch (error) {
        console.error('Error al eliminar el curso:', error);
        this.$toast.error(error.response?.data?.message || error.message || 'Error al eliminar el curso');
      } finally {
        this.deleting = false;
        this.deleteDialog = false;
      }
    },
    
    async applyDiscount() {
      if (!this.$refs.discountForm.validate()) {
        return;
      }
      
      this.applyingDiscount = true;
      
      try {
        await this.applyCourseDiscount({
          courseId: this.id,
          discountData: this.discountData
        });
        
        this.$toast.success('Descuento aplicado exitosamente');
        // Recargar los datos del curso
        await this.fetchCourse(this.id);
      } catch (error) {
        console.error('Error al aplicar descuento:', error);
        this.$toast.error(error.response?.data?.message || error.message || 'Error al aplicar descuento');
      } finally {
        this.applyingDiscount = false;
      }
    },
    
    confirmRemoveDiscount() {
      this.removeDiscountDialog = true;
    },
    
    async removeDiscount() {
      this.removingDiscount = true;
      
      try {
        await this.removeCourseDiscount(this.id);
        
        this.$toast.success('Descuento eliminado exitosamente');
        this.removeDiscountDialog = false;
        // Recargar los datos del curso
        await this.fetchCourse(this.id);
      } catch (error) {
        console.error('Error al eliminar descuento:', error);
        this.$toast.error(error.response?.data?.message || error.message || 'Error al eliminar descuento');
      } finally {
        this.removingDiscount = false;
      }
    },
    
    async assignFreeAccess() {
      if (!this.$refs.assignForm.validate()) {
        return;
      }
      
      this.assigning = true;
      
      try {
        await this.assignFreeCourseAccess({
          courseId: this.id,
          userId: this.assignData.userId,
          reason: this.assignData.reason
        });
        
        this.$toast.success('Acceso gratuito asignado exitosamente');
        // Limpiar formulario
        this.assignData.userId = '';
        this.assignData.reason = '';
      } catch (error) {
        console.error('Error al asignar acceso gratuito:', error);
        this.$toast.error(error.response?.data?.message || error.message || 'Error al asignar acceso gratuito');
      } finally {
        this.assigning = false;
      }
    },
    
    cancel() {
      this.$router.push(`/courses/${this.id}`);
    }
  }
};
</script>

<style scoped>
.course-edit {
  padding-bottom: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
}
</style>
