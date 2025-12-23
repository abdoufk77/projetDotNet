using MonResto.Models;
using MonResto.Data;
using QRCoder;
using Microsoft.EntityFrameworkCore;

namespace MonResto.Services
{
    public class TableService : ITableService
    {
        private readonly AppDbContext _context;

        public TableService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Table>> GetAllTablesAsync()
        {
            return await _context.Tables.ToListAsync();
        }

        public async Task<Table> GetTableByIdAsync(int id)
        {
            return await _context.Tables.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Table> GetTableByQrCodeAsync(string qrCodeUrl)
        {
            return await _context.Tables.FirstOrDefaultAsync(t => t.QrCodeUrl == qrCodeUrl);
        }

        public async Task<Table> CreateTableAsync(Table table)
        {
            table.QrCodeUrl = $"table-{table.NumeroTable}"; 
            table.Statut = TableStatut.Libre;
            _context.Tables.Add(table);
            await _context.SaveChangesAsync();
            return table;
        }

        public async Task<Table> UpdateTableAsync(Table table)
        {
            var existingTable = await _context.Tables.FirstOrDefaultAsync(t => t.Id == table.Id);
            if (existingTable != null)
            {
                existingTable.NumeroTable = table.NumeroTable;
                existingTable.Statut = table.Statut;
                await _context.SaveChangesAsync();
                return existingTable;
            }
            return null;
        }

        public async Task<bool> DeleteTableAsync(int id)
        {
            var table = await _context.Tables.FirstOrDefaultAsync(t => t.Id == id);
            if (table != null)
            {
                _context.Tables.Remove(table);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<Table> UpdateStatutAsync(int id, string statut)
        {
            var table = await _context.Tables.FirstOrDefaultAsync(t => t.Id == id);
            if (table != null)
            {
                table.Statut = statut;
                await _context.SaveChangesAsync();
                return table;
            }
            return null;
        }

        public async Task<string> GenerateQrCodeUrlAsync(int tableId)
        {
            var table = await GetTableByIdAsync(tableId);
            if (table != null)
            {
                return $"http://localhost:3000/menu/{table.QrCodeUrl}";
            }
            return null;
        }

        public async Task<byte[]> GenerateQrCodeImageAsync(int tableId)
        {
            var url = await GenerateQrCodeUrlAsync(tableId);
            if (url == null)
                return null;

            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                {
                    byte[] qrCodeImage = qrCode.GetGraphic(20);
                    return qrCodeImage;
                }
            }
        }
    }
}
