import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useState } from 'react';
import L from 'leaflet';

export default function MapComponent({initialPosition = null}) {
    const MakrerUrl = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
    const customIcon = L.icon({
        iconUrl: MakrerUrl,
        iconSize: [30, 30],
        iconAnchor: [25, 50],
    });
    function LocationMarker({initialPosition = null}) {
        const [position, setPosition] = useState(initialPosition);
        const map = useMapEvents({
            click(e) {
                setPosition(e.latlng);
                map.flyTo(e.latlng, map.getZoom());
                console.log(e.latlng);
            },
        });

        return position === null ? null : (
            <Marker position={position} icon={customIcon}>
            </Marker>
        );
    }

    return (
        <MapContainer style={{ height: "400px", width: "100%" }} center={initialPosition} zoom={18} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker initialPosition={initialPosition} />
        </MapContainer>
    );
}