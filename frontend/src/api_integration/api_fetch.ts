import type {ApiErrorResponse} from "./api_types"

export async function apiFetch<T>(url: string, options: RequestInit = {}):Promise<T>
{
    const headers: Record<string, string> = { ...options.headers as Record<string, string> };

    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type'])
		headers['Content-Type'] = 'application/json';
	const reqConfig = {...options, headers} 
    let response = await fetch(url, reqConfig)
    if (response.status == 413)
        throw ({statusCode:413, message: "image too large"})
    let responseObj = await response.json()
    if (responseObj.statusCode == 401 && responseObj.message == "the token is invalid or expired.")
    {
        // console.log('fist fetch failed, trying to refresh')
        const refreshRes = await fetch("/api/refresh", {method: "POST"})
        if (refreshRes.ok){
            response = await fetch(url, reqConfig)
            responseObj = await response.json()
        }
    }
    if (!response.ok)
        throw (responseObj as ApiErrorResponse)
    // console.log(`fetched the endpoint ${url} successfully\nresult:`, responseObject)
    return (responseObj as T)
}

/*
    this generic function goals is to abstract the fetching process, it takes the same parameters as the
    built-in fetch function and returns the actual json object of type <T>, it does handle the jwt refresh
    process if needed.
    its uses a content-type 'application-json' if not set in the option object and a body is included  
    it may throw an error in the following cases:
        + fetch api exception
        + .json method exception
        + received an error response from the server, this exception is the response itself
            you can check that by the statusCode method.
*/