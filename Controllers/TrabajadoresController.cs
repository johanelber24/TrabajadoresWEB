using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TrabajadoresWEB.Data;
using TrabajadoresWEB.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TrabajadoresWEB.Controllers
{
    public class TrabajadoresController : Controller
    {
        private readonly AppDbContext _context;

        public TrabajadoresController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Trabajadores
        public async Task<IActionResult> Index()
        {
            var resultado = new List<TrabajadorViewModel>();

            using (var conexion = _context.Database.GetDbConnection())
            {
                await conexion.OpenAsync();

                using (var command = conexion.CreateCommand())
                {
                    command.CommandText = "usp_ListarTrabajadores";
                    command.CommandType = System.Data.CommandType.StoredProcedure;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            resultado.Add(new TrabajadorViewModel
                            {
                                Id = reader.GetInt32(0),
                                TipoDocumento = reader.GetString(1),
                                NumeroDocumento = reader.GetString(2),
                                Nombres = reader.GetString(3),
                                Sexo = reader.GetString(4),
                                Departamento = reader.GetString(5),
                                Provincia = reader.GetString(6),
                                Distrito = reader.GetString(7)
                            });
                        }
                    }
                }
            }

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(new { success = true, data = resultado });
            }

            return View(resultado);
        }

        // OBTENER TRABAJADORES JSON
        [HttpGet]
        public async Task<JsonResult> ObtenerTrabajadores()
        {
            var resultado = new List<TrabajadorViewModel>();

            using (var conexion = _context.Database.GetDbConnection())
            {
                await conexion.OpenAsync();

                using (var command = conexion.CreateCommand())
                {
                    command.CommandText = "usp_ListarTrabajadores";
                    command.CommandType = System.Data.CommandType.StoredProcedure;

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            resultado.Add(new TrabajadorViewModel
                            {
                                Id = reader.GetInt32(0),
                                TipoDocumento = reader.GetString(1),
                                NumeroDocumento = reader.GetString(2),
                                Nombres = reader.GetString(3),
                                Sexo = reader.GetString(4),
                                Departamento = reader.GetString(5),
                                Provincia = reader.GetString(6),
                                Distrito = reader.GetString(7)
                            });
                        }
                    }
                }
            }

            return Json(resultado);
        }

        // OBTENER DEPARTAMENTOS JSON
        [HttpGet]
        public JsonResult ObtenerDepartamentos()
        {
            var departamentos = _context.Departamento
                .Select(dep => new
                {
                    dep.Id,
                    dep.NombreDepartamento
                })
                .ToList();

            return Json(departamentos);
        }

        // OBTENER RUTAS JSON
        [HttpGet]
        public JsonResult ObtenerProvincias(int idDepartamento)
        {
            var provincias = _context.Provincia
                .Where(prov => prov.IdDepartamento == idDepartamento)
                .Select(prov => new
                {
                    prov.Id,
                    prov.IdDepartamento,
                    prov.NombreProvincia
                })
                .ToList();

            return Json(provincias);
        }

        // OBTENER DISTRITOS JSON
        [HttpGet]
        public JsonResult ObtenerDistritos(int idProvincia)
        {
            var distritos = _context.Distrito
                .Where(dis => dis.IdProvincia == idProvincia)
                .Select(dis => new
                {
                    dis.Id,
                    dis.IdProvincia,
                    dis.NombreDistrito
                })
                .ToList();

            return Json(distritos);
        }

        // OBTENER TRABAJADOR POR ID
        [HttpGet]
        public async Task<JsonResult> ObtenerPorId(int id)
        {
            var trabajador = await _context.Trabajadores
                    .Where(tra => tra.Id == id)
                    .Select(tra => new
                    {
                        tra.Id,
                        tra.TipoDocumento,
                        tra.NumeroDocumento,
                        tra.Nombres,
                        tra.Sexo,
                        tra.IdDepartamento,
                        tra.IdProvincia,
                        tra.IdDistrito
                    })
                    .FirstOrDefaultAsync();

            if(trabajador == null)
            {
                return Json(null);
            }

            return Json(trabajador);
        }

        // ELIMINAR TRABAJADOR CON RESPUESTA JSON
        [HttpPost]
        public async Task<JsonResult> Eliminar(int id)
        {
            var trabajador = await _context.Trabajadores.FindAsync(id);
            if (trabajador == null)
            {
                return Json(new { success = false, message = "Trabajador no encontrado" });
            }

            _context.Trabajadores.Remove(trabajador);
            await _context.SaveChangesAsync();

            return Json(new { success = true });
        }


        // POST: Trabajadores/Create - CREAR TRABAJADOR
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,TipoDocumento,NumeroDocumento,Nombres,Sexo,IdDepartamento,IdProvincia,IdDistrito")] Trabajador trabajador)
        {
            if (ModelState.IsValid)
            {
                _context.Add(trabajador);
                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Trabajador guardado correctamente" });
            }

            return Json(new { success = false, message = "Modelo inválido", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
        }


        // POST: Trabajadores/Edit/5 - ACTUALIZAR TRABAJADOR
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,TipoDocumento,NumeroDocumento,Nombres,Sexo,IdDepartamento,IdProvincia,IdDistrito")] Trabajador trabajador)
        {
            if (id != trabajador.Id)
            {
                return Json(new { success = false, message = "ID no válido" });
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(trabajador);
                    await _context.SaveChangesAsync();
                    return Json(new { success = true, message = "Trabajador editado correctamente" });

                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!TrabajadorExists(trabajador.Id))
                    {
                        return Json(new { success = false, message = "Trabajador no encontrado" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Error de concurrencia" });
                    }
                }
            }

            var errores = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return Json(new { success = false, message = "Modelo inválido", errors = errores });
        }

        private bool TrabajadorExists(int id)
        {
            return _context.Trabajadores.Any(e => e.Id == id);
        }
    }
}
