const resolvers = {
  Query: {
    getWeatherData: async (_, { city, country }, {dataSources}) => {
      const data = await dataSources.weatherAPI.getWeather(city, country); 

      return data;
    },

    getWeatherDataByLatLng: async (_, { lat, long }, {dataSources}) => {
      const data = await dataSources.weatherAPI.getWeather(lat, long); 

      return data;
    },
  },
  Weather: {
    __resolveReference({ lat, long }, { dataSources }) {
      return dataSources.weatherAPI.getWeather(lat, long);
    }
  }
};

export default resolvers;
