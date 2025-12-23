namespace MonResto.Models
{
    public class CommandeItem
    {
        public int Id { get; set; }
        public int CommandeId { get; set; }
        public int MenuItemId { get; set; }
        public string Nom { get; set; }
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public string? Notes { get; set; }
    }
}
