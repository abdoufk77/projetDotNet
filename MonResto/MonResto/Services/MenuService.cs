using MonResto.Models;
using MonResto.Data;
using Microsoft.EntityFrameworkCore;

namespace MonResto.Services
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;

        public MenuService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuItem>> GetAllMenuItemsAsync()
        {
            return await _context.MenuItems.ToListAsync();
        }

        public async Task<List<MenuItem>> GetAvailableMenuItemsAsync()
        {
            return await _context.MenuItems.Where(m => m.Disponible).ToListAsync();
        }

        public async Task<List<MenuItem>> GetMenuItemsByCategorieAsync(string categorie)
        {
            return await _context.MenuItems.Where(m => m.Categorie == categorie && m.Disponible).ToListAsync();
        }

        public async Task<MenuItem> GetMenuItemByIdAsync(int id)
        {
            return await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MenuItem> CreateMenuItemAsync(MenuItem item)
        {
            item.Disponible = true;
            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<MenuItem> UpdateMenuItemAsync(MenuItem item)
        {
            var existing = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == item.Id);
            if (existing != null)
            {
                existing.Nom = item.Nom;
                existing.Description = item.Description;
                existing.Prix = item.Prix;
                existing.Categorie = item.Categorie;
                existing.ImageUrl = item.ImageUrl;
                existing.Disponible = item.Disponible;
                await _context.SaveChangesAsync();
                return existing;
            }
            return null;
        }

        public async Task<bool> DeleteMenuItemAsync(int id)
        {
            var item = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
            if (item != null)
            {
                _context.MenuItems.Remove(item);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<MenuItem> UpdateDisponibiliteAsync(int id, bool disponible)
        {
            var item = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
            if (item != null)
            {
                item.Disponible = disponible;
                await _context.SaveChangesAsync();
                return item;
            }
            return null;
        }
    }
}
