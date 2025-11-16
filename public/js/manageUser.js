import axios from 'axios';
import { showAlert, showCustomConfirm } from './alerts';

export const manageUser = async (data, userId, type) => {
  try {
    if (type === 'delete') {
      const confirmed = await showCustomConfirm(
        'Are you sure you want to delete this user? This action cannot be undone.',
      );
      if (!confirmed) return;
    }
    const res =
      type === 'delete'
        ? await axios({
            url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
            method: 'DELETE',
          })
        : await axios({
            url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
            method: 'PATCH',
            data,
          });
    if (res.status === 204) {
      showAlert('success', 'User deleted successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
    if (res.data.status === 'success') {
      showAlert('success', 'User updated successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response?.data.message);
  }
};
