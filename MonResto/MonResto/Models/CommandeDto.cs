using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MonResto.Models
{
    public class CommandeDto
    {
        public string? Id { get; set; }
        public string TableId { get; set; } = string.Empty;
        public int NumeroTable { get; set; }
        public List<CommandeItem> Items { get; set; } = new();
        public decimal Total { get; set; }
        public string Statut { get; set; } = string.Empty;
        public DateTime DateCommande { get; set; } = DateTime.Now;
        public string? Notes { get; set; }
    }
}
