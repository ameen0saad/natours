/* eslint-disable */
import L from 'leaflet';

export const displayMap = (locations) => {
  // Initialize the map
  const map = L.map('map', {
    scrollWheelZoom: false,
    dragging: true,
    tap: false,
  });

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  const bounds = L.latLngBounds();

  // Create a feature group to store all markers
  const markers = L.featureGroup();

  locations.forEach((loc) => {
    // Create custom icon
    const customIcon = L.divIcon({
      className: 'marker',
      html: '<div style="background-color: #ff0000; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates = [loc.coordinates[1], loc.coordinates[0]];

    // Create marker
    const marker = L.marker(coordinates, {
      icon: customIcon,
    });

    // Add popup to marker
    marker.bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
      offset: L.point(0, -10),
      closeButton: true,
      className: 'map-popup',
    });

    // Add marker to feature group
    markers.addLayer(marker);

    // Extend bounds to include current location
    bounds.extend(coordinates);
  });

  // Add all markers to map
  markers.addTo(map);

  // Fit map to bounds with padding
  map.fitBounds(bounds, {
    paddingTopLeft: [100, 200], // left, top
    paddingBottomRight: [100, 150], // right, bottom
  });

  // Optional: Set a maximum zoom level to prevent over-zooming
  map.setMaxBounds(bounds.pad(0.1));
};
