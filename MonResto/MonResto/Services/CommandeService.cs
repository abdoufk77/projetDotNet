using MonResto.Models;
using MonResto.Data;
using Microsoft.EntityFrameworkCore;

namespace MonResto.Services
{
    public class CommandeService : ICommandeService
    {
        private readonly AppDbContext _context;

        public CommandeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Commande> CreateCommandeAsync(CreateCommandeRequest request)
        {
            var items = new List<CommandeItem>();
            decimal total = 0;

            foreach (var item in request.Items)
            {
                var menuItem = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == item.MenuItemId);
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

            _context.Commandes.Add(commande);

            var table = await _context.Tables.FirstOrDefaultAsync(t => t.Id == request.TableId);
            if (table != null)
            {
                table.Statut = TableStatut.Reservee;
            }

            await _context.SaveChangesAsync();

            return commande;
        }

        public async Task<List<Commande>> GetAllCommandesAsync()
        {
            return await _context.Commandes
                           .Include(c => c.Items)
                           .OrderByDescending(c => c.DateCommande)
                           .ToListAsync();
        }

        public async Task<List<Commande>> GetCommandesByTableAsync(int tableId)
        {
            return await _context.Commandes
                           .Include(c => c.Items)
                           .Where(c => c.TableId == tableId)
                           .OrderByDescending(c => c.DateCommande)
                           .ToListAsync();
        }

        public async Task<Commande> GetCommandeByIdAsync(int id)
        {
            return await _context.Commandes
                           .Include(c => c.Items)
                           .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Commande> UpdateStatutAsync(int id, string statut)
        {
            var commande = await _context.Commandes.FirstOrDefaultAsync(c => c.Id == id);
            if (commande != null)
            {
                commande.Statut = statut;
                await _context.SaveChangesAsync();
                return commande;
            }
            return null;
        }
    }
}
