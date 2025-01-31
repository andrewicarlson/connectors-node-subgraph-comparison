const ObjectsToCsv = require('objects-to-csv');

const SUPERGRAPH_URL = "http://localhost:8000";

const generateWeatherQuery = (city, country, isConnector = false) => {
    queryName = isConnector ? "getConnectorWeatherData" : "getSubgraphWeatherData";

    return {
        subgraphName: `weather-${isConnector ? "connector" : "subgraph"}`,
        queryName,
        isConnector,
        query: JSON.stringify({
            query: `{ ${queryName}(
                    city: "${city}"
                    country: "${country}"
                ) {
                    conditions
                    snow
                    temperature
                    windSpeed
                }
            }`
        })
    }
}

const generateGeoQuery = (address, city, state, isConnector = false) => {
    queryName = isConnector ? "connectorLocationByAddress" : "subgraphLocationByAddress";

    return {
        subgraphName: `location-${isConnector ? "connector" : "subgraph"}`,
        queryName,
        isConnector,
        query: JSON.stringify({
            query: `{ ${queryName}(address: "${address}", city: "${city}", state: "${state}") {
                    lat
                    long
                }
            }`
        })
    }
}

const generateAddressQuery = (lat, long, isConnector = false) => {
    queryName = isConnector ? "connectorAddressByGeo" : "subgraphAddressByGeo";

    return {
        subgraphName: `location-${isConnector ? "connector" : "subgraph"}`,
        queryName,
        isConnector,
        query: JSON.stringify({
            query: `{ ${queryName}(lat: "${lat}", long: "${long}") {
                    shortFormatted
                    timezone
                }
            }`
        })
    }
}

const generateAddressAndWeatherQuery = (lat, long, isConnector = false) => {
    queryName = isConnector ? "connectorAddressAndWeather" : "subgraphAddressAndWeather";

    return {
        subgraphName: `location-${isConnector ? "weather-connector" : "subgraph"}`,
        queryName,
        isConnector,
        query: JSON.stringify({
            query: `{ ${queryName}(lat: "${lat}", long: "${long}") {
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
            }`
        })
    }
}

const makeRequest = ({query, subgraphName, queryName, isConnector}) => {
    const request = {
        query,
        subgraphName,
        queryName,
        isConnector,
        startTime: Date.now()
    };

    request.fetch = fetch(SUPERGRAPH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: query
    })
    .then(async (response) => {
        request.endTime = Date.now();
        request.results = await response.json();
    });

    return request;
}

(async () => {
    const REQUEST_COUNT_PER_QUERY = 25;
    const queries = [];
    
    for (let i = 0; i < REQUEST_COUNT_PER_QUERY; i++) {
        queries.push(
            generateWeatherQuery("Amsterdam", "Netherlands", true),
            generateWeatherQuery("Amsterdam", "Netherlands", false),
            generateGeoQuery("1600 Pennsylvania Ave NW", "Washington", "DC", true),
            generateGeoQuery("1600 Pennsylvania Ave NW", "Washington", "DC", false),
            generateAddressQuery("38.897675", "-77.036547", true),
            generateAddressQuery("38.897675", "-77.036547", false),
            generateAddressAndWeatherQuery("38.897675", "-77.036547", true),
            generateAddressAndWeatherQuery("38.897675", "-77.036547", false)
        );
    }

    const results = queries.map(query => {
        return makeRequest(query);
    });

    await Promise.all(results.map(result => result.fetch));

    const csv = new ObjectsToCsv(results);
 
    await csv.toDisk('./results.csv');
})();