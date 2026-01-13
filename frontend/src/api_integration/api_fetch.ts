// import * as api from "./api_types.js"

export async function apiFetch(url: string, options: RequestInit = {})
{
	const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
	const reqConfig = {...options, headers} 
    const response = await fetch(url, reqConfig)
    if (response.status == 401){
        const refreshRes = await fetch("/api/refresh")
        if (refreshRes.status == 200){
            const secondRes = await fetch(url, reqConfig)
            return (secondRes)
        }
        else if (refreshRes.status == 401){
            window.location.href = '/api/login'
            return (response)
        }
    }
    return (response)

}
//sample :
