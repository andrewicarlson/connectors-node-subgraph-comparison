#!/bin/bash
source ../.env
export VISUAL_CROSSING_API_KEY
export TRIMBLE_API_KEY
export STANDARD_SG_PORT
export CONNECTOR_SG_PORT

OUTPUT_DIR="gogeta_output"

# GraphQL Endpoints
CONNECTOR_ENDPOINT="http://0.0.0.0:$CONNECTOR_SG_PORT/"
STANDARD_ENDPOINT="http://0.0.0.0:$STANDARD_SG_PORT/"

# query names
GEO_BY_ADDRESS_QUERY="geoByAddress"
GEO_BY_ADDRESS_WITH_WEATHER_QUERY="geoAndWeatherByAddress"
ADDRESS_BY_GEO_QUERY="addressByGeo"
WEATHER_QUERY="getWeatherData"

# Number of requests per second
RATE="0"  # requests per second
DURATION="30s"  # Test duration
WORKERS="50"
MAX_WORKERS="50"

mkdir -p $OUTPUT_DIR

jq -n --arg query "$(cat <<EOF
query $GEO_BY_ADDRESS_QUERY {
  geoByAddress(address: "1600 Pennsylvania Ave NW", city: "Washington", state: "DC") {
    lat
    long
  }
}
EOF
)" \
'{
  query: $query
}' > $GEO_BY_ADDRESS_QUERY.json

jq -n --arg query "$(cat <<EOF
query $GEO_BY_ADDRESS_WITH_WEATHER_QUERY {
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
EOF
)" \
'{
  query: $query
}' > $GEO_BY_ADDRESS_WITH_WEATHER_QUERY.json

jq -n --arg query "$(cat <<EOF
query $ADDRESS_BY_GEO_QUERY {
  addressByGeo(lat: "38.897675", long: "-77.036547") {
    shortFormatted
    timezone
  }
}
EOF
)" \
'{
  query: $query
}' > $ADDRESS_BY_GEO_QUERY.json

jq -n --arg query "$(cat <<EOF
query $WEATHER_QUERY {
  getWeatherData(city: "Amsterdam" country: "Netherlands") {
        conditions
        snow
        temperature
        windSpeed
    }
}
EOF
)" \
'{
  query: $query
}' > $WEATHER_QUERY.json

# setup values for iteration
QUERY_FILES=("$GEO_BY_ADDRESS_QUERY.json" "$GEO_BY_ADDRESS_WITH_WEATHER_QUERY.json" "$ADDRESS_BY_GEO_QUERY.json" "$WEATHER_QUERY.json")
ENDPOINTS=("$CONNECTOR_ENDPOINT" "$STANDARD_ENDPOINT")

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
CSV="${OUTPUT_DIR}/latencies_${TIMESTAMP}.csv"

# Add headers to csv
echo "attack, requests, total, mean, 50th, 90th, 95th, 99th, max, min" > $CSV

for QF in "${QUERY_FILES[@]}"; do
  for ENDPOINT in "${ENDPOINTS[@]}"; do
    echo "Running with QUERY_FILE: $QF and CONNECTOR_ENDPOINT: $CONNECTOR_ENDPOINT"
    if [ "$ENDPOINT" == "$CONNECTOR_ENDPOINT" ]; then
      CONNECTOR_SUFFIX="connector"
      BIN_FILE="${QF}_${CONNECTOR_SUFFIX}.bin"
    else
      BIN_FILE="$QF.bin"
    fi

    echo "Testing $ENDPOINT..."

    echo "POST $ENDPOINT
    Content-Type: application/json
    @./$QF" | gogeta attack \
        -rate=$RATE \
        -duration=$DURATION \
        -name=$BIN_FILE \
        -max-workers=$MAX_WORKERS \
        -workers=$WORKERS \
    | tee $OUTPUT_DIR/$BIN_FILE | gogeta encode -protocol=gql | gogeta report
  
    # add to a csv
    gogeta encode -protocol gql $OUTPUT_DIR/$BIN_FILE \
    | gogeta report -type=json \
    | jq -r --arg file "$BIN_FILE" '
    [
      $file,
      .requests,
      .latencies.total, 
      .latencies.mean, 
      .latencies."50th", 
      .latencies."90th", 
      .latencies."95th", 
      .latencies."99th", 
      .latencies.max, 
      .latencies.min
    ] 
    | @csv' >> $CSV

    echo ""
    sleep 1
  done
done