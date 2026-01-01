namespace MonResto.Models
{
    public class CommandeItemRequest
    {
        public string MenuItemId { get; set; }
        public int Quantite { get; set; }
        public string? Notes { get; set; }
    }
}
