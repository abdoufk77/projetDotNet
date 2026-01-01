using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MonResto.Models
{
    public class CommandeDto
    {
        public string? Id { get; set; }
        public string TableId { get; set; }
        public int NumeroTable { get; set; }
        public List<CommandeItem> Items { get; set; }
        public decimal Total { get; set; }
        public string Statut { get; set; }
        public DateTime DateCommande { get; set; }
        public string? Notes { get; set; }
    }
}
