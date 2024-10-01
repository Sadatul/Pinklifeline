import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Pane, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { use, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useGeolocated } from 'react-geolocated';
import Link from 'next/link';
import { getNearByUsersGeneral, locationResolution, pagePaths } from '@/utils/constants';
import { LocateFixed } from 'lucide-react';
import Loading from '../loading';
import { cellToLatLng, latLngToCell } from 'h3-js';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'sonner';

export default function MapComponent({ position, setPosition, viewAll = false, nearByUsers, setNearByUsers, updating = false , registration = false}) {
    const mapRef = useRef(null);
    const [selectedPosition, setSelectedPosition] = useState(null)
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

    useEffect(() => {
        if (selectedPosition && !registration) {
            const latlng = latLngToCell(selectedPosition.lat, selectedPosition.lng, locationResolution)
            toast.loading("Updating nearby users")
            axiosInstance.get(getNearByUsersGeneral, {
                params: {
                    location: latlng
                }
            }).then((res) => {
                console.log("nearByUsers", res.data)
                toast.dismiss()
                let updatedUser = [];
                for (const user of res.data) {
                    const latlng = cellToLatLng(user.location)
                    updatedUser.push({
                        ...user,
                        location: {
                            lat: latlng[0],
                            lng: latlng[1]
                        }
                    })
                }
                setNearByUsers([...updatedUser])
            }).catch((error) => {
                console.log("Error getting nearby user:", error)
                toast.dismiss()
                toast.error("Error occured refreshing the page", {
                    action: {
                        label: "Refresh",
                        onClick: () => {
                            window.location.reload();
                        }
                    }
                })
            })
        }
        else {
            setPosition(selectedPosition)
        }
    }, [selectedPosition])


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

    const customIconSelected = L.icon({
        iconUrl: "https://www.reshot.com/preview-assets/icons/WBY8X5M4UL/google-maps-WBY8X5M4UL.svg",
        iconSize: [40, 40],
        iconAnchor: [25, 50]
    })


    function LocationRefSetUp() {
        mapRef.current = useMap();
        return null;
    }

    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setSelectedPosition({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                });
                map.flyTo(e.latlng, map.getZoom());
            },
        });
        return selectedPosition === null ? null : (
            <Marker position={{
                lat: selectedPosition.lat,
                lng: selectedPosition.lng
            }} icon={customIconSelected}>
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
                center={position} zoom={20} scrollWheelZoom={true}>
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
                {nearByUsers?.map((user, index) => (
                    <Marker key={index} position={user.location} icon={customIcon}>
                        <Popup>
                            <Link href={pagePaths.userProfile(user.id)}>{user.fullName}</Link>
                        </Popup>
                    </Marker>
                ))}
                <LocationMarker />
            </MapContainer>
        </div>
    );
}