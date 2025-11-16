import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data,
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'User created successfully! Please check your email to verified your account',
      );
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
