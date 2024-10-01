import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./mapComponent/index"), {
    ssr: false,
});

export default MapView;