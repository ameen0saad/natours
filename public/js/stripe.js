import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51SJYrRCSIV6brhg7YG3cfu4Xla6Iah6wcoiXDJJJpjupE7Qic3F8GlChwpeKPHdJj61BNwGsPkJAPtb7Mhtn1pGu00fCnt0GYy',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`,
    });

    window.location.href = session.data.session.url;
  } catch (error) {
    showAlert('error', error);
  }
};
/*
IntegrationError: stripe.redirectToCheckout is no longer supported in this version of Stripe.js. See the changelog for more details: https://docs.stripe.com/changelog/clover/2025-09-30/remove-redirect-to-checkout.
*/
