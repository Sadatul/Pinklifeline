import dynamic from "next/dynamic";

const EditUserMapView = dynamic(() => import("./editUserDetailsMap/index"), {
    ssr: false,
});

export default EditUserMapView;