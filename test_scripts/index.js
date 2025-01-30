const ObjectsToCsv = require('objects-to-csv');

const SUPERGRAPH_URL = "http://localhost:8000";

const generateWeatherQuery = (date, time, city, country, isConnector = false) => {
    queryName = isConnector ? "getConnectorWeatherData" : "getSubgraphWeatherData";

    return {
        subgraph: `weather-${isConnector ? "connector" : "subgraph"}`,
        queryName,
        query: JSON.stringify({
            query: `{ ${queryName}(
                    date: "${date}"
                    time: "${time}"
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
        subgraph: `location-${isConnector ? "connector" : "subgraph"}`,
        queryName,
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
        query: JSON.stringify({
            query: `{ ${queryName}(lat: "${lat}", long: "${long}") {
                    shortFormatted
                    timezone
                }
            }`
        })
    }
}

const makeRequest = ({query, subgraphName, queryName}) => {
    const request = {
        query,
        subgraphName,
        queryName,
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
        request.msElapsed = request.endtime - request.startTime;
        request.results = await response.json();
    });

    return request;
}

(async () => {
    const REQUEST_COUNT_PER_QUERY = 5;
    const queries = [];
    
    for (let i = 0; i < REQUEST_COUNT_PER_QUERY; i++) {
        queries.push(
            generateWeatherQuery("2025-01-28", "14:00:00", "Amsterdam", "Netherlands", true),
            // generateWeatherQuery("2025-01-28", "14:00:00", "Amsterdam", "Netherlands", false),
            // generateGeoQuery("1600 Pennsylvania Ave NW", "Washington", "DC", true),
            // generateGeoQuery("1600 Pennsylvania Ave NW", "Washington", "DC", false),
            // generateAddressQuery("38.897675", "-77.036547", true),
            // generateAddressQuery("38.897675", "-77.036547", false)
        );
    }

    const results = queries.map(query => {
        return makeRequest(query);
    });

    await Promise.all(results.map(result => result.fetch));

    const csv = new ObjectsToCsv(results);
 
    await csv.toDisk('./test.csv');
    
    // const res = makeRequest(query.query);

    // await Promise.all(allFetches);

    // console.log(results);
})();