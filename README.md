This repository contains a supergraph that compares Apollo Connectors to a traditional subgraph passthrough to a JSON over HTTP service. 

## Caveats:

1. These are trivial examples and don't (yet) fully represent the complexity that can be expressed in either a REST connector nor the complexity that can be developed in an imperative subgraph server.

## Set up
1. Copy `.env.example` to `.env` and update the required environment variables. 
2. In the project root run `docker-compose up` to start the required subgraphs. 
3. After the subgraphs are running, run `sh ./start_router.sh` from the project root to start the router in development mode.
4. Issue queries using Postman, Sandbox, or a client of your choice.

## Example queries
### Weather
#### Subgraph
```graphql
query GetWeatherData {
    GetSubgraphWeatherData(
        date: "2025-01-28"
        time: "14:00:00"
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
    GetConnectorWeatherData(
        date: "2025-01-28"
        time: "14:00:00"
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

```
#### Connector
```graphql

```