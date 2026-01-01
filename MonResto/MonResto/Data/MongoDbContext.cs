using MongoDB.Driver;
using MonResto.Models;

namespace MonResto.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(MongoDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<User> Users => 
            _database.GetCollection<User>("Users");

        public IMongoCollection<Table> Tables => 
            _database.GetCollection<Table>("Tables");

        public IMongoCollection<MenuItem> MenuItems => 
            _database.GetCollection<MenuItem>("MenuItems");

        public IMongoCollection<Commande> Commandes => 
            _database.GetCollection<Commande>("Commandes");
    }
}
