<template>
  <div class="user-management">
    <h1>Gestión de Usuarios</h1>

    <!-- Indicador de Carga -->
    <div v-if="isLoading" class="loading-spinner">Cargando...</div>

    <!-- Búsqueda de Usuarios -->
    <div class="search-container">
      <label for="search">Buscar Usuario</label>
      <input
        id="search"
        type="text"
        v-model="searchQuery"
        placeholder="ID o correo electrónico"
        :disabled="isLoading"
      />
      <button class="btn btn-primary" @click="searchUser" :disabled="isLoading">
        Buscar
      </button>
      <button class="btn btn-secondary" @click="loadUsers" :disabled="isLoading">
        Recargar Usuarios
      </button>
    </div>

    <!-- Formulario para Crear Usuario -->
    <div class="create-user-container">
      <h2>Crear Nuevo Usuario</h2>
      <form @submit.prevent="createUser">
        <label for="name">Nombre</label>
        <input
          id="name"
          type="text"
          v-model="newUser.name"
          placeholder="Nombre"
          required
          :disabled="isLoading"
        />

        <label for="email">Correo Electrónico</label>
        <input
          id="email"
          type="email"
          v-model="newUser.email"
          placeholder="Correo Electrónico"
          required
          :disabled="isLoading"
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          v-model="newUser.password"
          placeholder="Contraseña"
          required
          :disabled="isLoading"
        />

        <label for="role">Rol</label>
        <select
          id="role"
          v-model="newUser.role"
          required
          :disabled="isLoading"
        >
          <option value="student">Estudiante</option>
          <option value="teacher">Profesor</option>
          <option value="admin">Administrador</option>
        </select>

        <button class="btn btn-success" type="submit" :disabled="isLoading">
          Crear Usuario
        </button>
      </form>
    </div>

    <!-- Lista de Usuarios -->
    <div v-if="users.length > 0" class="user-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select
                v-model="user.role"
                @change="updateUserRole(user)"
                :disabled="isLoading"
              >
                <option value="admin">Administrador</option>
                <option value="teacher">Profesor</option>
                <option value="student">Estudiante</option>
              </select>
            </td>
            <td>
              <button
                class="btn btn-danger"
                @click="deleteUser(user.id)"
                :disabled="isLoading"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else>No se encontraron usuarios.</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserManagementView",
  data() {
    return {
      users: [], // Lista de usuarios
      searchQuery: "", // Término de búsqueda (ID, email o nombre)
      isLoading: false, // Indicador de carga
      newUser: {
        name: "",
        email: "",
        password: "",
        role: "student",
      },
    };
  },
  async created() {
    await this.loadUsers();
  },
  methods: {
    // Cargar todos los usuarios
    async loadUsers() {
      this.isLoading = true;
      try {
        const response = await axios.get("/api/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.users = response.data;
      } catch (error) {
        console.error("Error al cargar los usuarios:", error.response?.data || error.message);
        alert("No se pudieron cargar los usuarios.");
      } finally {
        this.isLoading = false;
      }
    },
    // Buscar usuario por ID, correo electrónico o nombre
    async searchUser() {
      if (!this.searchQuery.trim()) {
        alert("Por favor, ingrese un ID, correo electrónico o nombre para buscar.");
        return;
      }

      this.isLoading = true;
      try {
        const response = await axios.get("/api/users/search", {
          params: {
            id: isNaN(this.searchQuery) ? undefined : this.searchQuery,
            email: this.searchQuery.includes("@") ? this.searchQuery : undefined,
            name: !this.searchQuery.includes("@") && isNaN(this.searchQuery) ? this.searchQuery : undefined,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.users = Array.isArray(response.data) ? response.data : [response.data];
        if (this.users.length === 0) {
          alert("No se encontraron resultados para la búsqueda.");
        }
      } catch (error) {
        console.error("Error al buscar usuario:", error.response?.data || error.message);
        alert("No se pudo encontrar al usuario.");
      } finally {
        this.isLoading = false;
      }
    },
    // Crear un nuevo usuario
    async createUser() {
      this.isLoading = true;
      try {
        const response = await axios.post(
          "/api/users",
          this.newUser,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.users.push(response.data.user); // Asegurarse de agregar solo el usuario creado
        alert("Usuario creado exitosamente.");
        this.newUser = { name: "", email: "", password: "", role: "student" };
      } catch (error) {
        console.error("Error al crear el usuario:", error.response?.data || error.message);
        alert("No se pudo crear el usuario.");
      } finally {
        this.isLoading = false;
      }
    },
    // Actualizar el rol de un usuario
    async updateUserRole(user) {
      if (!confirm(`¿Estás seguro de que deseas cambiar el rol de ${user.name} a ${user.role}?`)) {
        await this.loadUsers(); // Revertir cambios si no se confirma
        return;
      }

      this.isLoading = true;
      try {
        await axios.put(
          `/api/users/${user.id}`,
          { role: user.role },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Rol actualizado exitosamente.");
      } catch (error) {
        console.error("Error al actualizar el rol:", error.response?.data || error.message);
        alert("No se pudo actualizar el rol del usuario.");
        await this.loadUsers(); // Revertir cambios si falla la operación
      } finally {
        this.isLoading = false;
      }
    },
    // Eliminar un usuario
    async deleteUser(userId) {
      if (!confirm("¿Está seguro de que desea eliminar este usuario?")) {
        return;
      }

      this.isLoading = true;
      try {
        await axios.delete(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.users = this.users.filter((user) => user.id !== userId);
        alert("Usuario eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar usuario:", error.response?.data || error.message);
        alert("No se pudo eliminar el usuario.");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>


<style scoped>
.user-management {
  padding: 20px;
  max-width: 900px;
  margin: auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  font-family: "Playfair Display", serif;
  color: #2a3b5f;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-container button {
  padding: 10px 20px;
  background-color: #2e8b57;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.search-container button:hover {
  background-color: #3aa870;
}

.user-table {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

table th {
  background-color: #2e8b57;
  color: white;
}

table tr:hover {
  background-color: #f1f1f1;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
}

.loading-spinner {
  text-align: center;
  margin: 20px 0;
  font-size: 18px;
  color: #2e8b57;
}
/* Mantener estilos existentes y agregar estilos para el formulario */
.create-user-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.create-user-container h2 {
  margin-bottom: 15px;
  font-size: 20px;
}

.create-user-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.create-user-container input,
.create-user-container select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.create-user-container button {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-user-container button:hover {
  background-color: #218838;
}
</style>
