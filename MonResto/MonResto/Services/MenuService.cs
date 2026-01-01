using MonResto.Models;
using MonResto.Data;
using MongoDB.Driver;

namespace MonResto.Services
{
    public class MenuService : IMenuService
    {
        private readonly MongoDbContext _context;

        public MenuService(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuItem>> GetAllMenuItemsAsync()
        {
            return await _context.MenuItems.Find(FilterDefinition<MenuItem>.Empty).ToListAsync();
        }

        public async Task<List<MenuItem>> GetAvailableMenuItemsAsync()
        {
            var filter = Builders<MenuItem>.Filter.Eq(m => m.Disponible, true);
            return await _context.MenuItems.Find(filter).ToListAsync();
        }

        public async Task<List<MenuItem>> GetMenuItemsByCategorieAsync(string categorie)
        {
            var filter = Builders<MenuItem>.Filter.And(
                Builders<MenuItem>.Filter.Eq(m => m.Categorie, categorie),
                Builders<MenuItem>.Filter.Eq(m => m.Disponible, true)
            );
            return await _context.MenuItems.Find(filter).ToListAsync();
        }

        public async Task<MenuItem> GetMenuItemByIdAsync(string id)
        {
            var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, id);
            return await _context.MenuItems.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<MenuItem> CreateMenuItemAsync(MenuItem item)
        {
            item.Disponible = true;
            await _context.MenuItems.InsertOneAsync(item);
            return item;
        }

        public async Task<MenuItem> UpdateMenuItemAsync(MenuItem item)
        {
            var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, item.Id);
            var existing = await _context.MenuItems.Find(filter).FirstOrDefaultAsync();
            
            if (existing != null)
            {
                var update = Builders<MenuItem>.Update
                    .Set(m => m.Nom, item.Nom)
                    .Set(m => m.Description, item.Description)
                    .Set(m => m.Prix, item.Prix)
                    .Set(m => m.Categorie, item.Categorie)
                    .Set(m => m.ImageUrl, item.ImageUrl)
                    .Set(m => m.Disponible, item.Disponible);
                
                await _context.MenuItems.UpdateOneAsync(filter, update);
                return await GetMenuItemByIdAsync(item.Id);
            }
            return null;
        }

        public async Task<bool> DeleteMenuItemAsync(string id)
        {
            var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, id);
            var result = await _context.MenuItems.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        public async Task<MenuItem> UpdateDisponibiliteAsync(string id, bool disponible)
        {
            var filter = Builders<MenuItem>.Filter.Eq(m => m.Id, id);
            var update = Builders<MenuItem>.Update.Set(m => m.Disponible, disponible);
            
            await _context.MenuItems.UpdateOneAsync(filter, update);
            return await GetMenuItemByIdAsync(id);
        }
    }
}
