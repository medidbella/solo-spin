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
const CONTENT_CONTAINER_ID = 'security-right-content';

function getContentContainer(): HTMLElement | null {
  return document.getElementById(CONTENT_CONTAINER_ID);
}
export async function handleEnable2FA(): Promise<void> {
  const container = getContentContainer();
  
  if (!container) {
    console.error(`Container #${CONTENT_CONTAINER_ID} not found`);
    alert('Something went wrong. Please refresh the page.');
    return;
  }

  container.innerHTML = renderLoading();

  try {
    const response = await apiFetch<TwoFAGenerateResponse>('/api/2fa/generate', {
      method: 'POST',
    //   body: JSON.stringify({})
    });

    console.log('2FA Generate response:', response);

    const manualCode = extractSecretFromOtpUrl(response.otpAuthUrl);

    const qrCodeDataUrl = await generateQRCode(response.otpAuthUrl);

    container.innerHTML = renderTwoFactorSetup(manualCode);

    const qrImage = document.getElementById('qr-code-image') as HTMLImageElement | null;
    if (qrImage) {
      qrImage.src = qrCodeDataUrl;
    }

    attachVerifyFormListener();

  } catch (error: any) {
    console.error('Failed to generate 2FA:', error);
    
    const errorMessage = error.message || 'Failed to generate 2FA. Please try again.';
    
    container.innerHTML = renderError(errorMessage);
    
    attachRetryListener();
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

function attachVerifyFormListener(): void {
  const form = document.getElementById('two-factor-verify-form');
  
  if (!form) {
    console.error('Verification form not found');
    return;
  }

  form.addEventListener('submit', handleVerifySubmit);
}

function attachRetryListener(): void {
  const retryBtn = document.getElementById('retry-2fa-btn');
  
  if (retryBtn) {
    retryBtn.addEventListener('click', handleEnable2FA);
  }
}

async function handleVerifySubmit(event: Event): Promise<void> {

  event.preventDefault();


  const codeInput = document.getElementById('two-factor-code') as HTMLInputElement | null;
  const errorElement = document.getElementById('two-factor-error') as HTMLElement | null;
  const submitButton = document.getElementById('verify-2fa-btn') as HTMLButtonElement | null;

  if (!codeInput) {
    console.error('Code input not found');
    return;
  }

  const code = codeInput.value.trim();

  if (code.length !== 6) {
    showError(errorElement, 'Code must be exactly 6 digits');
    return;
  }

  if (!/^\d{6}$/.test(code)) {
    showError(errorElement, 'Code must contain only numbers');
    return;
  }

  hideError(errorElement);

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

    const container = getContentContainer();
    if (container) {
      container.innerHTML = renderSuccess();
    }

  } catch (error: any) {
   
    console.error('2FA validation failed:', error);
    

    if (error.statusCode === 401) {
      showError(errorElement, 'Invalid code. Please try again.');
    } else {
      showError(errorElement, error.message || 'Verification failed. Please try again.');
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Verify';
      submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    codeInput.value = '';
    codeInput.focus();
  }
}

function showError(element: HTMLElement | null, message: string): void {
  if (element) {
    element.textContent = message;
    element.classList.remove('hidden');
  }
}

function hideError(element: HTMLElement | null): void {
  if (element) {
    element.classList.add('hidden');
  }
}