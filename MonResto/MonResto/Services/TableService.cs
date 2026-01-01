using MonResto.Models;
using MonResto.Data;
using QRCoder;
using MongoDB.Driver;

namespace MonResto.Services
{
    public class TableService : ITableService
    {
        private readonly MongoDbContext _context;

        public TableService(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<List<Table>> GetAllTablesAsync()
        {
            return await _context.Tables.Find(FilterDefinition<Table>.Empty).ToListAsync();
        }

        public async Task<Table> GetTableByIdAsync(string id)
        {
            var filter = Builders<Table>.Filter.Eq(t => t.Id, id);
            return await _context.Tables.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Table> GetTableByQrCodeAsync(string qrCodeUrl)
        {
            var filter = Builders<Table>.Filter.Eq(t => t.QrCodeUrl, qrCodeUrl);
            return await _context.Tables.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Table> CreateTableAsync(Table table)
        {
            table.QrCodeUrl = $"table-{table.NumeroTable}"; 
            table.Statut = TableStatut.Libre;
            await _context.Tables.InsertOneAsync(table);
            return table;
        }

        public async Task<Table> UpdateTableAsync(Table table)
        {
            var filter = Builders<Table>.Filter.Eq(t => t.Id, table.Id);
            var existingTable = await _context.Tables.Find(filter).FirstOrDefaultAsync();
            
            if (existingTable != null)
            {
                var update = Builders<Table>.Update
                    .Set(t => t.NumeroTable, table.NumeroTable)
                    .Set(t => t.Statut, table.Statut);
                
                await _context.Tables.UpdateOneAsync(filter, update);
                return await GetTableByIdAsync(table.Id);
            }
            return null;
        }

        public async Task<bool> DeleteTableAsync(string id)
        {
            var filter = Builders<Table>.Filter.Eq(t => t.Id, id);
            var result = await _context.Tables.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        public async Task<Table> UpdateStatutAsync(string id, string statut)
        {
            var filter = Builders<Table>.Filter.Eq(t => t.Id, id);
            var update = Builders<Table>.Update.Set(t => t.Statut, statut);
            
            await _context.Tables.UpdateOneAsync(filter, update);
            return await GetTableByIdAsync(id);
        }

        public async Task<string> GenerateQrCodeUrlAsync(string tableId)
        {
            var table = await GetTableByIdAsync(tableId);
            if (table != null)
            {
                return $"http://localhost:3000/menu/{table.QrCodeUrl}";
            }
            return null;
        }

        public async Task<byte[]> GenerateQrCodeImageAsync(string tableId)
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
