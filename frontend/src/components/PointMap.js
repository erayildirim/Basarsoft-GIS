import React, { useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { fromLonLat } from 'ol/proj';


function PointMap({ wktFeatures }) {
    const mapRef = useRef();

    useEffect(() => {
        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                image: new Icon({
                    src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                    scale: 0.05
                })
            })
        });

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                vectorLayer
            ],
            view: new View({
                center: fromLonLat([35.0, 39.0]),
                zoom: 6
            })
        });

        vectorSource.clear();
        wktFeatures.forEach(wkt => {
            const feature = new WKT().readFeature(wkt, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            vectorSource.addFeature(feature);
        });

        return () => {
            map.setTarget(undefined);
        };
    }, [wktFeatures]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    );
}

export default React.memo(PointMap);
