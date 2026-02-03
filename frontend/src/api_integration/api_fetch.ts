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
        const refreshRes = await fetch("/api/refresh", {method: "POST"})
        if (refreshRes.ok){
            response = await fetch(url, reqConfig)
            responseObj = await response.json()
        }
    }
    if (!response.ok)
        throw (responseObj as ApiErrorResponse)
    return (responseObj as T)
}
