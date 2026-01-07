# NKTM Anime Collection WebApp

A modern, feature-rich anime discovery and tracking web application powered by the Jikan API (MyAnimeList).

🌐 **Live Demo:** [nktm.eu.org](https://nktm.eu.org)

---

## ✨ Features

### 🎬 Browse & Discover
- **Hero Carousel** - Auto-rotating featured anime with stunning visuals
- **Current Season** - Browse the latest airing anime
- **Upcoming Releases** - Stay updated with upcoming anime
- **Popular Movies** - Explore all-time popular anime movies
- **Trending Section** - Horizontal scrollable list of trending titles

### 🔍 Search & Filter
- **Real-time Search** - Search anime by title with instant results
- **Genre Filtering** - Filter by specific genres (Action, Romance, Comedy, etc.)
- **Status Filtering** - Filter by airing status (Airing, Completed, Upcoming)
- **Combined Filters** - Use multiple filters simultaneously for precise results

### 📱 User Experience
- **Infinite Scroll** - Seamless content loading as you browse
- **Detailed View** - Comprehensive anime information including:
  - Synopsis, score, episodes, duration, and status
  - Genre tags and popularity rankings
  - Embedded trailers (when available)
  - Streaming platform links (Crunchyroll, Netflix, etc.)
- **Favorites System** - Save your favorite anime to local storage
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Mobile Sidebar** - Touch-friendly navigation menu

### 🎨 Design
- **Glassmorphism UI** - Modern glass-card aesthetic with backdrop blur
- **Dark Theme** - Eye-friendly dark color scheme
- **Smooth Animations** - Polished hover effects and transitions
- **Mac-like Sidebar** - Elegant navigation with gradient accents

---

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Custom styling with modern features:
  - CSS Grid & Flexbox for layouts
  - Backdrop filters for glassmorphism
  - CSS animations and transitions
  - Responsive design with media queries
- **Vanilla JavaScript (ES6+)** - No framework dependencies:
  - Async/await for API calls
  - LocalStorage for favorites persistence
  - Dynamic DOM manipulation
  - Infinite scroll implementation

### API
- **[Jikan API v4](https://jikan.moe/)** - Unofficial MyAnimeList API
  - Anime data, rankings, and metadata
  - Streaming platform information
  - Seasonal and trending anime

### Features Implementation
- **State Management** - Custom state object for app modes and pagination
- **Rate Limiting** - Automatic retry logic for API rate limits
- **Error Handling** - Graceful fallbacks for failed API requests
- **Lazy Loading** - Images loaded on-demand for performance
- **Caching** - Hero carousel data caching to reduce API calls

---

## 📂 Project Structure

```
HTML/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── script.js       # Application logic and API integration
└── README.md       # Project documentation
```

---

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. No build process or dependencies required!

---

## 📄 License

This project uses the [Jikan API](https://jikan.moe/) which is free and open source.