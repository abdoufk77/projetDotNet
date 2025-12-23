namespace MonResto.Models
{
    public class CommandeItemRequest
    {
        public int MenuItemId { get; set; }
        public int Quantite { get; set; }
        public string? Notes { get; set; }
    }
}
