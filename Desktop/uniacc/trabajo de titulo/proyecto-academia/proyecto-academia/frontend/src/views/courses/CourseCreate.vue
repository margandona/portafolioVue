<template>
  <div class="course-create">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-3">Crear Nuevo Curso</h1>
          <p class="text-subtitle-1 text-grey mb-6">
            Completa el formulario para crear un nuevo curso
          </p>
        </v-col>
      </v-row>

      <v-form ref="courseForm" v-model="formValid" @submit.prevent="saveCourse">
        <v-card>
          <v-tabs v-model="activeTab" show-arrows>
            <v-tab value="basic">Información Básica</v-tab>
            <v-tab value="content">Contenido</v-tab>
            <v-tab value="pricing">Precios y Disponibilidad</v-tab>
            <v-tab value="settings">Configuración</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Información básica -->
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="course.title"
                      label="Título del curso"
                      :rules="[v => !!v || 'El título es obligatorio']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="course.category"
                      label="Categoría"
                      :items="categories"
                      :rules="[v => !!v || 'La categoría es obligatoria']"
                      required
                    ></v-select>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="course.description"
                      label="Descripción del curso"
                      rows="4"
                      :rules="[v => !!v || 'La descripción es obligatoria']"
                      required
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="course.modality"
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
                      v-model="course.level"
                      label="Nivel"
                      :items="['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles']"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6" v-if="course.modality === 'synchronized'">
                    <v-text-field
                      v-model="course.start_date"
                      label="Fecha de inicio"
                      type="date"
                      :rules="[v => !!v || 'La fecha de inicio es obligatoria']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6" v-if="course.modality === 'synchronized'">
                    <v-text-field
                      v-model="course.end_date"
                      label="Fecha de término"
                      type="date"
                      :rules="[v => !!v || 'La fecha de término es obligatoria']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6" v-if="course.modality === 'asynchronized'">
                    <v-text-field
                      v-model="course.duration_days"
                      label="Duración (en días)"
                      type="number"
                      min="1"
                      :rules="[v => !!v || 'La duración es obligatoria']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-file-input
                      v-model="courseImage"
                      label="Imagen del curso"
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
                    
                    <div v-for="(objective, index) in course.learningObjectives" :key="`obj-${index}`" class="d-flex mb-2">
                      <v-text-field
                        v-model="course.learningObjectives[index]"
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
                    
                    <div v-for="(req, index) in course.requirements" :key="`req-${index}`" class="d-flex mb-2">
                      <v-text-field
                        v-model="course.requirements[index]"
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
                    <h3 class="text-h6 mb-3">Módulos y Lecciones</h3>
                    <p class="text-caption mb-4">Los módulos y lecciones se podrán agregar después de crear el curso.</p>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- Precios y Disponibilidad -->
              <v-window-item value="pricing">
                <v-row>
                  <v-col cols="12">
                    <v-switch
                      v-model="course.isFree"
                      label="Este es un curso gratuito"
                      color="success"
                      hide-details
                      class="mb-4"
                    ></v-switch>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree">
                    <v-text-field
                      v-model="course.netPrice"
                      label="Precio (sin IVA)"
                      type="number"
                      min="0"
                      :rules="[v => course.isFree || !!v || 'El precio es obligatorio para cursos de pago']"
                      suffix="CLP"
                    ></v-text-field>
                    <div class="text-caption text-grey">
                      Precio final con IVA: {{ calculateTotalPrice(course.netPrice) }} CLP
                    </div>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree">
                    <v-text-field
                      v-model="course.sku"
                      label="SKU (Código único)"
                      :rules="[v => course.isFree || !!v || 'El SKU es obligatorio para cursos de pago']"
                    ></v-text-field>
                    <div class="text-caption text-grey">
                      El SKU debe ser único para cada curso.
                    </div>
                  </v-col>

                  <v-divider class="my-4" v-if="!course.isFree"></v-divider>

                  <v-col cols="12" v-if="!course.isFree">
                    <h3 class="text-h6 mb-3">Descuento</h3>
                    <v-switch
                      v-model="hasDiscount"
                      label="Aplicar descuento al curso"
                      color="info"
                      hide-details
                      class="mb-4"
                    ></v-switch>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree && hasDiscount">
                    <v-text-field
                      v-model="course.discount"
                      label="Descuento (%)"
                      type="number"
                      min="1"
                      max="100"
                      :rules="[
                        v => !hasDiscount || (v >= 1 && v <= 100) || 'El descuento debe estar entre 1% y 100%'
                      ]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree && hasDiscount">
                    <v-select
                      v-model="course.discountType"
                      label="Tipo de descuento"
                      :items="[
                        { title: 'Manual', value: 'manual' },
                        { title: 'Campaña', value: 'campaign' }
                      ]"
                      item-title="title"
                      item-value="value"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" v-if="!course.isFree && hasDiscount">
                    <v-text-field
                      v-model="course.discountName"
                      label="Nombre del descuento"
                      placeholder="Ej: Oferta Especial, Black Friday, etc."
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree && hasDiscount">
                    <v-text-field
                      v-model="course.discountStartDate"
                      label="Fecha de inicio del descuento"
                      type="date"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6" v-if="!course.isFree && hasDiscount">
                    <v-text-field
                      v-model="course.discountEndDate"
                      label="Fecha de término del descuento"
                      type="date"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-window-item>

              <!-- Configuración -->
              <v-window-item value="settings">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="course.language"
                      label="Idioma"
                      :items="['Español', 'Inglés', 'Portugués']"
                      :rules="[v => !!v || 'El idioma es obligatorio']"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-switch
                      v-model="course.isPublished"
                      label="Publicar curso inmediatamente"
                      color="success"
                    ></v-switch>
                  </v-col>
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
              variant="text"
              @click="prevStep"
              :disabled="activeTab === 'basic'"
            >
              Anterior
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="nextStep"
              :disabled="activeTab === 'settings'"
            >
              Siguiente
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
              :disabled="!formValid"
            >
              Crear Curso
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'CourseCreate',
  
  data() {
    return {
      formValid: false,
      activeTab: 'basic',
      loading: false,
      hasDiscount: false,
      courseImage: null,
      course: {
        title: '',
        description: '',
        category: '',
        modality: 'asynchronized',
        level: 'Todos los niveles',
        isFree: false,
        netPrice: null,
        sku: '',
        discount: 0,
        discountType: 'manual',
        discountName: '',
        discountStartDate: null,
        discountEndDate: null,
        duration_days: 30,
        start_date: null,
        end_date: null,
        language: 'Español',
        isPublished: true,
        learningObjectives: [''],
        requirements: ['']
      },
      categories: ['Programación', 'Diseño', 'Marketing', 'Negocios', 'Desarrollo Personal', 'Ciencia', 'Idiomas', 'Música', 'Otro']
    };
  },
  
  computed: {
    ...mapGetters(['userRole']),
    
    breadcrumbs() {
      return [
        { title: 'Inicio', disabled: false, to: '/' },
        { title: 'Cursos', disabled: false, to: '/courses' },
        { title: 'Crear Curso', disabled: true }
      ];
    }
  },
  
  methods: {
    ...mapActions('courses', ['createCourse']),
    
    nextStep() {
      const tabs = ['basic', 'content', 'pricing', 'settings'];
      const currentIndex = tabs.indexOf(this.activeTab);
      if (currentIndex < tabs.length - 1) {
        this.activeTab = tabs[currentIndex + 1];
      }
    },
    
    prevStep() {
      const tabs = ['basic', 'content', 'pricing', 'settings'];
      const currentIndex = tabs.indexOf(this.activeTab);
      if (currentIndex > 0) {
        this.activeTab = tabs[currentIndex - 1];
      }
    },
    
    addObjective() {
      this.course.learningObjectives.push('');
    },
    
    removeObjective(index) {
      this.course.learningObjectives.splice(index, 1);
      if (this.course.learningObjectives.length === 0) {
        this.course.learningObjectives = [''];
      }
    },
    
    addRequirement() {
      this.course.requirements.push('');
    },
    
    removeRequirement(index) {
      this.course.requirements.splice(index, 1);
      if (this.course.requirements.length === 0) {
        this.course.requirements = [''];
      }
    },
    
    handleModalityChange(value) {
      if (value === 'synchronized') {
        // Para cursos sincrónicos, establecer fechas y eliminar duración
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        this.course.start_date = today.toISOString().split('T')[0];
        this.course.end_date = nextMonth.toISOString().split('T')[0];
        this.course.duration_days = null;
      } else {
        // Para cursos asincrónicos, establecer duración y eliminar fechas
        this.course.duration_days = 30;
        this.course.start_date = null;
        this.course.end_date = null;
      }
    },
    
    calculateTotalPrice(netPrice) {
      if (!netPrice) return formatPrice(0);
      const iva = 0.19; // 19% IVA
      const totalPrice = Math.round(netPrice * (1 + iva));
      return formatPrice(totalPrice);
    },
    
    async saveCourse() {
      if (!this.$refs.courseForm.validate()) {
        return;
      }
      
      this.loading = true;
      
      try {
        // Si no es gratuito y no se ha definido un SKU, generar uno
        if (!this.course.isFree && !this.course.sku) {
          this.course.sku = `COURSE-${Date.now()}`;
        }
        
        // Si es gratuito, establecer precio en 0 y sin descuento
        if (this.course.isFree) {
          this.course.netPrice = 0;
          this.course.discount = 0;
          this.course.discountType = null;
          this.course.discountName = null;
          this.course.discountStartDate = null;
          this.course.discountEndDate = null;
        } else if (!this.hasDiscount) {
          // Si no tiene descuento, establecer valores por defecto
          this.course.discount = 0;
          this.course.discountType = null;
          this.course.discountName = null;
          this.course.discountStartDate = null;
          this.course.discountEndDate = null;
        }
        
        // Limpiar objetivos y requisitos vacíos
        this.course.learningObjectives = this.course.learningObjectives.filter(obj => obj.trim() !== '');
        this.course.requirements = this.course.requirements.filter(req => req.trim() !== '');
        
        // Crear el curso
        const response = await this.createCourse(this.course);
        
        // Mostrar mensaje de éxito
        this.$toast.success('Curso creado exitosamente');
        
        // Redirigir a la página de detalle del curso
        this.$router.push(`/courses/${response.course_id}`);
      } catch (error) {
        console.error('Error al crear el curso:', error);
        this.$toast.error(error.response?.data?.details || error.message || 'Error al crear el curso');
      } finally {
        this.loading = false;
      }
    },
    
    cancel() {
      this.$router.push('/courses');
    }
  }
};
</script>

<style scoped>
.course-create {
  padding-bottom: 2rem;
  background-color: #f8f9fa;
}
</style>
