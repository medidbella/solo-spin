import { apiFetch } from "../api_integration/api_fetch";
import type {UserInfo} from "../api_integration/api_types"
import { routeStatesMap } from "../main";

// simply does a minimal fetch request to the backend to tell if 
// the current user is already logged in or not (refresh token expires after 7 days)
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
    // console.log(`checking route ${path}`)
    if (routeStatesMap[path] == 'private' && ! (await isAuthenticated())){
        // console.log('the user is not authenticated redirecting to login')
        history.pushState(null, '', '/login');
        return '/login'
    }
    else if (routeStatesMap[path] == 'public' && (await isAuthenticated())){
        // console.log('the user already authenticated redirecting to home')
        history.pushState(null, '', '/home')
        return '/home'
    }
    // else
        // console.log('either the path is private and user authed or public path and user unauthed')
    return path
}

/* PLEASE READ THIS !!
    the goal of this function is to redirect users back to the login page 
    when trying to access a protected page, or redirect them to the home 
    when trying to access the landing page or login/register pages
    i have a created an map (routeStatesMap) that maps route name to either
    private or public meaning:
    ANY NEW CREATED PAGE MUST BE ADDED TO THAT MAP WITH A CORRECT STATE !!
*/