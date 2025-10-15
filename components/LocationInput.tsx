
import React, { useState, useRef, useEffect } from 'react';
import Input from './Input';
import Button from './Button';

declare global {
  interface Window {
    google: any;
  }
}

interface LocationInputProps {
  label: string;
  onLocationSelect: (location: string) => void;
  initialValue?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, onLocationSelect, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLocating, setIsLocating] = useState(false);
  const autocomplete = useRef<any | null>(null);
  const geocoder = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && inputRef.current && !autocomplete.current) {
      geocoder.current = new window.google.maps.Geocoder();
      
      const options = {
        componentRestrictions: { country: 'id' },
        fields: ['formatted_address'],
        types: ['geocode'],
      };
      
      autocomplete.current = new window.google.maps.places.Autocomplete(inputRef.current, options);
      
      autocomplete.current.addListener('place_changed', () => {
        const place = autocomplete.current.getPlace();
        if (place && place.formatted_address) {
          setInputValue(place.formatted_address);
          onLocationSelect(place.formatted_address);
        }
      });
    }
  }, []);
  
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onLocationSelect(value); // Keep parent state in sync with typing
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && geocoder.current) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          geocoder.current?.geocode({ location: latLng }, (results: any, status: string) => {
            setIsLocating(false);
            if (status === 'OK' && results?.[0]) {
              const address = results[0].formatted_address;
              setInputValue(address);
              onLocationSelect(address);
            } else {
              alert('Could not determine address from your location. Please try moving to an area with a clearer signal or manually enter your address.');
            }
          });
        },
        (error) => {
          setIsLocating(false);
          console.error("Geolocation error:", error);
          alert('Could not get your location. Please ensure you have granted location permissions for your browser and that GPS/location services are enabled on your device.');
        }
      );
    } else {
      alert("Location services are not supported by your browser.");
    }
  };
  
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        label={label}
        value={inputValue}
        onChange={handleChange}
        autoComplete="off"
      />
      {/* Autocomplete suggestions are rendered by the Google Maps script */}
      <div className="mt-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="w-full text-sm text-orange-500 hover:text-orange-400 font-medium transition flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-orange-500/10 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLocating ? (
              <>
                  <SpinnerIcon />
                  <span>Fetching Location...</span>
              </>
          ) : (
              <>
                  <LocationMarkerIcon />
                  <span>Use Current Location</span>
              </>
          )}
        </button>
      </div>
    </div>
  );
};

const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .757.433.62.62 0 0 0 .28.14l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default LocationInput;
