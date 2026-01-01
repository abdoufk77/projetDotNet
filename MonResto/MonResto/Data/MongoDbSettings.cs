namespace MonResto.Data
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string UsersCollectionName { get; set; } = "Users";
        public string TablesCollectionName { get; set; } = "Tables";
        public string MenuItemsCollectionName { get; set; } = "MenuItems";
        public string CommandesCollectionName { get; set; } = "Commandes";
    }
}
