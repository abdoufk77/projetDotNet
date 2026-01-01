using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MonResto.Models
{
    public class CommandeItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string CommandeId { get; set; } = string.Empty;
        public string MenuItemId { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public string? Notes { get; set; }
    }
}
