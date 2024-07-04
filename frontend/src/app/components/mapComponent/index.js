import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useEffect } from 'react';
import L from 'leaflet';
import { useGeolocated } from 'react-geolocated';

export default function MapComponent({ position, setPosition }) {
    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        watchLocationPermissionChange: true,
    });

    useEffect(() => {
        console.log("coords", coords)
        if (coords && !position)
            setPosition({
                lat: coords.latitude,
                lng: coords.longitude,
            })
    }, [coords])

    const MakrerUrl = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
    const customIcon = L.icon({
        iconUrl: MakrerUrl,
        iconSize: [30, 30],
        iconAnchor: [25, 50],
    });
    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setPosition(e.latlng);
                map.flyTo(e.latlng, map.getZoom());
            },
        });
        return position === null ? null : (
            <Marker position={position} icon={customIcon}>
            </Marker>
        );
    }

    return position === null ? null : (
        <MapContainer style={{ height: "400px", width: "100%" }} center={position} zoom={18} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
}