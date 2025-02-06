import { RESTDataSource } from '@apollo/datasource-rest'; 

class WeatherAPI extends RESTDataSource {
    baseURL = process.env.WEATHER_API_URL;

    requestDeduplicationPolicyFor() {
        return { policy: 'do-not-deduplicate' };
    }

    async getWeather(city, country) {
        const data = await this.get(
            `/VisualCrossingWebServices/rest/services/timeline/${city},${country}?key=${process.env.VISUAL_CROSSING_API_KEY}&include=current&unitGroup=uk`,
            {
                skipCache: true
            }
        );
        
        return {
            ...data.currentConditions,
            temperature: data.currentConditions.temp,
            windSpeed: data.currentConditions.windspeed,
            lat: data.latitude,
            long: data.longitude
        };
    }
}

export default WeatherAPI;