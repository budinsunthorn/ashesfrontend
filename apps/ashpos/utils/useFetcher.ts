// useFetcher.ts  
import { NextRouter } from 'next/router';  
import Cookies from 'universal-cookie'; // Ensure you have the correct import for cookies  

export function fetcher<TData, TVariables>(query: string, variables?: TVariables, router?: NextRouter) {  
    const cookies = new Cookies();  
    return async (): Promise<TData> => {  
        const apiURL = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "";
        const res = await fetch(apiURL, {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
                Authorization: 'Bearer ' + cookies.get('token'),  
            },  
            body: JSON.stringify({ query, variables }),  
        });  

        const json = await res.json();  

        if (json.errors) {  
            const { message } = json.errors[0];  
             
            const {extensions} = json.errors[0];  
            // Check for 401 status  
            if (extensions.code === 401) {  
                // Redirect to the sign-in page  
                window.location.href = '/signin';
                cookies.remove('token');
            }   
            throw new Error(message); 
        }  

        return json.data;  
    };  
}