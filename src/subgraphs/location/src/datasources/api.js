import { RESTDataSource } from '@apollo/datasource-rest'; 

class LocationAPI extends RESTDataSource {
    baseURL = 'https://singlesearch.alk.com/';

    async getAddressByGeo(lat, long) {
        const data = await this.get(`ww/api/search?query=${lat},${long}&matchNamedRoadsOnly=true&maxCleanupMiles=0.2`, {
            headers: {
                "Authorization": process.env.TRIMBLE_API_KEY
            }
        });
        
        return {
            shortFormatted: data.Locations[0].ShortString,
            timezone: data.Locations[0].TimeZone
        };
    }

    async getLocationByAddress(address, city, state) {
        const data = await this.get(`na/api/search?query=${address},${city}&countries=US&states=${state}`, {
            headers: {
                "Authorization": process.env.TRIMBLE_API_KEY
            }
        });
        
        return {
            lat: data.Locations[0].Coords.Lat,
            long: data.Locations[0].Coords.Lon
        };
    }
}

export default LocationAPI;