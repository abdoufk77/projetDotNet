using MonResto.Models;

namespace MonResto.Services
{
    public interface ICommandeService
    {
        Task<Commande> CreateCommandeAsync(CreateCommandeRequest request);
        Task<List<Commande>> GetAllCommandesAsync();
        Task<List<Commande>> GetCommandesByTableAsync(string tableId);
        Task<Commande> GetCommandeByIdAsync(string id);
        Task<Commande> UpdateStatutAsync(string id, string statut);
    }
}
