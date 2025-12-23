namespace MonResto.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Description { get; set; }
        public decimal Prix { get; set; }
        public string Categorie { get; set; } // Entrée, Plat, Dessert, Boisson
        public string? ImageUrl { get; set; }
        public bool Disponible { get; set; }
    }
}
