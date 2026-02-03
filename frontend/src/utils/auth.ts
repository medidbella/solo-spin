import { apiFetch } from "../api_integration/api_fetch";
import type {UserInfo} from "../api_integration/api_types"
import { routeStatesMap } from "../main";

async function isAuthenticated() :Promise<boolean>
{
    try {
        await apiFetch<UserInfo>("/api/basic-info")
    }
    catch (err) {
        return false
    }
    return true
}

export async function redirectBasedOnAuth(path:string)
{
    if (routeStatesMap[path] == 'private' && ! (await isAuthenticated())){
        history.pushState(null, '', '/login');
        return '/login'
    }
    else if (routeStatesMap[path] == 'public' && (await isAuthenticated())){
        history.pushState(null, '', '/home')
        return '/home'
    }
    return path
}