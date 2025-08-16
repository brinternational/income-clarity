# Infrastructure - Context Documentation

## Overview
This folder contains core infrastructure components that provide foundational functionality for the Income Clarity application, including authentication, navigation, theming, PWA features, and mobile optimizations.

## Folder Structure
```
infrastructure/
├── auth/                # Authentication components
├── navigation/          # App navigation system
├── mobile/             # Mobile-specific optimizations
├── theme/              # Theme management
└── pwa/                # Progressive Web App features
```

## Authentication (`auth/`)
- **AuthGuard.tsx**: Route protection component
- **LoginForm.tsx**: Authentication form
- Integration with NextAuth.js
- Session management and persistence
- Role-based access control

## Navigation (`navigation/`)
- **SuperCardsNavigation.tsx**: Main app navigation
- **BottomNavigation.tsx**: Mobile bottom nav
- **EnhancedMobileNavigation.tsx**: Mobile-optimized navigation
- **FeatureDiscoveryTour.tsx**: Onboarding tour
- **PWAHeader.tsx**: PWA-specific header
- **HeaderFAB.tsx** & **DesktopFAB.tsx**: Floating action buttons

## Mobile (`mobile/`)
- **MobileCardLayout.tsx**: Card-based mobile layouts
- **TouchFeedback.tsx**: Haptic feedback system
- Gesture handling and swipe navigation
- Mobile-first responsive design
- Performance optimizations for mobile devices

## Theme (`theme/`)
- **ThemeSelector.tsx**: Theme switching interface
- **ThemeAwareWrapper.tsx**: Theme context provider
- Dark/light mode support
- CSS custom properties for theming
- Accessibility considerations for themes

## PWA (`pwa/`)
- **PWAInstallPrompt.tsx**: Installation prompt
- **ConnectionStatus.tsx**: Network status indicator
- **UpdateNotification.tsx**: App update notifications
- Service worker integration
- Offline functionality
- App manifest management

## Key Features

### Authentication System
- JWT-based authentication
- Secure session management
- OAuth provider integration
- Automatic token refresh
- Protected route handling

### Navigation Architecture
- Dynamic routing with Next.js
- Breadcrumb navigation
- Deep linking support
- Back button handling
- Navigation state persistence

### Mobile Optimization
- Touch-first interface design
- Gesture-based interactions
- Optimized for iOS and Android
- Native-like experience
- Performance monitoring

### Theme Management
- System preference detection
- Smooth theme transitions
- Persistent theme selection
- Component-level theme overrides
- High contrast mode support

### PWA Capabilities
- Install prompts
- Offline functionality
- Background sync
- Push notifications
- App-like experience

## Integration Points
- **Features**: All features use infrastructure components
- **Shared Components**: Theme and navigation integration
- **Context Providers**: Global state management
- **Service Workers**: Background data sync
- **Analytics**: User interaction tracking

## Development Notes
- Infrastructure components are framework-agnostic where possible
- All components follow accessibility guidelines
- Performance optimized with code splitting
- TypeScript strict mode compliance
- Comprehensive testing coverage
- Documentation for all public APIs