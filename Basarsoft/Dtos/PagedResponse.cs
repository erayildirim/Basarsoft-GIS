namespace Basarsoft.Dtos
{
    public class PagedResponse<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public string? SearchTerm { get; set; }
        public string? GeometryType { get; set; }

        public PagedResponse(List<T> data, int page, int pageSize, int totalCount, string? searchTerm = null, string? geometryType = null)
        {
            Data = data;
            Page = page;
            PageSize = pageSize;
            TotalCount = totalCount;
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            HasNextPage = page < TotalPages;
            HasPreviousPage = page > 1;
            SearchTerm = searchTerm;
            GeometryType = geometryType;
        }
    }
}