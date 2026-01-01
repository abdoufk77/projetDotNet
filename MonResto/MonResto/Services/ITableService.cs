using MonResto.Models;

namespace MonResto.Services
{
    public interface ITableService
    {
        Task<List<Table>> GetAllTablesAsync();
        Task<Table> GetTableByIdAsync(string id);
        Task<Table> GetTableByQrCodeAsync(string qrCodeUrl);
        Task<Table> CreateTableAsync(Table table);
        Task<Table> UpdateTableAsync(Table table);
        Task<bool> DeleteTableAsync(string id);
        Task<Table> UpdateStatutAsync(string id, string statut);
        Task<string> GenerateQrCodeUrlAsync(string tableId);
        Task<byte[]> GenerateQrCodeImageAsync(string tableId);
    }
}