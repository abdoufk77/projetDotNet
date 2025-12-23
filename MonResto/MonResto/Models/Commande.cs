namespace MonResto.Models
{
    public class Commande
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public List<CommandeItem> Items { get; set; }
        public decimal Total { get; set; }
        public string Statut { get; set; } // EnAttente, EnPreparation, Prete, Servie
        public DateTime DateCommande { get; set; }
        public string? Notes { get; set; }
    }
}
