export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

export const showCustomConfirm = (message) => {
  return new Promise((resolve) => {
    // Create overlay if it doesn't exist
    let overlay = document.getElementById('confirm-dialog-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirm-dialog-overlay';
      overlay.className = 'confirm-dialog-overlay';

      overlay.innerHTML = `
        <div class="confirm-dialog">
          <div class="confirm-dialog-header">
            <svg class="confirm-dialog-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <h3 class="confirm-dialog-title">Confirm Action</h3>
          </div>
          <div class="confirm-dialog-body">
            <p class="confirm-dialog-message">${message}</p>
          </div>
          <div class="confirm-dialog-footer">
            <button class="confirm-dialog-btn confirm-dialog-btn-cancel">Cancel</button>
            <button class="confirm-dialog-btn confirm-dialog-btn-confirm">Confirm</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Add event listeners
      const cancelBtn = overlay.querySelector('.confirm-dialog-btn-cancel');
      const confirmBtn = overlay.querySelector('.confirm-dialog-btn-confirm');

      cancelBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        resolve(false);
      });

      confirmBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        resolve(true);
      });

      // Close when clicking outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          resolve(false);
        }
      });
    } else {
      // Update message if overlay exists
      overlay.querySelector('.confirm-dialog-message').textContent = message;
    }

    // Show the dialog
    overlay.classList.add('active');
  });
};
