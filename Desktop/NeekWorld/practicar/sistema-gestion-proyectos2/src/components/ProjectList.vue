<template>
  <div class="project-list">
    <ul class="list-group">
      <li class="list-group-item" v-for="project in projects" :key="project.id">
        {{ project.name }}
        <button @click="removeProject(project.id)" class="btn btn-danger btn-sm float-right">Eliminar</button>
      </li>
    </ul>
    <form @submit.prevent="addProject">
      <div class="form-group">
        <input type="text" v-model="newProject.name" class="form-control" placeholder="Nombre del Proyecto" required />
      </div>
      <button type="submit" class="btn btn-primary">Agregar Proyecto</button>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      newProject: {
        name: ''
      }
    };
  },
  computed: {
    ...mapGetters(['allProjects']),
    projects() {
      return this.allProjects;
    }
  },
  methods: {
    ...mapActions(['fetchProjects', 'addProject', 'removeProject']),
    async addProject() {
      await this.addProject(this.newProject);
      this.newProject.name = '';
    },
    async removeProject(projectId) {
      await this.removeProject(projectId);
    }
  },
  created() {
    this.fetchProjects();
  }
};
</script>

<style scoped>
.project-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
