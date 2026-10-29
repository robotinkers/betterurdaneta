import { useEffect, useRef, useState } from 'react';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import { mapPins, type MapPin } from '../data/hospitals';

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

interface LeafletMap {
  remove(): void;
  fitBounds(
    bounds: [number, number][],
    options?: { padding?: [number, number]; maxZoom?: number }
  ): void;
}
interface LeafletLayer {
  addTo(map: LeafletMap): { bindPopup(html: string): unknown };
}
interface LeafletNamespace {
  map(el: HTMLElement, options?: object): LeafletMap;
  tileLayer(url: string, options: object): { addTo(map: LeafletMap): void };
  marker(center: [number, number], options?: object): LeafletLayer;
  divIcon(options: object): unknown;
}

declare global {
  interface Window {
    L?: LeafletNamespace;
  }
}

/** Loads Leaflet from a CDN once, in the viewer's browser. */
function loadLeaflet(): Promise<LeafletNamespace> {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = LEAFLET_CSS;
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () =>
      window.L ? resolve(window.L) : reject(new Error('Leaflet missing'));
    script.onerror = () => reject(new Error('Could not load the map library'));
    document.head.appendChild(script);
  });
}

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        ch
      ] as string
  );

function pinIcon(L: LeafletNamespace, pin: MapPin) {
  const color = pin.kind === 'city' ? '#0032a0' : '#c62828';
  const style = pin.verified
    ? `background:${color};border:3px solid #fff;`
    : `background:#fff3cd;border:3px dashed ${color};color:${color};`;
  const label = pin.kind === 'city' ? '' : pin.verified ? '+' : '?';
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    html: `<div style="${style}width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.5)">${label}</div>`,
  });
}

function popupHtml(pin: MapPin) {
  const warning = pin.verified
    ? ''
    : '<p style="margin:6px 0 0;color:#8a4b00"><strong>Unverified:</strong> this pin is a placeholder position, not the real location.</p>';
  return `<strong>${escapeHtml(pin.name)}</strong>${pin.details
    .map(line => `<br>${escapeHtml(line)}`)
    .join('')}${warning}`;
}

export default function HospitalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    loadLeaflet()
      .then(L => {
        if (cancelled || !mapRef.current) return;
        const leafletMap = L.map(mapRef.current, { scrollWheelZoom: false });
        map = leafletMap;
        // Open the map framed around every pin with some margin
        leafletMap.fitBounds(
          mapPins.map(pin => [pin.lat, pin.lng] as [number, number]),
          { padding: [70, 70], maxZoom: 16 }
        );
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(leafletMap);
        mapPins.forEach(pin => {
          L.marker([pin.lat, pin.lng], { icon: pinIcon(L, pin) })
            .addTo(leafletMap)
            .bindPopup(popupHtml(pin));
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <>
      <SEO
        title="Hospital map"
        description="Draft map of hospitals in Urdaneta City, Pangasinan."
      />
      <Section className="p-3 mb-12">
        <Heading level={2}>Hospital map</Heading>
        <Text className="text-gray-600 mb-4">
          Where to find the hospitals in Urdaneta City. Tap a pin to see the
          address and telephone number.
        </Text>

        {failed ? (
          <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            The map could not be loaded. The hospitals are listed below.
          </div>
        ) : (
          <div
            ref={mapRef}
            className="h-[420px] w-full rounded border border-gray-300"
            role="region"
            aria-label="Map of Urdaneta City hospitals"
          />
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 pr-4">Place</th>
                <th className="py-2 pr-4">Details</th>
                <th className="py-2">Pin position</th>
              </tr>
            </thead>
            <tbody>
              {mapPins.map(pin => (
                <tr key={pin.id} className="border-b border-gray-200 align-top">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {pin.name}
                  </td>
                  <td className="py-2 pr-4 text-gray-700">
                    {pin.details.map(line => (
                      <div key={line}>{line}</div>
                    ))}
                  </td>
                  <td className="py-2">
                    {pin.verified ? (
                      <span className="text-green-700">Verified</span>
                    ) : (
                      <span className="font-medium text-amber-800">
                        Unverified placeholder
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Text className="mt-4 text-xs text-gray-500">
          Map data &copy; OpenStreetMap contributors. Hospital pin positions
          were supplied by the site maintainer, and the city center coordinates
          come from the Wikipedia article on Urdaneta.
        </Text>
      </Section>
    </>
  );
}
