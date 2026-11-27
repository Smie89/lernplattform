# Container-Image des Mini-Shops – Build-Kontext ist beispiele/shop:
#   docker build -t mini-shop:1.0 -f beispiele/kubernetes/Dockerfile beispiele/shop

# 1. Stufe: mit dem großen SDK bauen
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Erst nur die Projektdateien: Ändert sich nur Code, bleibt der Restore-Layer im Cache
COPY src/Shop.Core/Shop.Core.csproj src/Shop.Core/
COPY src/Shop.Web/Shop.Web.csproj src/Shop.Web/
RUN dotnet restore src/Shop.Web/Shop.Web.csproj
COPY src/ src/
RUN dotnet publish src/Shop.Web/Shop.Web.csproj -c Release -o /app --no-restore

# 2. Stufe: nur die kleine Laufzeitumgebung
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
# Nicht als root laufen – das Basis-Image bringt den Benutzer "app" mit
USER $APP_UID
ENTRYPOINT ["dotnet", "Shop.Web.dll"]
