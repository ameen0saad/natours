/* eslint-disable */
import { showAlert } from './alerts.js';
import L from 'leaflet';

let map;
let marker;
let selectedCoords = null;

export const initLocationMap = (initialCoords = null) => {
  // Check if map container exists
  const mapContainer = document.getElementById('startLocationMap');
  if (!mapContainer) {
    return null;
  }

  // Initialize the map
  map = L.map('startLocationMap', {
    scrollWheelZoom: true,
    dragging: true,
    tap: true,
  });

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  // Set initial view
  if (initialCoords && isValidCoordinates(initialCoords)) {
    const [lat, lng] = initialCoords;
    map.setView([lat, lng], 13);
    addMarker(lat, lng);
    updateCoordinatesInput(lat, lng);
  } else {
    // Default safe view
    map.setView([0, 0], 2);
  }

  // Add click event to map
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    setSelectedLocation(lat, lng);
  });

  // Initialize event listeners
  initMapEvents();

  // Create and return the map manager
  const mapManager = {
    getSelectedCoords: () => selectedCoords,
    setLocation: (lat, lng) => {
      if (isValidLatLng(lat, lng)) {
        setSelectedLocation(lat, lng);
        map.setView([lat, lng], 13);
      }
    },
    getMap: () => map,
  };

  // Store it globally for the button to access
  window.startMapManager = mapManager;

  return mapManager;
};

// Helper function to validate coordinates array
function isValidCoordinates(coords) {
  if (!Array.isArray(coords) || coords.length !== 2) {
    return false;
  }
  const [lat, lng] = coords;
  return isValidLatLng(lat, lng);
}

// Helper function to validate individual lat/lng
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

function setSelectedLocation(lat, lng) {
  if (!isValidLatLng(lat, lng)) return;

  selectedCoords = [lng, lat]; // Store as [lng, lat] for database
  addMarker(lat, lng);
  updateCoordinatesInput(lat, lng);

  // Always update address and description when location changes
  updateAddressFromCoords(lat, lng);
}

function addMarker(lat, lng) {
  // Remove existing marker
  if (marker) {
    map.removeLayer(marker);
  }

  // Create custom icon
  const customIcon = L.divIcon({
    className: 'location-marker',
    html: '<div style="background-color: #ff0000; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Add new marker only if coordinates are valid
  if (isValidLatLng(lat, lng)) {
    marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `Selected location:<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`,
      )
      .openPopup();
  }
}

function updateCoordinatesInput(lat, lng) {
  const coordinatesInput = document.getElementById('startLocationCoordinates');
  if (coordinatesInput && isValidLatLng(lat, lng)) {
    coordinatesInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    updateCoordinatesDisplay();

    // Mark field as valid
    coordinatesInput.style.borderColor = '#2ecc71';
  }
}

function updateCoordinatesDisplay() {
  const coordinatesInput = document.getElementById('startLocationCoordinates');
  const displayElement = document.getElementById('startLocationCoordsDisplay');
  if (displayElement && coordinatesInput) {
    displayElement.textContent = coordinatesInput.value || 'None selected';
  }
}

// Function to handle manual coordinate input
function handleManualCoordinateInput() {
  const coordinatesInput = document.getElementById('startLocationCoordinates');
  if (!coordinatesInput) return;

  coordinatesInput.addEventListener('change', function () {
    const value = this.value.trim();
    if (!value) {
      clearLocation();
      return;
    }

    // Parse coordinates - support different formats
    const coords = parseCoordinateInput(value);

    if (coords && isValidLatLng(coords.lat, coords.lng)) {
      setSelectedLocation(coords.lat, coords.lng);
      map.setView([coords.lat, coords.lng], 13);
    } else {
      // Invalid coordinates
      this.style.borderColor = '#e74c3c';
      showAlert(
        'error',
        'Invalid coordinates format. Please use: "latitude, longitude" or "lat,lng"',
      );
    }
  });

  // Also update on input for real-time feedback (optional)
  coordinatesInput.addEventListener('input', function () {
    const value = this.value.trim();
    if (value) {
      const coords = parseCoordinateInput(value);
      if (coords && isValidLatLng(coords.lat, coords.lng)) {
        this.style.borderColor = '#f39c12'; // Orange for valid format
      } else {
        this.style.borderColor = '#e74c3c'; // Red for invalid
      }
    } else {
      this.style.borderColor = ''; // Reset to default
    }
  });
}

// Parse different coordinate input formats
function parseCoordinateInput(input) {
  if (!input) return null;

  // Remove extra spaces and split by common delimiters
  const cleaned = input.replace(/\s+/g, ' ').trim();

  // Try comma separation (most common)
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

  // Try space separation
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

function initMapEvents() {
  // Use Current Location button - FIXED VERSION
  const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
  if (useCurrentLocationBtn) {
    useCurrentLocationBtn.addEventListener('click', function () {
      if (navigator.geolocation) {
        // Show loading state
        useCurrentLocationBtn.innerHTML = '📍 Locating...';
        useCurrentLocationBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Use the globally stored map manager
            if (window.startMapManager) {
              window.startMapManager.setLocation(lat, lng);
            } else {
              // Fallback: set location directly
              setSelectedLocation(lat, lng);
              map.setView([lat, lng], 13);
            }

            // Reset button state
            useCurrentLocationBtn.innerHTML = '📍 Use My Current Location';
            useCurrentLocationBtn.disabled = false;
          },
          function (error) {
            console.error('Geolocation error:', error);

            let errorMessage = 'Could not get your location. ';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  'Please allow location access in your browser settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage += 'Location request timed out.';
                break;
              default:
                errorMessage += 'An unknown error occurred.';
            }

            showAlert('error', errorMessage);

            // Reset button state
            useCurrentLocationBtn.innerHTML = '📍 Use My Current Location';
            useCurrentLocationBtn.disabled = false;
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 60000, // 1 minute
          },
        );
      } else {
        showAlert(
          'error',
          'Geolocation is not supported by your browser. Please click on the map to select location.',
        );
      }
    });
  }

  // Clear Location button
  const clearLocationBtn = document.getElementById('clearLocation');
  if (clearLocationBtn) {
    clearLocationBtn.addEventListener('click', function () {
      clearLocation();
    });
  }

  // Handle manual coordinate input
  handleManualCoordinateInput();

  // Update coordinates display when input changes
  const coordinatesInput = document.getElementById('startLocationCoordinates');
  if (coordinatesInput) {
    coordinatesInput.addEventListener('input', updateCoordinatesDisplay);
  }
}

function clearLocation() {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
  selectedCoords = null;
  const coordinatesInput = document.getElementById('startLocationCoordinates');
  if (coordinatesInput) {
    coordinatesInput.value = '';
    coordinatesInput.style.borderColor = '';
  }

  // Also clear the address and description fields
  const addressInput = document.getElementById('startLocationAddress');
  const descriptionInput = document.getElementById('startLocationDescription');
  if (addressInput) addressInput.value = '';
  if (descriptionInput) descriptionInput.value = '';

  updateCoordinatesDisplay();
}

// Enhanced reverse geocoding function - ALWAYS updates fields
function updateAddressFromCoords(lat, lng) {
  if (!isValidLatLng(lat, lng)) return;

  const addressInput = document.getElementById('startLocationAddress');
  const descriptionInput = document.getElementById('startLocationDescription');

  // Store current values to show loading state
  const currentAddress = addressInput ? addressInput.value : '';
  const currentDescription = descriptionInput ? descriptionInput.value : '';

  // Show loading state
  if (addressInput) {
    addressInput.placeholder = 'Fetching address...';
    addressInput.value = ''; // Clear temporarily to show loading
  }
  if (descriptionInput) {
    descriptionInput.placeholder = 'Fetching location...';
    descriptionInput.value = ''; // Clear temporarily to show loading
  }

  // Using OpenStreetMap Nominatim API (free)
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
  )
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        // ALWAYS update address field with new location
        if (addressInput) {
          addressInput.value = data.display_name || 'Address not found';
          addressInput.placeholder = 'Full address';
        }

        // ALWAYS update description with new location
        if (descriptionInput) {
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';
          const state = address.state || address.region || '';
          const country = address.country || '';

          let description = '';
          if (city && country) {
            description = `${city}, ${country}`;
          } else if (city) {
            description = city;
          } else if (country) {
            description = country;
          } else if (data.display_name) {
            // Fallback to first part of display name
            description = data.display_name.split(',')[0] || 'Unknown location';
          } else {
            description = 'Location description';
          }

          descriptionInput.value = description;
          descriptionInput.placeholder = 'e.g. California, USA';
        }
      }
    })
    .catch((error) => {
      console.log('Geocoding error:', error);
      // Restore original values on error or show error message
      const addressInput = document.getElementById('startLocationAddress');
      const descriptionInput = document.getElementById(
        'startLocationDescription',
      );

      if (addressInput) {
        addressInput.value = currentAddress || 'Failed to fetch address';
        addressInput.placeholder = 'Full address';
      }
      if (descriptionInput) {
        descriptionInput.value =
          currentDescription || 'Failed to fetch location';
        descriptionInput.placeholder = 'e.g. California, USA';
      }
    });
}

// Export function to get coordinates for form submission
export const getLocationCoordinates = () => {
  return selectedCoords;
};

// Function to set location from external source
export const setMapLocation = (latitude, longitude) => {
  if (map && isValidLatLng(latitude, longitude)) {
    setSelectedLocation(latitude, longitude);
    map.setView([latitude, longitude], 15);
  }
};
