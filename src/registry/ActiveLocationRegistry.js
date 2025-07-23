
const AVAILABLE_LOCATIONS = new Set();
const EXCLUDED_LOCATIONS = new Set();

const ActiveLocationRegistry = {

    setAvalableLocations(locationList) {
        AVAILABLE_LOCATIONS.clear();
        if (Array.isArray(locationList)) {
            for (const key of locationList) {
                AVAILABLE_LOCATIONS.add(key);
            }
        }
    },

    setExcludedLocations(locationList) {
        EXCLUDED_LOCATIONS.clear();
        if (Array.isArray(locationList)) {
            for (const key of locationList) {
                EXCLUDED_LOCATIONS.add(key);
            }
        }
    },

    isActive(key) {
        return (!AVAILABLE_LOCATIONS.size || AVAILABLE_LOCATIONS.has(key)) && !EXCLUDED_LOCATIONS.has(key);
    }

};

export default ActiveLocationRegistry;
