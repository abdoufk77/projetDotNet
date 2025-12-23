using MonResto.Models;

namespace MonResto.Services
{
    public interface ITableService
    {
        Task<List<Table>> GetAllTablesAsync();
        Task<Table> GetTableByIdAsync(int id);
        Task<Table> GetTableByQrCodeAsync(string qrCodeUrl);
        Task<Table> CreateTableAsync(Table table);
        Task<Table> UpdateTableAsync(Table table);
        Task<bool> DeleteTableAsync(int id);
        Task<Table> UpdateStatutAsync(int id, string statut);
        Task<string> GenerateQrCodeUrlAsync(int tableId);
        Task<byte[]> GenerateQrCodeImageAsync(int tableId);
    }
}