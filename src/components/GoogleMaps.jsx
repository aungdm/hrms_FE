import React from "react";
import { GoogleMap, useJsApiLoader ,Marker} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMaps = (props) => {
  console.log("Latitude:", props.lat, "Longitude:", props.lng);

  const center = {
    lat: isNaN(Number(props.lat)) ? 37.7749 : Number(props.lat),
    lng: isNaN(Number(props.lng)) ? -122.4194 : Number(props.lng),
  };

  console.log("Center Coordinates:", center);

  console.log({ center });
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCH8jGC2paxWk2GfPLPTdARox-pdYlWFuM",
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : (
    <></>
  );
};

export default React.memo(GoogleMaps);

// import React from "react";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const GoogleMaps = (props) => {
//   const mapStyles = { height: "400px", width: "100%" };
//   //   const defaultCenter = {
//   //     lat: props.lat,
//   //     lng: props.lng,
//   //   };

//   //   const defaultCenter = {
//   //     lat: 37.7749,
//   //     lng: -122.4194
//   // };

//   //   console.log({ defaultCenter });
//   return (
//     <LoadScript googleMapsApiKey="AIzaSyCH8jGC2paxWk2GfPLPTdARox-pdYlWFuM">
//       <GoogleMap
//         mapContainerStyle={mapStyles}
//         zoom={13}
//         center={{
//           lat: Number(props.lat),
//           lng: Number(props.lng),
//         }}
//       >
//         <Marker
//           position={{
//             lat: Number(props.lat),
//             lng: Number(props.lng),
//           }}
//         />
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default GoogleMaps;
