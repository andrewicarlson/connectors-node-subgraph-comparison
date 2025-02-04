#!/bin/bash
source .env

APOLLO_KEY=$APOLLO_KEY \
APOLLO_GRAPH_REF=$APOLLO_GRAPH_REF \
APOLLO_ROVER_DEV_ROUTER_VERSION=$APOLLO_ROVER_DEV_ROUTER_VERSION \
VISUAL_CROSSING_API_KEY=$VISUAL_CROSSING_API_KEY \
TRIMBLE_API_KEY=$TRIMBLE_API_KEY \
rover dev \
  --router-config ./router/router.yaml \
  --supergraph-config ./router/supergraph_node.yaml \
  --supergraph-port=$STANDARD_SG_PORT