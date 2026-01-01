namespace MonResto.Models
{
    public class CreateCommandeRequest
    {
        public string TableId { get; set; }
        public List<CommandeItemRequest> Items { get; set; }
        public string? Notes { get; set; }
    }
}
