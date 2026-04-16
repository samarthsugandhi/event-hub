'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event, CATEGORY_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';

// No CDN dependency — all markers use custom CSS-based divIcon (see createIcon below)
// This means the map works without any external image/CDN requests.

// Custom colored markers
function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.04);
    "><div style="
      width: 8px; height: 8px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const CATEGORY_MARKER_COLORS: Record<string, string> = {
  technical: '#3b82f6',
  workshop: '#8b5cf6',
  cultural: '#ec4899',
  sports: '#22c55e',
  seminar: '#f97316',
  hackathon: '#ef4444',
  webinar: '#06b6d4',
  conference: '#eab308',
  other: '#6b7280',
};

interface MapViewProps {
  events: Event[];
  center: [number, number];
}

export default function MapView({ events, center }: MapViewProps) {
  const eventsWithCoords = events.filter(
    (e) => e.locationCoordinates?.lat && e.locationCoordinates?.lng
  );

  return (
    <MapContainer
      center={center}
      zoom={17}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={true}
      className="campus-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {eventsWithCoords.map((event) => {
        const isFull = event.registrationCount >= event.maxParticipants;
        const color = CATEGORY_MARKER_COLORS[event.category] || '#6b7280';
        return (
          <Marker
            key={event._id}
            position={[event.locationCoordinates!.lat, event.locationCoordinates!.lng]}
            icon={createIcon(color)}
          >
            <Popup maxWidth={280} minWidth={220}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: '220px' }}>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: color + '22',
                  color: color,
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginBottom: '6px',
                  border: `1px solid ${color}44`,
                }}>
                  {CATEGORY_LABELS[event.category]}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: '#1e1a3a' }}>
                  {event.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 8px' }}>
                  📍 {event.venue}
                </p>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '4px' }}>
                  📅 {formatDate(event.date)} {event.time && `• ${event.time}`}
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                  👥 {event.registrationCount}/{event.maxParticipants} registered
                  {isFull && (
                    <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '6px' }}>
                      • FULL
                    </span>
                  )}
                </div>
                {event.pricingType === 'paid' && (
                  <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, marginBottom: '8px' }}>
                    💰 ₹{event.price} {event.priceType === 'per_team' ? '/team' : '/person'}
                  </div>
                )}
                <a
                  href={`/events/${event._id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                    color: 'white',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  View Event →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
