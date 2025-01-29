2025-01-28

Weatherdata REST API:
------------------------------------------------
https://www.visualcrossing.com/

Sign-up for an API key here:
https://www.visualcrossing.com/sign-up

For more information on the API:
https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/


To start rover dev with configuration:
---------------------------------------------
  APOLLO_KEY={YOUR-APOLLO-KEY} \
  APOLLO_GRAPH_REF={YOUR-GRAPH-REF} \
  APOLLO_ROVER_DEV_ROUTER_VERSION=2.0.0-preview.4 \
  rover dev --router-config router.yaml --supergraph-config supergraph.yaml --supergraph-port {YOUR-PORT-OF-CHOICE}


To use the API
---------------------------------------------
Run the GetWeatherData Query
with the following input parameters
    date:"YYYY-MM-DD" 
    time:"HH:MM:SS"
    city: "Amsterdam" (example)
    country: "Netherlands" (example)

Example:
query GetWeatherData{
  GetWeatherData(date: "2025-01-28", time: "14:00:00", city: "Amsterdam", country: "Netherlands") 
  {
    conditions
    snow
    temperature
    windSpeed
  }
}

