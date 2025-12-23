using MonResto.Models;

namespace MonResto.Services
{
    public interface ICommandeService
    {
        Task<Commande> CreateCommandeAsync(CreateCommandeRequest request);
        Task<List<Commande>> GetAllCommandesAsync();
        Task<List<Commande>> GetCommandesByTableAsync(int tableId);
        Task<Commande> GetCommandeByIdAsync(int id);
        Task<Commande> UpdateStatutAsync(int id, string statut);
    }
}
