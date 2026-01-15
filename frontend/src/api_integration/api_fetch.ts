import type {ApiErrorResponse} from "./api_types.js"
export async function apiFetch<T>(url: string, options: RequestInit = {}):Promise<T>
{
    let refreshRes
	const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
	const reqConfig = {...options, headers} 
    let response = await fetch(url, reqConfig)
    if (response.status == 401) {
        console.log('fist fetch failed trying to refresh')
        refreshRes = await fetch("/api/refresh", {method: "POST"})
        if (refreshRes!.ok)
            response = await fetch(url, reqConfig)
    }
    if (!response.ok)
        throw (await response.json() as ApiErrorResponse)
    const responseObject:T = await response.json() as T
    // console.log(`fetched the endpoint ${url} successfully\nresult:`, responseObject)
    return (responseObject)
}

/*
    this generic function goals is to abstract the fetching process, it takes the same parameters as the
    built-in fetch function and returns the actual json object of type <T>, it does handle the jwt refresh
    process if needed.
    it may throw an error in the following cases:
        + fetch api exception
        + .json method exception
        + received an error response from the server, this exception is the response itself
            you can check that by the statusCode method.
*/