using MonResto.Models;
using MonResto.Data;
using MongoDB.Driver;

namespace MonResto.Services
{
    public class CommandeService : ICommandeService
    {
        private readonly MongoDbContext _context;

        public CommandeService(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<Commande> CreateCommandeAsync(CreateCommandeRequest request)
        {
            var items = new List<CommandeItem>();
            decimal total = 0;

            foreach (var item in request.Items)
            {
                var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, item.MenuItemId);
                var menuItem = await _context.MenuItems.Find(filter).FirstOrDefaultAsync();
                
                if (menuItem != null && menuItem.Disponible)
                {
                    var commandeItem = new CommandeItem
                    {
                        MenuItemId = menuItem.Id,
                        Nom = menuItem.Nom,
                        Quantite = item.Quantite,
                        PrixUnitaire = menuItem.Prix,
                        Notes = item.Notes
                    };
                    items.Add(commandeItem);
                    total += menuItem.Prix * item.Quantite;
                }
            }

            var commande = new Commande
            {
                TableId = request.TableId,
                Items = items,
                Total = total,
                Statut = CommandeStatut.EnAttente,
                DateCommande = DateTime.Now,
                Notes = request.Notes
            };

            await _context.Commandes.InsertOneAsync(commande);

            var tableFilter = Builders<Table>.Filter.Eq(t => t.Id, request.TableId);
            var table = await _context.Tables.Find(tableFilter).FirstOrDefaultAsync();
            if (table != null)
            {
                var update = Builders<Table>.Update.Set(t => t.Statut, TableStatut.Reservee);
                await _context.Tables.UpdateOneAsync(tableFilter, update);
            }

            return commande;
        }

        public async Task<List<Commande>> GetAllCommandesAsync()
        {
            var sort = Builders<Commande>.Sort.Descending(c => c.DateCommande);
            return await _context.Commandes.Find(FilterDefinition<Commande>.Empty)
                .Sort(sort)
                .ToListAsync();
        }

        public async Task<List<Commande>> GetCommandesByTableAsync(string tableId)
        {
            var filter = Builders<Commande>.Filter.Eq(c => c.TableId, tableId);
            var sort = Builders<Commande>.Sort.Descending(c => c.DateCommande);
            return await _context.Commandes.Find(filter)
                .Sort(sort)
                .ToListAsync();
        }

        public async Task<Commande> GetCommandeByIdAsync(string id)
        {
            var filter = Builders<Commande>.Filter.Eq(c => c.Id, id);
            return await _context.Commandes.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Commande> UpdateStatutAsync(string id, string statut)
        {
            var filter = Builders<Commande>.Filter.Eq(c => c.Id, id);
            var update = Builders<Commande>.Update.Set(c => c.Statut, statut);
            
            await _context.Commandes.UpdateOneAsync(filter, update);
            return await GetCommandeByIdAsync(id);
        }
    }
}
