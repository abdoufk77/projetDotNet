using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MonResto.Models
{
    public class Commande
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string TableId { get; set; } = string.Empty;
        public List<CommandeItem> Items { get; set; } = new List<CommandeItem>();
        public decimal Total { get; set; }
        public string Statut { get; set; } = "EnAttente";
        public DateTime DateCommande { get; set; } = DateTime.Now;
        public string? Notes { get; set; }
    }
}
