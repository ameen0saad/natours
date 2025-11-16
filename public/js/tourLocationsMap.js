/* eslint-disable */
import { showAlert } from './alerts.js';
import L from 'leaflet';

let tourMap;
let tourMarker;
let selectedTourCoords = null;

export const initTourLocationsMap = (initialCoords = null) => {
  // Check if map container exists
  const mapContainer = document.getElementById('tourLocationsMap');
  if (!mapContainer) {
    console.log('Tour locations map container not found');
    return null;
  }

  // Initialize the map
  tourMap = L.map('tourLocationsMap', {
    scrollWheelZoom: true,
    dragging: true,
    tap: true,
  });

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(tourMap);

  // Set initial view
  if (initialCoords && isValidCoordinates(initialCoords)) {
    const [lat, lng] = initialCoords;
    tourMap.setView([lat, lng], 13);
    addTourMarker(lat, lng);
    updateTourCoordinatesDisplay(lat, lng);
  } else {
    tourMap.setView([0, 0], 2);
  }

  // Add click event to map
  tourMap.on('click', function (e) {
    const { lat, lng } = e.latlng;
    setSelectedTourLocation(lat, lng);
  });

  // Initialize event listeners
  initTourMapEvents();

  return {
    getSelectedCoords: () => selectedTourCoords,
    setLocation: (lat, lng) => {
      if (isValidLatLng(lat, lng)) {
        setSelectedTourLocation(lat, lng);
        tourMap.setView([lat, lng], 13);
      }
    },
    getMap: () => tourMap,
  };
};

// Helper functions
function isValidCoordinates(coords) {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const [lat, lng] = coords;
  return isValidLatLng(lat, lng);
}

function isValidLatLng(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function setSelectedTourLocation(lat, lng) {
  if (!isValidLatLng(lat, lng)) return;
  selectedTourCoords = { lat, lng };
  addTourMarker(lat, lng);
  updateTourCoordinatesDisplay(lat, lng);
}

function addTourMarker(lat, lng) {
  if (tourMarker) tourMap.removeLayer(tourMarker);

  const customIcon = L.divIcon({
    className: 'tour-location-marker',
    html: '<div style="background-color: #e74c3c; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  if (isValidLatLng(lat, lng)) {
    tourMarker = L.marker([lat, lng], { icon: customIcon })
      .addTo(tourMap)
      .bindPopup(
        `Tour location:<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`,
      )
      .openPopup();
  }
}

function updateTourCoordinatesDisplay(lat, lng) {
  const displayElement = document.getElementById('tourLocationCoordsDisplay');
  if (displayElement && isValidLatLng(lat, lng)) {
    displayElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    displayElement.style.color = '#e74c3c';
  }
}

// MANUAL COORDINATE HANDLING FOR TOUR LOCATIONS
function initTourMapEvents() {
  console.log('Initializing TOUR map events...');

  // Direct event listener for TOUR location coordinate inputs only
  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('tour-location-coordinates')) {
      console.log('TOUR Coordinate input changed:', e.target.value);
      handleTourManualCoordinateEntry(e.target);
    }
  });

  // Also listen for Enter key on TOUR coordinates
  document.addEventListener('keydown', function (e) {
    if (
      e.target.classList.contains('tour-location-coordinates') &&
      e.key === 'Enter'
    ) {
      console.log('Enter pressed on TOUR coordinate input');
      handleTourManualCoordinateEntry(e.target);
    }
  });

  // Button event listeners - TOUR SPECIFIC
  const useCurrentTourLocationBtn = document.getElementById(
    'useCurrentTourLocation',
  );
  const clearTourLocationBtn = document.getElementById('clearTourLocation');
  const addTourLocationBtn = document.getElementById('addTourLocation');

  if (useCurrentTourLocationBtn) {
    useCurrentTourLocationBtn.addEventListener('click', useCurrentTourLocation);
  }
  if (clearTourLocationBtn) {
    clearTourLocationBtn.addEventListener('click', clearTourLocationSelection);
  }
  if (addTourLocationBtn) {
    addTourLocationBtn.addEventListener('click', addTourLocationFromMap);
  }

  // Initialize existing tour location items
  initializeExistingTourLocationItems();
}

// MANUAL COORDINATE ENTRY HANDLER FOR TOUR LOCATIONS
function handleTourManualCoordinateEntry(input) {
  const value = input.value.trim();
  console.log('Handling TOUR manual coordinate entry:', value);

  if (!value) {
    console.log('Empty TOUR coordinates, clearing...');
    clearTourLocationSelection();
    return;
  }

  const coords = parseCoordinateInput(value);
  console.log('Parsed TOUR coordinates:', coords);

  if (coords && isValidLatLng(coords.lat, coords.lng)) {
    console.log('Valid TOUR coordinates, updating map and fields...');

    // Update map
    setSelectedTourLocation(coords.lat, coords.lng);
    tourMap.setView([coords.lat, coords.lng], 13);

    // Update address and description fields for TOUR location
    updateTourLocationFields(coords.lat, coords.lng, input);

    input.style.borderColor = '#2ecc71';
  } else {
    console.log('Invalid TOUR coordinates');
    input.style.borderColor = '#e74c3c';
    showAlert(
      'error',
      'Invalid coordinates. Use format: "latitude, longitude"',
    );
  }
}

// FIELD UPDATING FOR TOUR LOCATIONS
function updateTourLocationFields(lat, lng, coordinatesInput) {
  console.log('Updating TOUR location fields for:', lat, lng);

  const locationItem = coordinatesInput.closest('.location-item');
  if (!locationItem) {
    console.log('No TOUR location item found for coordinates input');
    return;
  }

  const descriptionInput = locationItem.querySelector(
    'input[name="locations[][description]"]',
  );
  const addressInput = locationItem.querySelector(
    'input[name="locations[][address]"]',
  );

  console.log('Found TOUR description input:', descriptionInput);
  console.log('Found TOUR address input:', addressInput);

  if (!descriptionInput || !addressInput) {
    console.log('Missing TOUR description or address input');
    return;
  }

  // Show loading state
  descriptionInput.placeholder = 'Fetching location...';
  addressInput.placeholder = 'Fetching address...';

  // Clear existing values to ensure new data is visible
  descriptionInput.value = '';
  addressInput.value = '';

  console.log('Making geocoding request for TOUR location...');

  // Use fetch with timeout
  const timeout = 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    { signal: controller.signal },
  )
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('TOUR Geocoding response received:', data);

      if (data && data.display_name) {
        // Update description
        const address = data.address || {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          '';
        const country = address.country || '';

        let description = 'Tour Location';
        if (city && country) {
          description = `${city}, ${country}`;
        } else if (city) {
          description = city;
        } else if (country) {
          description = country;
        } else if (data.display_name) {
          description = data.display_name.split(',')[0];
        }

        descriptionInput.value = description;
        console.log('Set TOUR description to:', description);

        // Update address
        addressInput.value = data.display_name;
        console.log('Set TOUR address to:', data.display_name);
      } else {
        console.log('No TOUR geocoding data received');
        descriptionInput.value = 'Tour Location';
        addressInput.value = 'Address not found';
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.log('TOUR Geocoding error:', error);
      descriptionInput.value = 'Tour Location';
      addressInput.value = 'Failed to fetch address';
    })
    .finally(() => {
      descriptionInput.placeholder = 'e.g. Banff National Park';
      addressInput.placeholder = 'Full address';
      console.log('TOUR Field update completed');
    });
}

// Initialize existing tour location items
function initializeExistingTourLocationItems() {
  const existingTourCoordinatesInputs = document.querySelectorAll(
    '.tour-location-coordinates',
  );
  console.log(
    'Found existing TOUR coordinate inputs:',
    existingTourCoordinatesInputs.length,
  );

  existingTourCoordinatesInputs.forEach((input) => {
    if (input.value) {
      const coords = parseCoordinateInput(input.value);
      if (coords && isValidLatLng(coords.lat, coords.lng)) {
        setSelectedTourLocation(coords.lat, coords.lng);
        tourMap.setView([coords.lat, coords.lng], 13);
      }
    }
  });
}

// Coordinate parsing function
function parseCoordinateInput(input) {
  if (!input) return null;

  const cleaned = input.replace(/\s+/g, ' ').trim();

  // Comma separation
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map((part) => part.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  // Space separation
  const spaceParts = cleaned.split(' ').filter((part) => part !== '');
  if (spaceParts.length === 2) {
    const lat = parseFloat(spaceParts[0]);
    const lng = parseFloat(spaceParts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

// TOUR LOCATION SPECIFIC FUNCTIONS
function useCurrentTourLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (window.tourMapManager) {
          window.tourMapManager.setLocation(lat, lng);
        }
      },
      (error) =>
        showAlert('error', 'Could not get your location for tour location.'),
    );
  }
}

function addTourLocationFromMap() {
  if (!selectedTourCoords) {
    showAlert('error', 'Please select a location on the tour map first.');
    return;
  }

  const { lat, lng } = selectedTourCoords;
  const locationsContainer = document.getElementById('tourLocationsContainer');
  const locationCount =
    locationsContainer.querySelectorAll('.location-item').length;
  const nextDay = locationCount + 1;

  const locationHTML = `
    <div class="location-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f9f9f9;">
      <div class="form__group">
        <label class="form__label">Day Number *</label>
        <input class="form__input" type="number" name="locations[][day]" value="${nextDay}" min="1" required>
      </div>
      <div class="form__group">
        <label class="form__label">Location Description *</label>
        <input class="form__input" type="text" name="locations[][description]" placeholder="e.g. Banff National Park" required>
      </div>
      <div class="form__group">
        <label class="form__label">Coordinates *</label>
        <input class="form__input tour-location-coordinates" type="text" name="locations[][coordinates]" value="${lat.toFixed(6)}, ${lng.toFixed(6)}" required>
      </div>
      <div class="form__group">
        <label class="form__label">Address</label>
        <input class="form__input" type="text" name="locations[][address]" placeholder="Full address">
      </div>
      <button class="remove-location btn btn--small btn--red" type="button">Remove</button>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = locationHTML;
  const newLocation = tempDiv.firstElementChild;
  locationsContainer.appendChild(newLocation);

  // Auto-fill the new TOUR location
  updateTourLocationFields(
    lat,
    lng,
    newLocation.querySelector('.tour-location-coordinates'),
  );

  newLocation
    .querySelector('.remove-location')
    .addEventListener('click', function () {
      this.closest('.location-item').remove();
      renumberTourDays();
    });

  clearTourLocationSelection();
}

function clearTourLocationSelection() {
  if (tourMarker) {
    tourMap.removeLayer(tourMarker);
    tourMarker = null;
  }
  selectedTourCoords = null;
  const displayElement = document.getElementById('tourLocationCoordsDisplay');
  if (displayElement) {
    displayElement.textContent = 'None selected';
    displayElement.style.color = '#666';
  }
}

function renumberTourDays() {
  const locationItems = document.querySelectorAll('.location-item');
  locationItems.forEach((item, index) => {
    const dayInput = item.querySelector('input[name="locations[][day]"]');
    if (dayInput) dayInput.value = index + 1;
  });
}

export const getTourLocationCoordinates = () => selectedTourCoords;
