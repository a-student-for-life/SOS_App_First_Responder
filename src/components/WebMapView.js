import React, { useMemo } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { COLORS } from '../theme';

/**
 * A Real Map alternative using OpenStreetMap + Leaflet
 * Requires NO API KEYS.
 * 
 * NOTE: If the map is blank in an emulator:
 * 1. Ensure the emulator has internet access.
 * 2. Try 'androidLayerType="software"' (already added).
 * 3. Verify that location permissions are granted and location is enabled in emulator settings.
 */
export default function WebMapView({ 
  victimLat, 
  victimLng, 
  responderLat, 
  responderLng,
  nearbyResponders = [],
  style 
}) {
  const mapHtml = useMemo(() => {
    const markers = [];
    
    // Add Victim
    if (victimLat && victimLng) {
      markers.push(`
        L.marker([${victimLat}, ${victimLng}], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#FF3B30;width:14px;height:14px;border-radius:7px;border:3px solid white;box-shadow:0 0 10px rgba(255,59,48,0.5);'></div>",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(map).bindPopup('Victim');
      `);
    }

    // Add Main Responder (You)
    if (responderLat && responderLng) {
      markers.push(`
        L.marker([${responderLat}, ${responderLng}], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#0A84FF;width:18px;height:18px;border-radius:9px;border:3px solid white;box-shadow:0 0 10px rgba(10,132,255,0.5);'></div>",
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        }).addTo(map).bindPopup('You');
      `);
    }

    // Add Nearby Responders
    nearbyResponders.forEach(r => {
      markers.push(`
        L.marker([${r.lat}, ${r.lng}], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#32D74B;width:14px;height:14px;border-radius:7px;border:3px solid white;'></div>",
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(map).bindPopup('${r.name}');
      `);
    });

    // Default to a central location if no coordinates provided (e.g., Mumbai/India for this demo)
    const centerLat = victimLat || responderLat || 19.0760;
    const centerLng = victimLng || responderLng || 72.8777;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: #000; }
          #map { height: 100vh; width: 100vw; background: #000; }
          .leaflet-control-attribution { display: none; }
          .leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${centerLat}, ${centerLng}], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);
          
          ${markers.join('\n')}

          // Auto-fit if we have multiple markers
          if (${markers.length} > 1) {
            var group = new L.featureGroup();
            map.eachLayer(function(layer){
              if(layer instanceof L.Marker) group.addLayer(layer);
            });
            map.fitBounds(group.getBounds().pad(0.3));
          }
        </script>
      </body>
      </html>
    `;
  }, [victimLat, victimLng, responderLat, responderLng, nearbyResponders]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        androidLayerType={Platform.OS === 'android' ? 'software' : 'none'}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
