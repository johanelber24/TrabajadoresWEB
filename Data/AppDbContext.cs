using Microsoft.EntityFrameworkCore;
using TrabajadoresWEB.Models;

namespace TrabajadoresWEB.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Trabajador> Trabajadores { get; set; }
        public DbSet<Departamento> Departamento { get; set; }
        public DbSet<Provincia> Provincia { get; set; }
        public DbSet<Distrito> Distrito { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Trabajador>().ToTable("Trabajadores");
            modelBuilder.Entity<Departamento>().ToTable("Departamento");
            modelBuilder.Entity<Provincia>().ToTable("Provincia");
            modelBuilder.Entity<Distrito>().ToTable("Distrito");
        }
    }
}
