const resolvers = {
  Query: {
    addressByGeo: async (_, { lat, long }, {dataSources}) => {
      const data = await dataSources.locationAPI.getAddressByGeo(lat, long); 

      return data;
    },
    geoByAddress: async (_, { address, city, state }, {dataSources}) => {
      const data = await dataSources.locationAPI.getLocationByAddress(address, city, state); 

      return data;
    }
  },
  Geo: {
    weather: ({lat, long}) => {
      return {lat, long};
    }
  },
};

export default resolvers;
