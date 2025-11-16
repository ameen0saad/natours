import axios from 'axios';
import { showAlert, showCustomConfirm } from './alerts';

export const addDates = () => {
  document.getElementById('addDateBtn').addEventListener('click', () => {
    const container = document.getElementById('datesContainer');
    const input = document.createElement('input');
    input.type = 'date';
    input.name = 'startDates';
    input.classList.add('form__input');
    container.appendChild(input);
  });
};

export const createTour = async (data) => {
  try {
    const res = await axios({
      url: 'http://127.0.0.1:3000/api/v1/tours',
      method: 'POST',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Tour Created successfully');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const deleteTour = async (tourId) => {
  try {
    const confirm = await showCustomConfirm(
      'Are you sure you want to delete this tour? This action cannot be undone.',
    );
    if (!confirm) return;
    const res = await axios({
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`,
      method: 'DELETE',
    });
    if (res.status === 204) {
      showAlert('success', 'Tour deleted successfully');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
