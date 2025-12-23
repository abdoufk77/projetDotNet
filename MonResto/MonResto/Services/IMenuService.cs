using MonResto.Models;

namespace MonResto.Services
{
    public interface IMenuService
    {
        Task<List<MenuItem>> GetAllMenuItemsAsync();
        Task<List<MenuItem>> GetAvailableMenuItemsAsync();
        Task<List<MenuItem>> GetMenuItemsByCategorieAsync(string categorie);
        Task<MenuItem> GetMenuItemByIdAsync(int id);
        Task<MenuItem> CreateMenuItemAsync(MenuItem item);
        Task<MenuItem> UpdateMenuItemAsync(MenuItem item);
        Task<bool> DeleteMenuItemAsync(int id);
        Task<MenuItem> UpdateDisponibiliteAsync(int id, bool disponible);
    }
}