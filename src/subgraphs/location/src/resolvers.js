const resolvers = {
  Query: {
    subgraphAddressByGeo: async (_, { lat, long }, {dataSources}) => {
      const data = await dataSources.locationAPI.getAddressByGeo(lat, long); 

      return data;
    },
    subgraphAddressAndWeather: async (_, { lat, long }, {dataSources}) => {
      const data = await dataSources.locationAPI.getAddressByGeo(lat, long); 

      return data;
    },
    subgraphLocationByAddress: async (_, { address, city, state }, {dataSources}) => {
      const data = await dataSources.locationAPI.getLocationByAddress(address, city, state); 

      return data;
    }
  },
  SubgraphAddress: {
    weather: ({city, country}) => {
      return {city, country};
    }
  },
};

export default resolvers;
