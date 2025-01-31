const resolvers = {
  Query: {
    getSubgraphWeatherData: async (_, { city, country }, {dataSources}) => {
      const data = await dataSources.weatherAPI.getWeather(city, country); 

      return data;
    },
  },
  SubgraphWeather: {
    __resolveReference({ city, country }, { dataSources }) {
      return dataSources.weatherAPI.getWeather(city, country);
    }
  }
};

export default resolvers;
