import QRCode from 'qrcode';
import { apiFetch } from '../../api_integration/api_fetch';
import type { 
  TwoFAGenerateResponse, 
  TwoFAValidateRequest,
  GeneralSuccessRes 
} from '../../api_integration/api_types';

import { 
  renderTwoFactorSetup, 
  renderLoading, 
  renderError, 
  renderSuccess,
  extractSecretFromOtpUrl 
} from './TwoFactorSetupUI';
import { showAlert } from '../../utils/alert';
const CONTENT_CONTAINER_ID = 'security-right-content';

export function showError(element: HTMLElement | null, message: string): void {
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
    //remove the 'hidden' option from the 'two-factor-error' element class to be be visible
  }
}

async function generateQRCode(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: 160,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function handleEnable2FA(): Promise<void>
{
  const container = document.getElementById(CONTENT_CONTAINER_ID);
  
  if (!container) {
    console.error(`Container #${CONTENT_CONTAINER_ID} not found`);
    showAlert('Something went wrong. Please refresh the page.', "error");
    return;
  }

  container.innerHTML = renderLoading();//rendering a loading screen in case qr creation hangs

  try {
    const response = await apiFetch<TwoFAGenerateResponse>('/api/2fa/generate', {method: 'POST',});
    const manualCode = extractSecretFromOtpUrl(response.otpAuthUrl);
    const qrCodeDataUrl = await generateQRCode(response.otpAuthUrl);
    container.innerHTML = renderTwoFactorSetup(manualCode, qrCodeDataUrl);
    const form = document.getElementById('two-factor-verify-form');
    if (!form) {
      console.error('Verification form not found');
      return;
    }
    form.addEventListener('submit', handleVerifySubmit);
  } catch (error: any) {
    console.error('Failed to generate 2FA:', error);
    const errorMessage = error.message || 'Failed to generate 2FA. Please try again.';
    container.innerHTML = renderError(errorMessage);
    const retryBtn = document.getElementById('retry-2fa-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', handleEnable2FA);
    }
  }
}

async function handleVerifySubmit(event: Event)
{
  event.preventDefault();
  const codeInput = document.getElementById('two-factor-code') as HTMLInputElement;
  const errorElement = document.getElementById('two-factor-error') as HTMLElement | null;
  const submitButton = document.getElementById('verify-2fa-btn') as HTMLButtonElement | null;

  const code = codeInput.value.trim();
  if (code.length !== 6) {
    showError(errorElement, 'Code must be exactly 6 digits');
    return;
  }
  if (errorElement)
    errorElement.classList.add('hidden');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Verifying...';
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');
  }
  try {
    const payload: TwoFAValidateRequest = { code };

    await apiFetch<GeneralSuccessRes>('/api/2fa/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const container = document.getElementById(CONTENT_CONTAINER_ID);
    if (container)
      container.innerHTML = renderSuccess();
  } catch (error: any) {
    console.error('2FA validation failed:', error);
    if (error.statusCode === 401) {
      showError(errorElement, 'Invalid code. Please try again.');
    }
    else
      showError(errorElement, error.message || 'Verification failed. Please try again.');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Verify';
      submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    codeInput.value = '';
    codeInput.focus();
  }
}
