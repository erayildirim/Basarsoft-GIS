# Single-container build: the React app is compiled and served as static files
# by the ASP.NET Core API, so the whole project runs as one web service.

# ---------- 1. Build the React frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- 2. Build and publish the ASP.NET Core API ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend
WORKDIR /src
COPY Basarsoft/Basarsoft.csproj Basarsoft/
RUN dotnet restore Basarsoft/Basarsoft.csproj
COPY Basarsoft/ Basarsoft/
RUN dotnet publish Basarsoft/Basarsoft.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---------- 3. Runtime image ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend /app/publish ./
COPY --from=frontend /src/frontend/build ./wwwroot

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

# Run as the non-root user that ships with the official .NET images.
USER $APP_UID

ENTRYPOINT ["dotnet", "Basarsoft.dll"]
