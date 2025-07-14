# Prueba Desarrollo Software - ASP.NET Core MVC

Proyecto realizado ASP.NET Core MVC .NET 8

---

### Tecnologías usadas
- ASP.NET Core MVC (.NET 8)
- Entity Framework Core
- SQL Server
- Bootstrap 5
- jQuery y AJAX
- FontAwesome

---

### Funcionalidades

1. Listado de Trabajadores
   - Mediante un procedimiento almacenado `usp_ListarTrabajadores` configurado con respuesta json en el controlador para luego poder usar la ruta y mostrar los datos con js
   - CREATE PROCEDURE usp_ListarTrabajadores
AS
BEGIN
  SELECT 
    t.Id,
    t.TipoDocumento AS "Tipo Documento",
    t.NumeroDocumento AS "Nro Documento",
    UPPER(t.Nombres) AS "Nombre",
    t.Sexo,
    dep.NombreDepartamento AS "Departamento",
    pro.NombreProvincia AS "Provincia",
    dis.NombreDistrito AS "Distrito"
  FROM Trabajadores AS t
  INNER JOIN Departamento AS dep ON t.IdDepartamento = dep.Id
  INNER JOIN Provincia AS pro ON t.IdProvincia = pro.Id
  INNER JOIN Distrito AS dis ON t.IdDistrito = dis.Id
END
  
2. Crear Trabajador
   - Mediante un modal con envio de datos con AJAX
   - Validación de campos antes de enviar datos

3. Actualizar Trabajador
   - Mediante un modal con envio de datos con AJAX
   - - Validación de campos antes de enviar datos

4. Eliminar Trabajador
   - Se muestra un mensaje de validación antes de eliminar al trabajador

5. Filtrado
   - Filtrar por sexo masculino o femenimno