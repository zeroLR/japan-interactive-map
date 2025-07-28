# Interactive Japan Map

An interactive map of Japan built with D3.js and TypeScript, featuring prefecture and city data with hover tooltips and responsive design.

![Japan Interactive Map](https://github.com/user-attachments/assets/019e6d51-751b-4699-88bf-3b3b440b3688)

## Features

- **Interactive Map**: Hover over prefectures and cities to see detailed information
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Zoom & Pan**: Mouse wheel or touch gestures for zooming and panning
- **Prefecture Data**: Displays major Japanese prefectures with population information
- **City Data**: Shows major cities with population and prefecture information
- **Multilingual**: Shows both English and Japanese names for locations
- **Tooltips**: Rich tooltips with location details on hover

## Screenshots

### Desktop View
![Desktop View](https://github.com/user-attachments/assets/019e6d51-751b-4699-88bf-3b3b440b3688)

### Prefecture Tooltip
![Prefecture Tooltip](https://github.com/user-attachments/assets/c850cb6d-9760-47d2-804c-a3ac4e9d0e99)

### Mobile View
![Mobile View](https://github.com/user-attachments/assets/97b11dee-590d-4b05-8031-d22ec248094f)

## Technology Stack

- **D3.js v7** - For data visualization and SVG manipulation
- **TypeScript** - For type-safe JavaScript development
- **Webpack** - For bundling and development server
- **CSS3** - For responsive styling and mobile-first design
- **GeoJSON** - For geographic data format

## Development

### Prerequisites

- Node.js 16+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zeroLR/japan-interactive-map.git
cd japan-interactive-map

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Building for Production

```bash
# Build for production
npm run build

# Output will be in the dist/ directory
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

## Data Sources

The map includes simplified GeoJSON data for:
- Major Japanese prefectures (Tokyo, Osaka, Kyoto, Hokkaido, Kanagawa, Aichi)
- Major cities (Sapporo, Yokohama, Nagoya, Kobe, Fukuoka, Sendai)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see [LICENSE](LICENSE) file for details.