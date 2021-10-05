#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:5 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:5 AS build
WORKDIR /src
COPY ["OfficeQuotesBlazor/OfficeQuotesBlazor.csproj", "OfficeQuotesBlazor/"]
RUN dotnet restore "OfficeQuotesBlazor/OfficeQuotesBlazor.csproj"
COPY . .
WORKDIR "/src/OfficeQuotesBlazor"
RUN dotnet build "OfficeQuotesBlazor.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OfficeQuotesBlazor.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OfficeQuotesBlazor.dll"]