import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Pane, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGeolocated } from 'react-geolocated';
import Link from 'next/link';
import { pagePaths } from '@/utils/constants';
import { LocateFixed } from 'lucide-react';
import Loading from '../loading';

export default function EditUserLocationMap({ editable, currentPosition, setCurrentPosition }) {
    const mapRef = useRef(null);
    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        watchLocationPermissionChange: true,
    });

    const MakrerUrl = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
    const customIcon = L.icon({
        iconUrl: MakrerUrl,
        iconSize: [40, 40],
        iconAnchor: [25, 50],
    });

    const customIconYou = L.icon({
        iconUrl: "https://visualpharm.com/assets/825/Marker-595b40b75ba036ed117d9f54.svg",
        iconSize: [40, 40],
        iconAnchor: [25, 50],
    });

    function LocationRefSetUp() {
        mapRef.current = useMap();
        console.log("mapRef", mapRef.current)
        return null;
    }

    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setCurrentPosition(e.latlng);
                console.log("e.latlng", e.latlng)
                map.flyTo(e.latlng, map.getZoom());
            },
        });
        return currentPosition === null ? null : (
            <Marker position={currentPosition} icon={customIcon}>
            </Marker>
        );
    }

    if (!coords) {
        return (
            <div className="flex flex-col items-center justify-center w-full text-red-500 text-2xl font-bold">
                **You need to enable location services to continue**
            </div>
        )
    }

    return (
        <div className='relative size-full'>
            <button className='absolute top-5 right-10 bg-white z-50 p-1 bg-opacity-90 hover:bg-opacity-100 hover:scale-95 rounded-md shadow-md'
                onClick={() => {
                    if (mapRef.current) {
                        mapRef.current.flyTo({
                            lat: coords.latitude,
                            lng: coords.longitude
                        }, mapRef.current.getZoom());
                    }
                }}
            >
                <LocateFixed size={32} className='text-blue-600' />
            </button>
            <MapContainer
                id='map'
                style={{
                    height: viewAll ? "100%" : "400px",
                    width: "100%",
                    zIndex: 0
                }}
                center={position} zoom={18} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={{
                    lat: coords.latitude,
                    lng: coords.longitude
                }}
                    icon={customIconYou}>
                    <Popup>
                        <div className='text-gray-700 '>You</div>
                    </Popup>
                </Marker>
                <LocationRefSetUp />
                {editable && <LocationMarker />}
            </MapContainer>
        </div>
    )

}