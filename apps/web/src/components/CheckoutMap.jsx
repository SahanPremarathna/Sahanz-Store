import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function MapPinEvents({ coordinates, onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    }
  });

  const map = useMap();

  useEffect(() => {
    map.flyTo([coordinates.latitude, coordinates.longitude], map.getZoom(), {
      duration: 0.5
    });
  }, [coordinates, map]);

  return null;
}

export default function CheckoutMap({ coordinates, onChange }) {
  return (
    <div className="checkout-map-shell">
      <MapContainer
        center={[coordinates.latitude, coordinates.longitude]}
        className="checkout-map"
        scrollWheelZoom={true}
        zoom={16}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.latitude, coordinates.longitude]} />
        <MapPinEvents coordinates={coordinates} onChange={onChange} />
      </MapContainer>
      <p className="muted">Click the map to place the delivery pin exactly where the rider should go.</p>
    </div>
  );
}
