<template>
  <div class="projects">
    <h1>Proyectos</h1>
    <ProjectList />
  </div>
</template>

<script>
import ProjectList from '../components/ProjectList.vue';

export default {
  name: 'Projects',
  components: {
    ProjectList
  }
};
</script>

<style scoped>
.projects {
  padding: 20px;
}
</style>
