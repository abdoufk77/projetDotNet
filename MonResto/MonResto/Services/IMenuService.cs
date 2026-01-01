using MonResto.Models;

namespace MonResto.Services
{
    public interface IMenuService
    {
        Task<List<MenuItem>> GetAllMenuItemsAsync();
        Task<List<MenuItem>> GetAvailableMenuItemsAsync();
        Task<List<MenuItem>> GetMenuItemsByCategorieAsync(string categorie);
        Task<MenuItem> GetMenuItemByIdAsync(string id);
        Task<MenuItem> CreateMenuItemAsync(MenuItem item);
        Task<MenuItem> UpdateMenuItemAsync(MenuItem item);
        Task<bool> DeleteMenuItemAsync(string id);
        Task<MenuItem> UpdateDisponibiliteAsync(string id, bool disponible);
    }
}