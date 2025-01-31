This repository contains a supergraph that compares Apollo Connectors to a traditional subgraph passthrough to a JSON over HTTP service. 

## Caveats:

1. These are trivial examples and don't (yet) fully represent the complexity that can be expressed in either a REST connector nor the complexity that can be developed in an imperative subgraph server.
1. The types in this supergraph are intentionally not `@shared` or associated in any way between the Connector version and Subgraph representation of the same query.

## Set up
1. Get API keys from [Trimble](https://developer.trimblemaps.com/forms/get-an-api-key) and [Visual Crossing](https://www.visualcrossing.com/weather/weather-data-services)
1. Copy `.env.example` to `.env` and update the required environment variables. 
1. In the project root run `docker-compose up` to start the required subgraphs. 
1. After the subgraphs are running, run `sh ./start_router.sh` from the project root to start the router in development mode.
1. Issue queries using Postman, Sandbox, or a client of your choice.

## Example queries
### Weather
#### Subgraph
```graphql
query GetWeatherData {
    getSubgraphWeatherData(
        city: "Amsterdam"
        country: "Netherlands"
    ) {
        conditions
        snow
        temperature
        windSpeed
    }
}
```
#### Connector
```graphql
query GetWeatherData {
    getConnectorWeatherData(
        city: "Amsterdam"
        country: "Netherlands"
    ) {
        conditions
        snow
        temperature
        windSpeed
    }
}
```

### Location
#### Subgraph
```graphql
query locationByAddress {
  subgraphLocationByAddress(address: "1600 Pennsylvania Ave NW", city: "Washington", state: "DC") {
    lat
    long
  }
}

query locationByLatLng {
  subgraphAddressByGeo(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
  }
}
```
#### Connector
```graphql
query locationByAddress {
  connectorLocationByAddress(address: "1600 Pennsylvania Ave NW", city: "Washington", state: "DC") {
    lat
    long
  }
}

query locationByLatLng {
  connectorAddressByGeo(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
  }
}
```
### Location and Weather join
#### Subgraph
```graphql
query addressAndWeather {
  subgraphAddressByGeo(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
    city
    country
    weather {
      snow
      temperature
      windSpeed
      conditions
    }
  }
}
```

#### Connector
Note that this is in a totally separate subgraph and doesn't use entities because resolving entities within a connector across subgraphs isn't currently supported. 

```graphql
query addressAndWeather {
  connectorAddressAndWeather(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
    city
    country
    weather {
      snow
      temperature
      windSpeed
      conditions
    }
  }
}
```