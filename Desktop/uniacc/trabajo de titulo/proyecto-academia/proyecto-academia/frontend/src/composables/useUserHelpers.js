export function getRoleText(role) {
  const roles = {
    student: 'Estudiante',
    teacher: 'Profesor',
    admin: 'Administrador'
  };
  return roles[role] || 'Desconocido';
}

export function getRoleColor(role) {
  const colors = {
    student: 'blue',
    teacher: 'green',
    admin: 'purple'
  };
  return colors[role] || 'grey';
}

export const roleOptions = [
  { title: 'Estudiante', value: 'student' },
  { title: 'Profesor', value: 'teacher' },
  { title: 'Administrador', value: 'admin' }
];
