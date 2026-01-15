//this function send a reauest to backend and check if the user already authenticated or not 
export async function isAuthenticated(): Promise<boolean> {
    try {
        const response = await fetch('/api/me', {method: 'GET',});
        return response.ok;;
    }
    catch (Error)
    {
        console.error('Auth check failed: ', Error);
        return false;
    }
}

///this function is to redirected the user to login page in case if he is not autenticated
export async function requireAuth(): Promise<boolean>{
    const authenticated = await isAuthenticated();

    if (!authenticated)
    {
        history.pushState(null, '', '/login');
        return false;
    }
    return true;
}
//the public pages cannot be accessed after login if the user tries to access to login page by the link he will be redirected to home page directly
export async function requirGuest(): Promise<boolean>{
    const authenticated = await isAuthenticated();
    
    if (authenticated)
    {
        history.pushState(null, '', '/home');
        return false;
    }
    return true;
}