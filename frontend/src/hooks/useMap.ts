import { useEffect, useState, useRef, MutableRefObject } from 'react';
import { Map, TileLayer } from 'leaflet';

import type { City } from '../types/types';

const MapSettings = {
  TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};

const DEFAULT_CITY: City = {
  name: 'Paris',
  coordinates: {
    latitude: 48.8566,
    longitude: 2.3522,
  },
} as City;

const useMap = (
  mapRef: MutableRefObject<HTMLElement | null>,
  city: City
): Map | null => {
  const [map, setMap] = useState<Map | null>(null);
  const isRenderedRef = useRef<boolean>(false);
  const safeCity = city?.coordinates?.latitude ? city : DEFAULT_CITY;

  useEffect(() => {
    if (mapRef.current !== null && !isRenderedRef.current) {
      const instance = new Map(mapRef.current, {
        center: {
          lat: safeCity.coordinates.latitude,
          lng: safeCity.coordinates.longitude,
        }
      });

      const layer = new TileLayer(
        MapSettings.TILE_LAYER,
        {
          attribution: MapSettings.ATTRIBUTION,
        }
      );

      instance.addLayer(layer);

      setMap(instance);
      isRenderedRef.current = true;
    }
  }, [mapRef, map, safeCity]);

  return map;
};

export default useMap;
