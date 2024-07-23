# Obtener tres puntajes de prueba
round1 = int(input('Ingresa la nota del primer examen: '))
round2 = int(input('Ingresa la nota del segundo examen: '))
round3 = int(input('Ingresa la nota del tercer examen: '))

# Calcular el promedio
average = (round1 + round2 + round3) / 3

# Imprimir el promedio
print("El promedio de las notas es:", average)

# Pausa al final
input("Presiona Enter para salir...")