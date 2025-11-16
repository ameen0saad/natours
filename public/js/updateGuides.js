import axios from 'axios';
import { showAlert, showCustomConfirm } from './alerts';

export const manageGuideForTour = async (data, tourId) => {
  try {
    const res = await axios({
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`,
      method: 'PATCH',
      data,
    });
    if (res.data.status === 'success') {
      if (data.addGuide) showAlert('success', 'Guide Added successfully');
      else showAlert('success', 'Guide deleted successfully');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
