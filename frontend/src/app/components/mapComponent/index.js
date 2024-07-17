import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { useEffect } from 'react';
import L from 'leaflet';
import { useGeolocated } from 'react-geolocated';
import Link from 'next/link';
import { pagePaths } from '@/utils/constants';

export default function MapComponent({ position, setPosition, viewAll = false, nearByUsers, setNearByUsers }) {
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
    }, [coords, position, setPosition])

    const MakrerUrl = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
    const customIcon = L.icon({
        iconUrl: MakrerUrl,
        iconSize: [40, 40],
        iconAnchor: [25, 50],
    });

    const customIcon2 = L.icon({
        iconUrl: "https://visualpharm.com/assets/825/Marker-595b40b75ba036ed117d9f54.svg",
        iconSize: [40, 40],
        iconAnchor: [25, 50],
    });

    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setPosition(e.latlng);
                console.log("e.latlng", e.latlng)
                map.flyTo(e.latlng, map.getZoom());
            },
        });
        return position === null ? null : (
            <Marker position={position} icon={customIcon}>
            </Marker>
        );
    }

    return position === null ? null : (
        <MapContainer
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
            {
                viewAll ?
                    <>
                        <Marker position={position} icon={customIcon}>
                            <Popup>
                                <Link href={pagePaths.inbox} className='text-gray-700 '>Hasnain  Adil</Link>
                            </Popup>
                        </Marker>
                        {/* {nearByUsers?.map((user, index) => (
                            <Marker key={index} position={user.location} icon={customIcon2}>
                            <Popup>
                            <Link href={pagePaths.inbox}>{user.name}</Link>
                            </Popup>
                            </Marker>
                            ))} */}
                    </> : <LocationMarker />
            }

        </MapContainer>
    );
}