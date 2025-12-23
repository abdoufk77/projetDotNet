using Microsoft.EntityFrameworkCore;
using MonResto.Models;

namespace MonResto.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Commande> Commandes { get; set; }
        public DbSet<CommandeItem> CommandeItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure CommandeItem
            modelBuilder.Entity<CommandeItem>()
                .Property(ci => ci.PrixUnitaire)
                .HasColumnType("decimal(18,2)");
            
            // Configure Commande
             modelBuilder.Entity<Commande>()
                .Property(c => c.Total)
                .HasColumnType("decimal(18,2)");

             // Configure MenuItem
             modelBuilder.Entity<MenuItem>()
                .Property(m => m.Prix)
                .HasColumnType("decimal(18,2)");

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Password = "admin123",
                    Role = UserRole.Admin,
                    FullName = "Administrateur Principal"
                },
                new User
                {
                    Id = 2,
                    Username = "serveur1",
                    Password = "serveur123",
                    Role = UserRole.Serveur,
                    FullName = "Jean Dupont"
                },
                new User
                {
                    Id = 3,
                    Username = "chef1",
                    Password = "chef123",
                    Role = UserRole.Cuisinier,
                    FullName = "Marie Cuisinier"
                }
            );

            // Seed Tables
            modelBuilder.Entity<Table>().HasData(
                new Table { Id = 1, NumeroTable = 1, Statut = TableStatut.Libre, QrCodeUrl = "table-1" },
                new Table { Id = 2, NumeroTable = 2, Statut = TableStatut.Libre, QrCodeUrl = "table-2" },
                new Table { Id = 3, NumeroTable = 3, Statut = TableStatut.Libre, QrCodeUrl = "table-3" },
                new Table { Id = 4, NumeroTable = 4, Statut = TableStatut.Libre, QrCodeUrl = "table-4" },
                new Table { Id = 5, NumeroTable = 5, Statut = TableStatut.Libre, QrCodeUrl = "table-5" },
                new Table { Id = 6, NumeroTable = 6, Statut = TableStatut.Libre, QrCodeUrl = "table-6" }
            );

            // Seed MenuItems
            modelBuilder.Entity<MenuItem>().HasData(
                new MenuItem { Id = 1, Nom = "Salade César", Description = "Laitue, poulet, parmesan, croûtons", Prix = 85.00m, Categorie = MenuCategorie.Entree, Disponible = true },
                new MenuItem { Id = 2, Nom = "Soupe à l'oignon", Description = "Gratinée au fromage", Prix = 65.00m, Categorie = MenuCategorie.Entree, Disponible = true },
                new MenuItem { Id = 3, Nom = "Tajine poulet", Description = "Poulet aux olives et citron confit", Prix = 120.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                new MenuItem { Id = 4, Nom = "Couscous royal", Description = "Viandes variées et légumes", Prix = 150.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                new MenuItem { Id = 5, Nom = "Pastilla au poulet", Description = "Feuilleté sucré-salé", Prix = 95.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                new MenuItem { Id = 6, Nom = "Tiramisu", Description = "Dessert italien classique", Prix = 45.00m, Categorie = MenuCategorie.Dessert, Disponible = true },
                new MenuItem { Id = 7, Nom = "Crème brûlée", Description = "Dessert français traditionnel", Prix = 40.00m, Categorie = MenuCategorie.Dessert, Disponible = true },
                new MenuItem { Id = 8, Nom = "Coca-Cola", Description = "33cl", Prix = 15.00m, Categorie = MenuCategorie.Boisson, Disponible = true },
                new MenuItem { Id = 9, Nom = "Jus d'orange frais", Description = "Pressé minute", Prix = 25.00m, Categorie = MenuCategorie.Boisson, Disponible = true },
                new MenuItem { Id = 10, Nom = "Thé à la menthe", Description = "Traditionnel marocain", Prix = 15.00m, Categorie = MenuCategorie.Boisson, Disponible = true }
            );
        }
    }
}
