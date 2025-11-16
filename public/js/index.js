import {
  login,
  logout,
  forgetPassword,
  resetPassword,
  oauthWithGoogle,
} from './login.js';
import { signup } from './signup.js';
import { displayMap } from './map.js';
import { updateSetting } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { deleteReview, createReview, statActivation } from './review.js';
import { addDates, createTour, deleteTour } from './manageTour.js';
import { manageGuideForTour } from './updateGuides.js';
import { manageUser } from './manageUser.js';
import {
  initLocationMap,
  getLocationCoordinates,
  safeFitBounds,
} from './mapForm.js';
import { initTourLocationsMap } from './tourLocationsMap.js';
import { showAlert, showCustomConfirm } from './alerts.js';

// Get the map element
const mapElement = document.getElementById('map');
const formMapElement = document.getElementById('map-form');
const loginForm = document.querySelector('.form--login');
const signupnForm = document.querySelector('.form--signup');
const resetPasswordForm = document.querySelector('.form--reset-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const passwordResetBtn = document.getElementById('reset-link');
const oauthBtn = document.getElementById('SigninOauth');
const userDataForm = document.querySelector('.form-user-data');
const userPassowrdForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewDeleteBtn = document.getElementById('delete-rivew');
const deleteGuideBtn = document.getElementById('delete-guide');
const addGuideBtn = document.getElementById('add-guide');
const deleteTourBtn = document.getElementById('delete-tour');
const reviewForm = document.querySelector('.add-review__form');
const tourForm = document.getElementById('tourForm');

// Get locations from data attribute and parse JSON
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupnForm) {
  signupnForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup({ name, email, password, passwordConfirm });
  });
}
if (oauthBtn) {
  oauthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    oauthWithGoogle();
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (passwordResetBtn) {
  passwordResetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgetPassword(email);
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirmPassword').value;
    const token = document.getElementById('token').value;
    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords do not match!');
      return;
    }
    resetPassword({ password, passwordConfirm }, token);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSetting(form, 'Data');
  });
}
if (userPassowrdForm) {
  userPassowrdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSetting(
      { passwordCurrent, newPassword, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save--password').textContent =
      'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing... ';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (reviewDeleteBtn) {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn__delete-rivew')) {
      const { reviewId } = e.target.dataset;
      deleteReview(reviewId);
    }
  });
}

if (reviewForm) {
  statActivation();
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;
    const { tourId } = document.getElementById('btn--review').dataset;
    createReview({ rating, review }, tourId);
  });
}

if (addGuideBtn) {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn__add-guide')) {
      const { userId, tourId } = e.target.dataset;
      const addGuide = true;
      manageGuideForTour({ guides: userId, addGuide }, tourId);
    }
  });
}

if (deleteGuideBtn) {
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn__delete-guide')) {
      const { guideId, tourId } = e.target.dataset;
      const deleteGuide = true;
      const confirmed = await showCustomConfirm(
        'Are you sure you want to delete this guide? This action cannot be undone.',
      );
      if (!confirmed) return;
      manageGuideForTour({ guides: guideId, deleteGuide }, tourId);
    }
  });
}
if (deleteTourBtn) {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn__delete-tour')) {
      const { tourId } = e.target.dataset;

      deleteTour(tourId);
    }
  });
}

document.querySelectorAll('#update-role').forEach((btn) => {
  btn.addEventListener('click', () => {
    const userId = btn.dataset.userId;
    const role = btn.closest('tr').querySelector('select[name="role"]').value;

    manageUser({ role }, userId, 'patch');
  });
});

document.querySelectorAll('#delete-user').forEach((btn) => {
  btn.addEventListener('click', () => {
    const userId = btn.dataset.userId;
    manageUser({}, userId, 'delete');
  });
});

if (tourForm) {
  addDates();

  // Initialize map
  initializeMaps();

  // Add form submit event listener
  tourForm.addEventListener('submit', handleFormSubmit);
}
function initializeMaps() {
  // Initialize Start Location Map
  let initialStartCoords = null;
  const startCoordsInput = document.getElementById('startLocationCoordinates');
  if (startCoordsInput && startCoordsInput.value) {
    const coordsArray = startCoordsInput.value
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    if (coordsArray.length === 2 && !coordsArray.some(isNaN)) {
      initialStartCoords = coordsArray;
    }
  }

  // Initialize Tour Locations Map
  let initialTourCoords = null;
  // If editing, you might want to show all tour locations on the map
  const tourLocationsContainer = document.getElementById(
    'tourLocationsContainer',
  );
  if (
    tourLocationsContainer &&
    tourLocationsContainer.querySelector('.location-item')
  ) {
    // You can add logic here to show existing tour locations on the map
    const firstLocation =
      tourLocationsContainer.querySelector('.location-item');
    if (firstLocation) {
      const coordsInput = firstLocation.querySelector('.location-coordinates');
      if (coordsInput && coordsInput.value) {
        const coordsArray = coordsInput.value
          .split(',')
          .map((coord) => parseFloat(coord.trim()));
        if (coordsArray.length === 2 && !coordsArray.some(isNaN)) {
          initialTourCoords = coordsArray;
        }
      }
    }
  }

  window.startMapManager = initLocationMap(initialStartCoords);
  window.tourMapManager = initTourLocationsMap(initialTourCoords);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = prepareFormData();
  if (!formData) return;

  // Determine if we're creating or updating
  const isEdit = document.querySelector('h2').textContent.includes('Edit');
  const tourId = isEdit ? window.location.pathname.split('/').pop() : null;

  if (isEdit && tourId) {
    updateTour(tourId, formData);
  } else {
    createTour(formData);
  }
}

function prepareFormData() {
  const form = new FormData();

  // Basic tour information
  form.append('name', document.getElementById('name').value);
  form.append('duration', document.getElementById('duration').value);
  form.append('maxGroupSize', document.getElementById('maxGroupSize').value);
  form.append('difficulty', document.getElementById('difficulty').value);
  form.append('price', document.getElementById('price').value);
  form.append('summary', document.getElementById('summary').value);
  form.append('description', document.getElementById('description').value);

  // Image files
  const imageCover = document.getElementById('imageCover').files[0];
  if (imageCover) {
    form.append('imageCover', imageCover);
  }

  const images = document.getElementById('images').files;
  for (let i = 0; i < images.length; i++) {
    form.append('images', images[i]);
  }

  // Start Location
  const startDescription = document.getElementById(
    'startLocationDescription',
  ).value;
  const startAddress = document.getElementById('startLocationAddress').value;
  const startCoordinates = document.getElementById(
    'startLocationCoordinates',
  ).value;

  // Validate start coordinates
  if (!startCoordinates) {
    showAlert('error', 'Please select a start location on the map');
    return null;
  }

  const startCoordinatesArray = startCoordinates
    .split(',')
    .map((ele) => parseFloat(ele.trim()));

  if (
    startCoordinatesArray.length !== 2 ||
    startCoordinatesArray.some(isNaN) ||
    startCoordinatesArray[0] < -90 ||
    startCoordinatesArray[0] > 90 ||
    startCoordinatesArray[1] < -180 ||
    startCoordinatesArray[1] > 180
  ) {
    showAlert('error', 'Invalid start location coordinates format.');
    return null;
  }

  // Append start location data
  form.append('startLocation[description]', startDescription);
  form.append('startLocation[address]', startAddress);
  form.append('startLocation[coordinates][0]', startCoordinatesArray[1]); // longitude
  form.append('startLocation[coordinates][1]', startCoordinatesArray[0]); // latitude
  form.append('startLocation[type]', 'Point');

  // Tour Locations (Multiple Locations)
  const locationItems = document.querySelectorAll('.location-item');
  let hasValidLocations = false;

  locationItems.forEach((item, index) => {
    const dayInput = item.querySelector('input[name="locations[][day]"]');
    const descriptionInput = item.querySelector(
      'input[name="locations[][description]"]',
    );
    const coordinatesInput = item.querySelector(
      'input[name="locations[][coordinates]"]',
    );
    const addressInput = item.querySelector(
      'input[name="locations[][address]"]',
    );

    // Validate required fields
    if (!dayInput || !descriptionInput || !coordinatesInput) {
      console.warn(`Location item ${index} is missing required fields`);
      return; // Skip this location
    }

    const day = dayInput.value;
    const locDescription = descriptionInput.value;
    const locCoordinates = coordinatesInput.value;
    const locAddress = addressInput ? addressInput.value : '';

    // Validate coordinates
    if (locCoordinates) {
      const locCoordsArray = locCoordinates
        .split(',')
        .map((ele) => parseFloat(ele.trim()));

      if (
        locCoordsArray.length === 2 &&
        !locCoordsArray.some(isNaN) &&
        locCoordsArray[0] >= -90 &&
        locCoordsArray[0] <= 90 &&
        locCoordsArray[1] >= -180 &&
        locCoordsArray[1] <= 180
      ) {
        // Append location data with indexed keys for proper array handling
        form.append(`locations[${index}][day]`, day);
        form.append(`locations[${index}][description]`, locDescription);
        form.append(`locations[${index}][address]`, locAddress);
        form.append(`locations[${index}][coordinates][0]`, locCoordsArray[1]); // longitude
        form.append(`locations[${index}][coordinates][1]`, locCoordsArray[0]); // latitude
        form.append(`locations[${index}][type]`, 'Point');

        hasValidLocations = true;
      } else {
        console.warn(
          `Invalid coordinates in location ${index}: ${locCoordinates}`,
        );
      }
    }
  });

  // Validate that we have at least one tour location
  if (!hasValidLocations) {
    showAlert(
      'error',
      'Please add at least one valid tour location with coordinates.',
    );
    return null;
  }

  // Start Dates
  const startDates = Array.from(
    document.querySelectorAll('#datesContainer input[name="startDates"]'),
  )
    .map((input) => {
      if (input.value) {
        return new Date(input.value).toISOString();
      }
      return null;
    })
    .filter((date) => date !== null);

  if (startDates.length > 0) {
    startDates.forEach((date) => {
      form.append('startDates', date);
    });
  } else {
    showAlert('error', 'Please add at least one start date.');
    return null;
  }

  // Secret Tour
  const secretTour = document.getElementById('secretTour').checked;
  form.append('secretTour', secretTour);

  return form;
}
/*name
duration
maxGroupSize
difficulty
price
summary
description*/
