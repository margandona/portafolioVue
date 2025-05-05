<template>
  <v-dialog v-model="dialogVisible" width="600">
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon class="mr-2">mdi-account-key</v-icon>
        Asignar acceso a estudiante
      </v-card-title>
      
      <v-card-text v-if="course">
        <div class="mb-4">
          <div class="text-subtitle-1">Curso: <strong>{{ course.title }}</strong></div>
          <div class="d-flex align-center">
            <div class="text-body-2">
              Precio: <span class="font-weight-bold">{{ formatPrice(course.totalPrice) }}</span>
            </div>
            <v-chip color="success" size="small" class="ml-4">Acceso gratuito</v-chip>
          </div>
        </div>
        
        <v-divider class="my-3"></v-divider>
        
        <v-form ref="accessForm" v-model="formValid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="accessData.userId"
                label="ID o Email del estudiante"
                placeholder="Ingrese el email del estudiante"
                :rules="[v => !!v || 'Este campo es requerido']"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-textarea
                v-model="accessData.reason"
                label="Motivo de la asignación"
                placeholder="Explique por qué está otorgando acceso gratuito"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="close">
          Cancelar
        </v-btn>
        <v-btn 
          color="success" 
          variant="flat" 
          @click="assignAccess" 
          :loading="loading"
          :disabled="!formValid"
        >
          Asignar Acceso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'AssignAccessDialog',
  
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
      accessData: {
        userId: '',
        reason: ''
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
      this.accessData = {
        userId: '',
        reason: ''
      };
      
      if (this.$refs.accessForm) {
        this.$refs.accessForm.reset();
      }
    },
    
    assignAccess() {
      if (!this.$refs.accessForm?.validate()) {
        return;
      }
      
      this.$emit('assign-access', { ...this.accessData });
    }
  }
};
</script>
