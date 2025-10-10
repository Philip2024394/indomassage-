
import React, { useState, useRef, useEffect } from 'react';
import Input from './Input';
import Button from './Button';

// FIX: Declare google on the window object to resolve TypeScript errors
// for the Google Maps script loaded externally.
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
  // FIX: Use 'any' type for suggestions to avoid missing google namespace error.
  const [suggestions, setSuggestions] = useState<any[]>([]);
  // FIX: Use 'any' type for AutocompleteService to avoid missing google namespace error.
  const autocompleteService = useRef<any | null>(null);
  // FIX: Use 'any' type for Geocoder to avoid missing google namespace error.
  const geocoder = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);
  
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (autocompleteService.current && value) {
      autocompleteService.current.getPlacePredictions({ input: value, componentRestrictions: { country: 'id' } }, (predictions: any, status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
    }
  };

  // FIX: Use 'any' type for prediction to avoid missing google namespace error.
  const handleSelectSuggestion = (prediction: any) => {
    setInputValue(prediction.description);
    onLocationSelect(prediction.description);
    setSuggestions([]);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && geocoder.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          geocoder.current?.geocode({ location: latLng }, (results: any, status: string) => {
            if (status === 'OK' && results?.[0]) {
              const address = results[0].formatted_address;
              setInputValue(address);
              onLocationSelect(address);
            } else {
              alert('Could not determine address from your location.');
            }
          });
        },
        () => {
          alert('Could not get your location. Please ensure location services are enabled.');
        }
      );
    }
  };
  
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        label={label}
        value={inputValue}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)} // delay to allow click
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 text-slate-200 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full text-sm text-orange-500 hover:text-orange-400 font-medium transition flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-orange-500/10"
        >
          <LocationMarkerIcon />
          Use Current Location
        </button>
      </div>
    </div>
  );
};

const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .757.433.62.62 0 0 0 .28.14l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" /></svg>;

export default LocationInput;
