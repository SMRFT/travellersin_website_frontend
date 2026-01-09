// Import specific files from the 'images' folder
// matching the exact names and extensions you provided

import exterior from './images/exterior.jpg';
import roomMain from './images/room_main.jpeg';
import atrium from './images/atrium.jpeg';
import signage from './images/signage.jpeg';
import interiorArt from './images/interior_art.jpg';

// Event/Room images
import event1 from './images/_DSC1055.jpg';
import event2 from './images/_DSC1059.jpg';
import event3 from './images/_DSC1065.jpg';
import event4 from './images/_DSC1072.jpg';
import room1 from './images/_DSC1182.JPG';
import room2 from './images/_DSC1193.JPG';
import room3 from './images/_DSC1278.JPG';
import room4 from './images/_DSC9245.jpg';
import room5 from './images/_DSC9318.jpg';
import venue1 from './images/_DSC9582.JPG';
import venue2 from './images/_DSC9586.JPG';
import venue3 from './images/_DSC9590.JPG';
import venue4 from './images/_DSC9592.jpeg';
import venue5 from './images/_DSC9620.JPG';
import venue6 from './images/_DSC9624.JPG';
import venue7 from './images/_DSC9628.JPG';

// Fallback image
const placeholder = 'https://via.placeholder.com/400x300?text=Travellers+Inn';

// Map the "Keys" (used in Database and Home.js) to the actual files
export const roomImages = {
  // --- Room Types ---
  "deluxe_room": roomMain,
  "classic_room": roomMain,
  "standard_room": roomMain,
  "double_twin": room1,
  "deluxe_double": room2,
  "standard_double": room3,
  "classic_double": room4,
  "room_king": room5,

  // --- Hotel Views (Home Page) ---
  "exterior_view": exterior,
  "atrium_view": atrium,
  "signage_view": signage,
  "art_view": interiorArt,

  // --- Generic Luxury / Lifestyle ---
  "lobby_view": atrium,
  "dining_view": event1,
  "pool_view": placeholder, // Add if available later
  "garden_view": exterior,

  // --- Detailed Asset Mappings ---
  "interior_1": room1,
  "interior_2": room2,
  "interior_3": room3,
  "interior_4": room4,
  "interior_5": room5,
  "event_wide": event1,
  "event_detail": event2,
  "venue_grand": venue1,
  "venue_setup": venue2,
  "venue_1": venue1,
  "venue_2": venue2,
  "venue_3": venue3,
  "venue_4": venue4,
  "venue_5": venue5,
  "venue_6": venue6,
  "venue_7": venue7,
  // --- Fallback ---
  "default": placeholder
};

// Helper function to safely get an image
export const getRoomImage = (imageKey) => {
  return roomImages[imageKey] || roomImages['default'];
};