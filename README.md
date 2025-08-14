# SpaceX Explorer 🚀

A React Native mobile application built with Expo that allows users to explore SpaceX launches and launchpad locations with interactive maps and real-time data.

## 🌟 Features

- **Launch Information**: Browse and search through SpaceX launch history
- **Interactive Maps**: View launchpad locations with Google Maps integration
- **Location Services**: Calculate distance to launchpads from your current location
- **Real-time Data**: Fetch live data from SpaceX API
- **Cross-platform**: Works on iOS, Android, and Web
- **Dark Theme**: Modern dark UI design optimized for space exploration

## 🗺️ Map Implementation and Libraries Used

### Core Mapping Libraries

- **react-native-maps**: Primary mapping component providing cross-platform map functionality
- **@react-native-community/geolocation**: Location services and coordinate handling
- **expo-location**: Expo's location API for permission management and location access

### Map Features

- **Interactive MapView**: Displays launchpad locations with custom markers
- **User Location Tracking**: Shows current user position with blue marker
- **Launchpad Markers**: Red markers indicating SpaceX launchpad locations
- **Distance Calculation**: Real-time distance calculation using Haversine formula
- **Platform-specific Maps**: 
  - iOS: Apple Maps integration
  - Android: Google Maps integration
  - Web: Google Maps fallback

### Geographic Calculations

```typescript
// Haversine formula for accurate Earth distance calculations
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  // ... calculation logic
}
```

### Map Configuration

- **Initial Region**: Automatically centers on launchpad coordinates
- **Zoom Levels**: Optimized delta values (0.05) for launchpad visibility
- **Map Controls**: Compass, scale, and loading indicators enabled
- **Error Handling**: Graceful fallbacks for map loading failures

## 🔐 Permission Flows and Handling

### Location Permission System

The app implements a comprehensive permission flow using Expo's location API:

#### Permission States
- **unasked**: Initial state, user hasn't been prompted
- **granted**: Permission approved, location access enabled
- **denied**: Permission rejected by user
- **restricted**: Permission restricted by system/parental controls

#### Permission Request Flow

```typescript
const requestPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status as PermissionStatus);
    
    if (status === 'granted') {
      await getCurrentLocation();
    }
    return status;
  } catch (err) {
    // Error handling and fallback
  }
};
```

#### User Experience Features

- **Progressive Permission**: Only requests location when needed
- **Clear Messaging**: Explains why location access is required
- **Settings Integration**: Direct link to device settings if permission denied
- **Graceful Degradation**: App functions without location (maps still work)

### Platform-specific Permissions

#### iOS Configuration
```json
"ios": {
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "This app uses location to show distance to launchpads and provide directions."
  }
}
```

#### Android Configuration
```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

#### Expo Plugin Configuration
```json
"plugins": [
  [
    "expo-location",
    {
      "locationAlwaysAndWhenInUsePermission": "Allow SPACEX to use your location."
    }
  ]
]
```

### Permission UI Components

- **Enable Location Button**: Prompts for permission when needed
- **Settings Button**: Direct access to device settings
- **Status Indicators**: Clear visual feedback on permission state
- **Error Handling**: User-friendly error messages and retry options

## 📱 App Screenshots

### Main Screens

#### 1. Launch List Screen
- **Purpose**: Main dashboard showing all SpaceX launches
- **Features**: 
  - Searchable launch list
  - Pull-to-refresh functionality
  - Infinite scroll pagination
  - Launch status indicators
- **UI Elements**: Search bar, launch cards, loading states

#### 2. Launch Details Screen
- **Purpose**: Detailed information about specific launches
- **Features**:
  - Launch metadata (date, mission, rocket)
  - Launchpad information
  - Mission description
  - Interactive map integration
- **UI Elements**: Launch details, map card, action buttons

#### 3. Landing Page
- **Purpose**: App introduction and navigation hub
- **Features**:
  - Welcome message
  - Quick access to main features
  - App branding elements
- **UI Elements**: Hero section, feature cards, navigation

### Component Screenshots

#### MapCard Component
- **Interactive Map**: Google Maps integration with launchpad markers
- **Location Services**: User location display and distance calculation
- **Navigation**: Direct integration with native map applications
- **Error States**: Graceful handling of map loading failures

#### LaunchRow Component
- **Launch Information**: Mission name, date, and status
- **Visual Indicators**: Status badges and mission icons
- **Touch Interactions**: Smooth navigation to detail views

### UI/UX Features

- **Dark Theme**: Optimized for space exploration aesthetic
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Smooth transitions and loading indicators
- **Error Handling**: User-friendly error messages and retry options
- **Accessibility**: Screen reader support and touch targets

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spacex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for web

### Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint
```

## 🏗️ Project Structure

```
spacex/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Main launch list
│   ├── details.tsx        # Launch details
│   └── landing.tsx        # Landing page
├── components/            # Reusable UI components
│   ├── MapCard.tsx        # Interactive map component
│   ├── LaunchRow.tsx      # Launch list item
│   └── ...                # Other components
├── hooks/                 # Custom React hooks
│   ├── useLaunches.ts     # Launch data management
│   ├── useUserLocation.ts # Location services
│   └── useLaunchpad.ts    # Launchpad data
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   ├── geo.ts            # Geographic calculations
│   └── types.ts          # TypeScript definitions
└── assets/               # Images, fonts, and static files
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# SpaceX API Configuration
SPACEX_API_BASE_URL=https://api.spacexdata.com/v4

# Google Maps API Key (for Android)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### API Configuration

The app uses the SpaceX API v4 for launch and launchpad data:

- **Base URL**: `https://api.spacexdata.com/v4`
- **Endpoints**: 
  - `/launches` - Launch information
  - `/launchpads` - Launchpad locations
- **Rate Limiting**: Respects API limits with fallback handling

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy

- **Unit Tests**: Component and hook testing
- **Integration Tests**: API and location service testing
- **E2E Tests**: User flow testing with Detox

## 📦 Building and Deployment

### Development Build

```bash
# Create development build
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Production Build

```bash
# Create production build
eas build --profile production --platform all
```

### App Store Deployment

```bash
# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**: Check Google Maps API key configuration
2. **Location not working**: Verify location permissions in device settings
3. **Build failures**: Ensure all dependencies are compatible with Expo SDK 53

### Debug Mode

Enable debug overlays in development:

```typescript
{__DEV__ && (
  <View style={styles.debugOverlay}>
    <Text>Debug Information</Text>
  </View>
)}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SpaceX**: For providing the public API
- **Expo**: For the excellent development platform
- **React Native Maps**: For cross-platform mapping capabilities
- **Expo Location**: For location services and permission handling

## 📞 Support

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/yourusername/spacex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/spacex/discussions)
- **Email**: your.email@example.com

---

**Built with ❤️ using React Native and Expo** 