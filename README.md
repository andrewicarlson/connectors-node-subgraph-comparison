This repository contains a supergraph that compares Apollo Connectors to a traditional subgraph passthrough to a JSON over HTTP service. 

## Caveats:

1. These are trivial examples and don't (yet) fully represent the complexity that can be expressed in either a REST connector nor the complexity that can be developed in an imperative subgraph server.
1. The types in this supergraph are intentionally not `@shared` or associated in any way between the Connector version and Subgraph representation of the same query.

## Set up
1. Get API keys from [Trimble](https://developer.trimblemaps.com/forms/get-an-api-key) and [Visual Crossing](https://www.visualcrossing.com/weather/weather-data-services)
1. Copy `.env.example` to `.env` and update the required environment variables. 
1. In the project root run `docker-compose up` to start the required subgraphs. 
1. Run `sh ./start_connector_router.sh` from the project root to start the connectors router in development mode (on port `8080`).
1. After the subgraphs are running, run `sh ./start_connector_router.sh` from the project root to start the subgraphs router in development mode (on port `8000`).
1. Issue queries using Postman, Sandbox, or a client of your choice.

## Example queries
```
query geoByAddress {
  geoByAddress(address: "1600 Pennsylvania Ave NW", city: "Washington", state: "DC") {
    lat
    long
  }
}

query geoAndWeatherByAddress {
  geoByAddress(address: "1600 Pennsylvania Ave NW", city: "Washington", state: "DC") {
    lat
    long
    weather {
        conditions
        snow
        temperature
        windSpeed
    }
  }
}

query addressByGeo {
  addressByGeo(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
  }
}

query getWeatherData {
    getWeatherData(city: "Amsterdam" country: "Netherlands") {
        conditions
        snow
        temperature
        windSpeed
    }
}
```