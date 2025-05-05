<template>
  <v-dialog v-model="dialogVisible" width="600">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon class="mr-2">mdi-tag-multiple</v-icon>
        Gestionar descuentos
      </v-card-title>
      
      <v-card-text v-if="course">
        <div class="mb-4">
          <div class="text-subtitle-1">Curso: <strong>{{ course.title }}</strong></div>
          <div class="d-flex align-center">
            <div class="text-body-2">Precio normal: <span class="font-weight-bold">{{ formatPrice(course.totalPrice) }}</span></div>
            <v-chip v-if="course.hasActiveDiscount" color="success" size="small" class="ml-4">
              Descuento activo: {{ course.discount }}%
            </v-chip>
          </div>
        </div>
        
        <v-divider class="my-3"></v-divider>
        
        <!-- Current discount status -->
        <div v-if="course.hasActiveDiscount" class="mb-4">
          <div class="text-subtitle-1">Descuento actual</div>
          <v-list density="compact">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="success">mdi-percent</v-icon>
              </template>
              <v-list-item-title>Porcentaje: {{ course.discount }}%</v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="course.discountName">
              <template v-slot:prepend>
                <v-icon>mdi-tag</v-icon>
              </template>
              <v-list-item-title>Nombre: {{ course.discountName }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="course.discountType">
              <template v-slot:prepend>
                <v-icon>mdi-shape</v-icon>
              </template>
              <v-list-item-title>Tipo: {{ formatDiscountType(course.discountType) }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="course.discountStartDate">
              <template v-slot:prepend>
                <v-icon>mdi-calendar-start</v-icon>
              </template>
              <v-list-item-title>Fecha inicio: {{ formatDate(course.discountStartDate) }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="course.discountEndDate">
              <template v-slot:prepend>
                <v-icon>mdi-calendar-end</v-icon>
              </template>
              <v-list-item-title>Fecha fin: {{ formatDate(course.discountEndDate) }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="success">mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>Precio con descuento: {{ formatPrice(course.discountedTotalPrice) }}</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <v-btn color="error" variant="outlined" class="mt-3" @click="$emit('remove-discount')" :loading="loading">
            <v-icon start>mdi-tag-off</v-icon>
            Eliminar descuento
          </v-btn>
        </div>
        
        <!-- Apply discount form -->
        <div v-if="!course.hasActiveDiscount">
          <v-form ref="discountForm" v-model="formValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="discountData.discount"
                  label="Porcentaje de descuento"
                  type="number"
                  min="1"
                  max="100"
                  required
                  :rules="[
                    v => !!v || 'El porcentaje es requerido', 
                    v => (v > 0 && v <= 100) || 'El descuento debe estar entre 1% y 100%'
                  ]"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
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
                  :rules="[v => !!v || 'El tipo de descuento es requerido']"
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="discountData.discountName"
                  label="Nombre del descuento"
                  placeholder="Ej: Oferta Especial, Black Friday, etc."
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="discountData.discountStartDate"
                  label="Fecha de inicio"
                  type="date"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="discountData.discountEndDate"
                  label="Fecha de término"
                  type="date"
                  :rules="[
                    () => !discountData.discountStartDate || !discountData.discountEndDate || 
                          new Date(discountData.discountEndDate) >= new Date(discountData.discountStartDate) || 
                          'La fecha de término debe ser posterior a la fecha de inicio'
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <div v-if="discountData.discount" class="mt-3 text-subtitle-1">
              El precio con descuento será: <span class="text-success font-weight-bold">{{ calculateDiscountedPrice() }}</span>
            </div>
          </v-form>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="close">
          Cancelar
        </v-btn>
        <v-btn 
          v-if="course && !course.hasActiveDiscount" 
          color="primary" 
          variant="flat" 
          @click="applyDiscount" 
          :loading="loading"
          :disabled="!formValid"
        >
          Aplicar Descuento
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'DiscountCourseDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    course: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      formValid: false,
      discountData: {
        discount: 10,
        discountType: 'manual',
        discountName: '',
        discountStartDate: null,
        discountEndDate: null
      }
    };
  },
  
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  
  methods: {
    formatPrice,
    
    close() {
      this.dialogVisible = false;
      // Reset form after closing
      if (this.$refs.discountForm) {
        this.$refs.discountForm.reset();
      }
    },
    
    calculateDiscountedPrice() {
      if (!this.course || !this.discountData.discount) {
        return formatPrice(0);
      }
      
      const originalPrice = this.course.totalPrice;
      const discountPercent = this.discountData.discount;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      
      return formatPrice(Math.round(discountedPrice));
    },
    
    applyDiscount() {
      if (!this.$refs.discountForm?.validate()) {
        return;
      }
      
      this.$emit('apply-discount', { ...this.discountData });
    },
    
    formatDiscountType(type) {
      const types = {
        manual: 'Manual',
        campaign: 'Campaña',
        global: 'Global'
      };
      return types[type] || type;
    },
    
    formatDate(timestamp) {
      if (!timestamp) return 'No definida';
      
      // Convertir timestamp de Firestore a fecha
      let date;
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString();
    }
  },
  
  watch: {
    course: {
      immediate: true,
      handler(newCourse) {
        if (newCourse) {
          // Reset form when course changes
          this.discountData = {
            discount: 10,
            discountType: 'manual',
            discountName: '',
            discountStartDate: null,
            discountEndDate: null
          };
          
          if (this.$refs.discountForm) {
            this.$refs.discountForm.resetValidation();
          }
        }
      }
    }
  }
};
</script>
