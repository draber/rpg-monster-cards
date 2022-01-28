
import fn from 'fancy-node';

// This is currently just a rudimentary placeholder for a tab manager at some point
const currentTab = fn.$('#card-listing');

const getCurrentTab = () => {
    return currentTab;
}

export default {
    getCurrentTab
}