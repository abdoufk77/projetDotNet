namespace MonResto.Models
{
    public class Table
    {
        public int Id { get; set; }
        public int NumeroTable { get; set; }
        //public int Capacite { get; set; } supprimer ce champe
        public string Statut { get; set; } // Libre, Occupée, Réservée
        //public string? ServeurAssigne { get; set; } supprimer ce champe
        public string? QrCodeUrl { get; set; }
        public string? SessionId { get; set; } // Pour tracker la session client
    }
}
