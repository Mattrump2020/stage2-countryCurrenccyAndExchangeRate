import axios from "axios";

const fetchCountryData = async () => {
    try{
        const resp = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies")
        if(resp && resp.data){
            return resp.data.currencies;
        }  
        console.warn('Unexpected respomse, using fallback');

    } catch(err){
        console.error("Error fetching Country's Data:", err.message || err )
    }
}

const fetchExchangeRate = async () =>{
    try{
        const resp = await axios.get("https://open.er-api.com/v6/latest/USD")
        if(resp && resp.data){
            return resp.data.currencies;
        }  
        console.warn('Unexpected respomse, using fallback');

    } catch(err){
        console.error("Error fetching Country's rate:", err.message || err )
    }
}

export {fetchCountryData, fetchExchangeRate}