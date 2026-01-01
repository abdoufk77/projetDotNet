using MongoDB.Driver;
using MonResto.Models;

namespace MonResto.Data
{
    public class MongoDbSeeder
    {
        private readonly MongoDbContext _context;

        public MongoDbSeeder(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            // Seed Users
            var usersCount = await _context.Users.CountDocumentsAsync(FilterDefinition<User>.Empty);
            if (usersCount == 0)
            {
                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        Password = "admin123",
                        Role = UserRole.Admin,
                        FullName = "Administrateur Principal"
                    },
                    new User
                    {
                        Username = "serveur1",
                        Password = "serveur123",
                        Role = UserRole.Serveur,
                        FullName = "Jean Dupont"
                    },
                    new User
                    {
                        Username = "chef1",
                        Password = "chef123",
                        Role = UserRole.Cuisinier,
                        FullName = "Marie Cuisinier"
                    }
                };
                await _context.Users.InsertManyAsync(users);
            }

            // Seed Tables
            var tablesCount = await _context.Tables.CountDocumentsAsync(FilterDefinition<Table>.Empty);
            if (tablesCount == 0)
            {
                var tables = new List<Table>
                {
                    new Table { NumeroTable = 1, Statut = TableStatut.Libre, QrCodeUrl = "table-1" },
                    new Table { NumeroTable = 2, Statut = TableStatut.Libre, QrCodeUrl = "table-2" },
                    new Table { NumeroTable = 3, Statut = TableStatut.Libre, QrCodeUrl = "table-3" },
                    new Table { NumeroTable = 4, Statut = TableStatut.Libre, QrCodeUrl = "table-4" },
                    new Table { NumeroTable = 5, Statut = TableStatut.Libre, QrCodeUrl = "table-5" },
                    new Table { NumeroTable = 6, Statut = TableStatut.Libre, QrCodeUrl = "table-6" }
                };
                await _context.Tables.InsertManyAsync(tables);
            }

            // Seed MenuItems
            var menuItemsCount = await _context.MenuItems.CountDocumentsAsync(FilterDefinition<MenuItem>.Empty);
            if (menuItemsCount == 0)
            {
                var menuItems = new List<MenuItem>
                {
                    new MenuItem { Nom = "Salade César", Description = "Laitue, poulet, parmesan, croûtons", Prix = 85.00m, Categorie = MenuCategorie.Entree, Disponible = true },
                    new MenuItem { Nom = "Soupe à l'oignon", Description = "Gratinée au fromage", Prix = 65.00m, Categorie = MenuCategorie.Entree, Disponible = true },
                    new MenuItem { Nom = "Tajine poulet", Description = "Poulet aux olives et citron confit", Prix = 120.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                    new MenuItem { Nom = "Couscous royal", Description = "Viandes variées et légumes", Prix = 150.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                    new MenuItem { Nom = "Pastilla au poulet", Description = "Feuilleté sucré-salé", Prix = 95.00m, Categorie = MenuCategorie.Plat, Disponible = true },
                    new MenuItem { Nom = "Tiramisu", Description = "Dessert italien classique", Prix = 45.00m, Categorie = MenuCategorie.Dessert, Disponible = true },
                    new MenuItem { Nom = "Crème brûlée", Description = "Dessert français traditionnel", Prix = 40.00m, Categorie = MenuCategorie.Dessert, Disponible = true },
                    new MenuItem { Nom = "Coca-Cola", Description = "33cl", Prix = 15.00m, Categorie = MenuCategorie.Boisson, Disponible = true },
                    new MenuItem { Nom = "Jus d'orange frais", Description = "Pressé minute", Prix = 25.00m, Categorie = MenuCategorie.Boisson, Disponible = true },
                    new MenuItem { Nom = "Thé à la menthe", Description = "Traditionnel marocain", Prix = 15.00m, Categorie = MenuCategorie.Boisson, Disponible = true }
                };
                await _context.MenuItems.InsertManyAsync(menuItems);
            }
        }
    }
}
