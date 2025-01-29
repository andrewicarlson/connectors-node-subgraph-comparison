const resolvers = {
  Query: {
    GetSubgraphWeatherData: async (_, { city, date, time, country }, {dataSources}) => {
      const data = await dataSources.weatherAPI.getWeather(city, country, date, time); 

      return data;
    },
  }
};

export default resolvers;
