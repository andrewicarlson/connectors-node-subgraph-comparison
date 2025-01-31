import { RESTDataSource } from '@apollo/datasource-rest'; 

class WeatherAPI extends RESTDataSource {
    baseURL = 'https://weather.visualcrossing.com/';

    async getWeather(city, country) {
        const data = await this.get(`VisualCrossingWebServices/rest/services/timeline/${city},${country}?key=${process.env.VISUAL_CROSSING_API_KEY}&include=current&unitGroup=uk`);
        
        return {
            ...data.currentConditions,
            temperature: data.currentConditions.temp,
            windSpeed: data.currentConditions.windspeed,
            city,
            country
        };
    }
}

export default WeatherAPI;