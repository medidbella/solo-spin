import {render_2fa} from "./TwoFactorLoginUI"
import { showError } from "./TwoFactorSetupLogic"
import type {TwoFAVerifyRequest} from "../../api_integration/api_types"
import { apiFetch } from "../../api_integration/api_fetch"
import { router } from "../../main"

const CONTENT_CONTAINER_ID = "login-left-content"

async function handleVerifyTwoFaButton(event: Event)
{
	event.preventDefault()
	const codeInput = (document.getElementById('2fa-code-input') as HTMLInputElement).value.trim()
	const submitButton = document.getElementById('2fa-verify-btn') as HTMLButtonElement | null
  	const errorElement = document.getElementById('2fa-error-message') as HTMLElement | null;

	if (codeInput.length !== 6){
		showError(errorElement, "Code must be 6 digits exactly")
		return
	}
	if (errorElement)
    	errorElement.classList.add('hidden');
	if (submitButton) {
   		submitButton.disabled = true;
    	submitButton.textContent = 'Verifying...';
    	submitButton.classList.add('opacity-50', 'cursor-not-allowed');
  	}
	const payload:TwoFAVerifyRequest = {code:codeInput}
	try {
		await apiFetch("/api/2fa/verify", {method:'POST', body:JSON.stringify(payload)})
		history.pushState(null, '', `/home`);
		alert('2FA verification succeeded')
		router('/home')
	}
	catch (err:any)
	{
		if (err.message == "Wrong 2FA key, please try again"){
			showError(errorElement, err.message)
			if (submitButton) {
				submitButton.disabled = false;
    			submitButton.textContent = 'verify';
    			submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
			}
		}
		else {
			history.pushState(null, '', `/login`);
			router('/login')
			alert(err.message)
		}
	}
}

export async function TwoFactorVerificationLogic()
{
	const left_container = document.getElementById(CONTENT_CONTAINER_ID)
	if (!left_container){
    	console.error(`Container #${CONTENT_CONTAINER_ID} not found`);
    	alert('Something went wrong. Please refresh the page.');
    	return;
	}
	left_container.innerHTML = render_2fa()

	const form = document.getElementById('2fa-verify-form')
	if (!form){
		console.error('verify form not found')
    	alert('Something went wrong. Please refresh the page.');
		return
	}
	form.addEventListener('submit', handleVerifyTwoFaButton)
}