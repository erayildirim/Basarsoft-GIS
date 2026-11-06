namespace Basarsoft.Dtos
{
    public class PagedRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? GeometryType { get; set; } 
    }
}