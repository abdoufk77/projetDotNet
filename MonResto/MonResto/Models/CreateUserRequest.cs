using System.ComponentModel.DataAnnotations;

namespace MonResto.Models
{
    public class CreateUserRequest
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string FullName { get; set; }
    }
}
