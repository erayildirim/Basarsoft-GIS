namespace Basarsoft
{
    public class Response<T>
    {
        public T Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }

        public Response(T data)
        {
            Data = data;
            Success = true;
        }

        public Response(string message)
        {
            Success = false;
            Message = message;
        }
    }
}
