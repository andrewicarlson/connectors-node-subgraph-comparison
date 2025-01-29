const resolvers = {
  Query: {
    subgraphAddressByGeo: async (_, { lat, long }, {dataSources}) => {
      const data = await dataSources.locationAPI.getAddressByGeo(lat, long); 

      return data;
    },
    subgraphLocationByAddress: async (_, { address, city, state }, {dataSources}) => {
      const data = await dataSources.locationAPI.getLocationByAddress(address, city, state); 

      return data;
    }
  }
};

export default resolvers;
