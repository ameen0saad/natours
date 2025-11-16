import axios from 'axios';
import { showAlert } from './alerts';

export const deleteReview = async (reviewId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:3000/api/v1/reviews/${reviewId}`,
    });

    if ((res.status = 204)) {
      showAlert('success', 'Review deleted successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const createReview = async (data, tourId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}/reviews`,
      data,
    });

    if ((res.data.status = 201)) {
      showAlert('success', 'Review added successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (error) {
    if (error.response.data.message.split(' ')[0] === 'Duplicate')
      showAlert('error', 'You have been created review for this tour');
    else showAlert('error', error.response.data.message);
  }
};

// TODO : ADD STAR TO THE REVIEW
export const statActivation = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    let selectedValue = 0;

    stars.forEach((star) => {
      star.addEventListener('mouseover', () => {
        const value = star.dataset.value;
        stars.forEach((s) => {
          s.classList.toggle('active', s.dataset.value <= value);
        });
      });

      star.addEventListener('mouseout', () => {
        stars.forEach((s) => {
          s.classList.toggle('active', s.dataset.value <= selectedValue);
        });
      });

      star.addEventListener('click', () => {
        selectedValue = star.dataset.value;
        ratingInput.value = selectedValue;
        stars.forEach((s) => {
          s.classList.toggle('active', s.dataset.value <= selectedValue);
        });
      });
    });
  });
};
