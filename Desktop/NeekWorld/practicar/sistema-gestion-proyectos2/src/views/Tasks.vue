<template>
    <div class="tasks">
      <h1>Tareas</h1>
      <TaskList />
    </div>
  </template>
  
  <script>
  import TaskList from '../components/TaskList.vue';
  
  export default {
    name: 'Tasks',
    components: {
      TaskList
    }
  };
  </script>
  
  <style scoped>
  .tasks {
    padding: 20px;
  }
  </style>
  