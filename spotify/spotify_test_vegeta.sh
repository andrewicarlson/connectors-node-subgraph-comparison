#!/bin/bash
source ../.env
export SPOTIFY_TOKEN

OUTPUT_DIR="gogeta_output"

# GraphQL Endpoints
CONNECTOR_ENDPOINT="https://spotify-showcase-production-3c2b.up.railway.app/"
STANDARD_ENDPOINT="https://showcase-router.apollographql.com"

# query names
ARTIST_QUERY="Artist"
ARTIST_COMPLEX_QUERY="ArtistComplex"
ALBUM_QUERY="Album"

# Number of requests per second
RATE="25"  # 10 requests per second
DURATION="1s"  # Test duration
MAX_WORKERS=100000
WORKERS=10

HENDRIX_ID="776Uo845nYHJpNaStv1Ds4"
GRACE_ALBUM_ID="7yQtjAjhtNi76KRu05XWFS"

mkdir -p $OUTPUT_DIR

# basic artist query
jq -n --arg query "$(cat <<EOF
query $ARTIST_QUERY(\$artistId: ID!) {
  artist(id: \$artistId) {
    externalUrls {
      spotify
    }
    followers {
      total
    }
    genres
    href
    id
    images {
      url
      height
      width
    }
    name
    popularity
    uri
  }
}
EOF
)" --arg artistId $HENDRIX_ID \
'{
  query: $query,
  variables: { artistId: $artistId }
}' > $ARTIST_QUERY.json

# complex artist query
jq -n --arg query "$(cat <<EOF
query $ARTIST_COMPLEX_QUERY(\$artistId: ID!) {
  artist(id: \$artistId) {
    externalUrls {
      spotify
    }
    followers {
      total
    }
    genres
    href
    id
    images {
      url
      height
      width
    }
    name
    popularity
    uri
    albums (limit: 25, offset: 0){
      edges {
        node {
          name
          id
          albumType
          externalUrls {
            spotify
          }
          href
          images {
            url
            height
            width
          }
          totalTracks
          releaseDate {
            date
            precision
          }
          uri
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        limit
        offset
        total
      }
    }
  }
}
EOF
)" --arg artistId $HENDRIX_ID \
'{
  query: $query,
  variables: { artistId: $artistId }
}' > $ARTIST_COMPLEX_QUERY.json

# album query
jq -n --arg query "$(cat <<EOF
query $ALBUM_QUERY(\$albumId: ID!) {
  album(id: \$albumId) {
    name
    albumType
    copyrights {
      text
      type
    }
    externalUrls {
      spotify
    }
    genres
    href
    id
    images {
      url
      height
      width
    }
    label
    releaseDate {
      date
      precision
    }
    totalTracks
    uri
  }
}
EOF
)" --arg albumId $GRACE_ALBUM_ID \
'{
  query: $query,
  variables: { albumId: $albumId }
}' > $ALBUM_QUERY.json

# setup values for iteration
# QUERY_FILES=("$ARTIST_QUERY.json")
QUERY_FILES=("$ARTIST_QUERY.json" "$ARTIST_COMPLEX_QUERY.json" "$ALBUM_QUERY.json")
ENDPOINTS=("$CONNECTOR_ENDPOINT" "$STANDARD_ENDPOINT")

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
CSV="${OUTPUT_DIR}/latencies_${TIMESTAMP}.csv"

# Add headers to csv
echo "attack, requests, total, mean, 50th, 90th, 95th, 99th, max, min" > $CSV

for QF in "${QUERY_FILES[@]}"; do
  for ENDPOINT in "${ENDPOINTS[@]}"; do
    echo "Running with QUERY_FILE: $QF and endpoint: $ENDPOINT"
    if [ "$ENDPOINT" == "$CONNECTOR_ENDPOINT" ]; then
      CONNECTOR_SUFFIX="connector"
      AUTH_HEADER="Bearer $SPOTIFY_TOKEN"
      BIN_FILE="${QF}_${CONNECTOR_SUFFIX}.bin"
    else
      AUTH_HEADER="$SPOTIFY_TOKEN"
      BIN_FILE="$QF.bin"
    fi

    echo "Testing $ENDPOINT..."

    echo "POST $ENDPOINT
    Content-Type: application/json
    Authorization: $AUTH_HEADER
    @./$QF" | gogeta attack \
        -rate=$RATE \
        -duration=$DURATION \
        -name=$BIN_FILE \
        -workers=$WORKERS \
        -max-workers=$MAX_WORKERS \
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
