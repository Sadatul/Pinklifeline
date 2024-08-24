import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Pane, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGeolocated } from 'react-geolocated';
import Link from 'next/link';
import { pagePaths } from '@/utils/constants';
import { LocateFixed } from 'lucide-react';
import Loading from '../loading';

export default function MapComponent({ position, setPosition, viewAll = false, nearByUsers, setNearByUsers, updating = false }) {
    const mapRef = useRef(null);
    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        watchLocationPermissionChange: true,
    });

    useEffect(() => {
        console.log("coords", coords)
        if (coords && !position & !updating) {
            console.log("Setting position to current location")
            setPosition({
                lat: coords.latitude,
                lng: coords.longitude,
            })
        }
    }, [coords, position, setPosition, updating])

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

    if (!coords) {
        return (
            <div className="flex flex-col items-center justify-center w-full text-red-500 text-2xl font-bold">
                **You need to enable location services to continue**
            </div>
        )
    }
    if (!position || !coords || (viewAll && !nearByUsers)) return <Loading chose='hand' />
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
                        <Link href={pagePaths.dashboardPages.userdetailsPage} className='text-gray-700 '>You</Link>
                    </Popup>
                </Marker>
                <LocationRefSetUp />
                {
                    viewAll === true ?
                        <>
                            {nearByUsers?.map((user, index) => (
                                <Marker key={index} position={user.location} icon={customIcon}>
                                    <Popup>
                                        <Link href={pagePaths.inbox}>{user.fullName}</Link>
                                    </Popup>
                                </Marker>
                            ))}
                        </>
                        :
                        <LocationMarker />
                }
            </MapContainer>
        </div>
    );
}