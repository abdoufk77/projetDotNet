using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MonResto.Models
{
    public class MenuItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string Nom { get; set; }
        public string Description { get; set; }
        public decimal Prix { get; set; }
        public string Categorie { get; set; } // Entrée, Plat, Dessert, Boisson
        public string? ImageUrl { get; set; }
        public bool Disponible { get; set; }
    }
}
