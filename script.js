const API_BASE = "https://api.jikan.moe/v4";

let state = {
    mode: 'home', // home, season, upcoming, movies, favorites, search
    page: 1,
    isLoading: false,
    hasMore: true,
    filterGenre: '',
    filterStatus: '',
    query: ''
};

// Cache for Hero
let heroData = null;
let currentAnime = null; // New global to store currently viewed anime

window.onload = () => {
    init();
    setupInfiniteScroll();

    // Mobile Menu Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (mobileBtn && sidebar) {
        mobileBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-sidebar-open');
        };

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-sidebar-open');
            }
        });

        // Close when clicking a nav item (mobile UX)
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('mobile-sidebar-open');
            });
        });
    }
};

async function init() {
    // Initial Load: Populates sidebar short list, hero, trend row, main grid
    loadSidebarList();
    await changeMode('home');
}

/* --- NAVIGATION --- */
async function changeMode(mode) {
    state.mode = mode;
    state.page = 1;
    state.hasMore = true;
    if (mode !== 'search') state.query = '';

    // UI Update
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${mode === 'search' ? 'home' : mode}`);
    if (activeNav) activeNav.classList.add('active');

    // View Switching
    document.getElementById('view-detail').classList.add('hidden');
    document.getElementById('view-home').classList.remove('hidden');
    // window.scrollTo(0, 0); // Reset scroll? Actually logic is in #content-container
    document.getElementById('content-container').scrollTo(0, 0);

    const gridTitle = document.getElementById('main-grid-title');
    const hero = document.getElementById('hero-section');
    const trending = document.getElementById('trending-row').parentNode;

    // Clear Grid
    document.getElementById('main-grid').innerHTML = '';

    // Filter Visibility & Reset
    const filterContainer = document.getElementById('filter-container');
    if (filterContainer) {
        if (mode === 'home') {
            filterContainer.classList.add('hidden');
            // Reset state
            state.filterGenre = '';
            state.filterStatus = '';
            const fg = document.getElementById('filter-genre');
            const fs = document.getElementById('filter-status');
            if (fg) fg.value = '';
            if (fs) fs.value = '';
        } else {
            filterContainer.classList.remove('hidden');
        }
    }

    // Mode Logic
    if (mode === 'home') {
        hero.classList.remove('hidden');
        trending.classList.remove('hidden');
        gridTitle.innerText = "Popular Updates";
        // if (!heroData) loadHero(); // Replaced by new robust carousel which handles caching internally/ or just reload
        loadHero(); // Always try to reload hero to ensure fresh connection or retry
        loadTrendingRow();
    } else {
        hero.classList.add('hidden');
        trending.classList.add('hidden'); // Hide horizontal scroller on specific pages

        if (mode === 'season') gridTitle.innerText = "Current Season (New)";
        else if (mode === 'upcoming') gridTitle.innerText = "Top Upcoming Anime";
        else if (mode === 'movies') gridTitle.innerText = "All Time Popular Movies";
        else if (mode === 'favorites') gridTitle.innerText = "Your Favorites";
        else if (mode === 'search') gridTitle.innerText = `Search Results`;
    }

    await loadGrid();
}

/* --- DATA LOADING --- */
function getApiUrl() {
    const { mode, page, filterGenre, filterStatus, query } = state;

    // Base parameters
    let params = new URLSearchParams();
    params.append('page', page);

    // Check if we need to use the advanced search endpoint (mixed filters)
    // or if we can use the specialized top/season endpoints (cleaner default results)
    const hasFilters = query || filterGenre || filterStatus;

    if (hasFilters) {
        // Use generic search endpoint for any filtering
        // Fix: Sort by members (descending) for "Most Popular"
        params.append('order_by', 'members');
        params.append('sort', 'desc');
        params.append('sfw', 'true'); // Safe for work

        if (query) params.append('q', query);
        if (filterGenre) params.append('genres', filterGenre);

        // Handle Status
        if (filterStatus) {
            // User explicit status
            params.append('status', filterStatus);
        } else {
            // Implicit status based on mode (if user didn't override)
            if (mode === 'upcoming') params.append('status', 'upcoming');
            // 'season' mode usually implies airing, but 'seasons/now' is more specific.
            // If filtering, we fallback to 'airing' which is close enough.
            if (mode === 'season') params.append('status', 'airing');
        }

        // Handle Type
        if (mode === 'movies') params.append('type', 'movie');

        return `${API_BASE}/anime?${params.toString()}`;
    }
    else {
        // No filters? Use the specialized, curated endpoints for each mode
        if (mode === 'season') return `${API_BASE}/seasons/now?page=${page}`;
        if (mode === 'upcoming') return `${API_BASE}/seasons/upcoming?page=${page}`;
        if (mode === 'movies') return `${API_BASE}/top/anime?type=movie&page=${page}`;

        // Home / Default
        return `${API_BASE}/top/anime?filter=bypopularity&page=${page}`;
    }
}

async function loadGrid(append = false) {
    if (state.isLoading || !state.hasMore) return;
    state.isLoading = true;
    document.getElementById('infinite-loader').classList.remove('hidden');

    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    try {
        // If favorites, local load
        if (state.mode === 'favorites') {
            if (state.page === 1) renderGrid(getFavorites(), false);
            state.hasMore = false;
        } else {
            let url = getApiUrl();
            let res = await fetch(url);

            // Handle Rate Limit (429)
            if (res.status === 429) {
                console.warn('Rate limit hit, waiting...');
                await wait(1000); // 1s cooldown
                res = await fetch(url); // Retry once
            }

            if (!res.ok) throw new Error(`API Error ${res.status}`);

            const data = await res.json();
            const items = data.data || [];

            if (append) renderGrid(items, true);
            else renderGrid(items, false);

            if (!data.pagination || !data.pagination.has_next_page) {
                state.hasMore = false;
            }
            // Edge case: if empty list returned, stop loading
            if (items.length === 0) state.hasMore = false;
        }
    } catch (err) {
        console.error(err);
        // Don't disable infinite scroll forever on error, just stop this attempt
        // But if it's page 1, show error
        if (state.page === 1 && !append) {
            document.getElementById('main-grid').innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Unable to load content. API may be busy.</p>';
        }
    }
    finally {
        state.isLoading = false;
        document.getElementById('infinite-loader').classList.add('hidden');
    }
}

let heroTimer;
let heroIndex = 0;
let heroItems = [];

async function loadHero() {
    // Helper to delay
    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    try {
        // Attempt 1: Seasons Now (most likely to have fresh images)
        let res = await fetch(`${API_BASE}/seasons/now?limit=5`);
        if (res.ok) {
            let data = await res.json();
            heroItems = data.data || [];
        }

        // Attempt 2: Top Airing (fallback)
        if (!heroItems.length) {
            await wait(1000); // Backoff for rate limit
            res = await fetch(`${API_BASE}/top/anime?filter=airing&limit=5`);
            if (res.ok) {
                let data = await res.json();
                heroItems = data.data || [];
            }
        }

        // Attempt 3: Generic Top (last resort)
        if (!heroItems.length) {
            await wait(1000);
            res = await fetch(`${API_BASE}/top/anime?limit=5`);
            if (res.ok) {
                let data = await res.json();
                heroItems = data.data || [];
            }
        }

        if (heroItems.length > 0) {
            renderHero();
            startHeroCarousel();
        } else {
            throw new Error('All hero fetches returned empty');
        }
    } catch (e) {
        console.error('Hero critical fail', e);
        document.getElementById('hero-section').innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4">
                <span>Unable to load highlights.</span>
                <button onclick="loadHero()" class="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Retry Connection</button>
            </div>
        `;
    }
}

function renderHero() {
    const container = document.getElementById('hero-section');
    const slidesHtml = heroItems.map((item, idx) => `
        <div class="hero-slide ${idx === heroIndex ? 'active' : ''}">
            <img src="${item.images.jpg.large_image_url}" class="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[10000ms] ease-linear scale-100 hover:scale-110">
            <div class="absolute inset-0 hero-gradient"></div>
            <div class="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                <div class="flex items-center gap-3 mb-4">
                    <span class="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-blue-900/50">Featured #${idx + 1}</span>
                    <span class="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">Score: ${item.score}</span>
                </div>
                <h1 class="text-4xl md:text-6xl font-black mb-4 leading-none drop-shadow-lg line-clamp-2">${item.title}</h1>
                <p class="text-gray-300 line-clamp-3 mb-6 font-medium text-lg drop-shadow-md">${item.synopsis}</p>
                <button onclick="openDetail(${item.mal_id})" class="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">View Details</button>
            </div>
        </div>
    `).join('');

    const controlsHtml = `
        <div class="absolute bottom-8 right-8 flex gap-3 z-30">
            <button onclick="moveHero(-1)" class="w-12 h-12 rounded-full glass-card hover:bg-white/20 flex items-center justify-center transition text-xl">←</button>
            <button onclick="moveHero(1)" class="w-12 h-12 rounded-full glass-card hover:bg-white/20 flex items-center justify-center transition text-xl">→</button>
        </div>
        <div class="absolute bottom-8 right-1/2 translate-x-1/2 flex gap-2 z-30 md:right-auto md:left-12 md:translate-x-0">
            ${heroItems.map((_, i) => `<div class="w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-6' : 'bg-white/30'}"></div>`).join('')}
        </div>
    `;

    container.innerHTML = slidesHtml + controlsHtml;
}

function moveHero(dir) {
    heroIndex = (heroIndex + dir + heroItems.length) % heroItems.length;
    renderHero(); // Re-render to update classes. Efficient enough for 5 items.
    resetHeroTimer();
}

function startHeroCarousel() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(() => moveHero(1), 6000); // 6s auto slide
}

function resetHeroTimer() {
    clearInterval(heroTimer);
    startHeroCarousel();
}

async function loadTrendingRow() {
    try {
        // Trending / New
        const res = await fetch(`${API_BASE}/seasons/now?limit=10`);
        const data = await res.json();
        const container = document.getElementById('trending-row');
        container.innerHTML = data.data.map(item => `
            <div onclick="openDetail(${item.mal_id})" class="min-w-[200px] snap-start cursor-pointer group">
                <div class="relative h-[280px] rounded-xl overflow-hidden mb-3">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                    <img src="${item.images.jpg.large_image_url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-yellow-400">★ ${item.score || '?'}</div>
                </div>
                <h3 class="font-bold text-gray-200 line-clamp-1 group-hover:text-blue-400 transition">${item.title}</h3>
                <p class="text-xs text-gray-500">${item.type} • ${item.episodes || '?'} eps</p>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function loadSidebarList() {
    // "Short List" - Top 5 Trending
    try {
        const res = await fetch(`${API_BASE}/top/anime?filter=airing&limit=5`);
        const data = await res.json();
        const container = document.getElementById('sidebar-short-list');
        container.innerHTML = data.data.map((item, idx) => `
            <div onclick="openDetail(${item.mal_id})" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                <span class="text-xs font-bold text-gray-500 w-4">#${idx + 1}</span>
                <img src="${item.images.jpg.small_image_url}" class="w-8 h-8 rounded object-cover">
                <div class="overflow-hidden">
                    <div class="truncate font-semibold text-gray-300 text-xs">${item.title}</div>
                    <div class="text-[10px] text-gray-500">${item.score} ★</div>
                </div>
            </div>
        `).join('');
    } catch (e) { }
}

/* --- RENDERING GRID --- */
function renderGrid(list, append) {
    const container = document.getElementById('main-grid');
    const html = list.map(item => `
        <div onclick="openDetail(${item.mal_id})" class="glass-card group rounded-xl overflow-hidden cursor-pointer relative pb-3">
            <div class="aspect-[3/4] overflow-hidden relative">
                <img src="${item.images.jpg.large_image_url}" loading="lazy" class="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-80">
                <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent opacity-60 group-hover:opacity-90 transition"></div>
                <div class="absolute bottom-2 left-2 right-2">
                        <div class="text-xs font-bold text-yellow-400 mb-1">★ ${item.score || 'N/A'}</div>
                </div>
            </div>
            <div class="p-3 pt-4">
                <h3 class="font-bold text-sm text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-400 transition">${item.title}</h3>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-[10px] text-gray-500 border border-white/10 px-1.5 py-0.5 rounded">${item.year || 'N/A'}</span>
                    <span class="text-[10px] text-gray-500">${item.type}</span>
                </div>
            </div>
        </div>
    `).join('');

    if (append) container.insertAdjacentHTML('beforeend', html);
    else container.innerHTML = html;
}

/* --- DETAILED VIEW --- */
async function openDetail(id) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-detail').innerHTML = '<div class="flex h-96 items-center justify-center"><span class="loader"></span></div>';
    document.getElementById('view-detail').classList.remove('hidden');
    document.getElementById('content-container').scrollTo(0, 0);

    try {
        const res = await fetch(`${API_BASE}/anime/${id}/full`);
        const json = await res.json();
        const anime = json.data;
        currentAnime = anime; // Store for favorites logic
        const isFav = isFavorite(anime.mal_id);

        // Fetch Streaming Links
        let streamingHtml = '';
        try {
            const streamRes = await fetch(`${API_BASE}/anime/${id}/streaming`);
            const streamJson = await streamRes.json();
            const streams = streamJson.data || [];
            if (streams.length > 0) {
                streamingHtml = `
                    <div class="glass-card p-6 rounded-2xl mb-8">
                        <h3 class="text-xl font-bold mb-4">Where to Watch</h3>
                        <div class="flex flex-wrap gap-3">
                            ${streams.map(s => `
                                <a href="${s.url}" target="_blank" class="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition hover:scale-105">
                                    <span class="font-semibold text-gray-200">${s.name}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (e) { console.warn('Streaming links failed', e); }

        const html = `
            <div class="relative">
                <!-- Back Button -->
                <button onclick="changeMode(state.mode)" class="mb-6 px-4 py-2 glass-card rounded-full text-sm font-bold hover:bg-white/10 flex items-center gap-2 transition">
                    <span>← Back</span>
                </button>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <!-- Left Poster -->
                    <div class="space-y-4">
                        <div class="rounded-2xl overflow-hidden shadow-2xl glass-card p-1">
                            <img src="${anime.images.jpg.large_image_url}" class="w-full h-full object-cover rounded-xl">
                        </div>
                        <button onclick="toggleFavorite()" id="fav-btn" class="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isFav ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'glass-card hover:bg-white/10'}">
                            ${isFav ? '♥ Saved to Favorites' : '♡ Add to Favorites'}
                        </button>
                        <div class="glass-card p-4 rounded-xl space-y-2 text-sm text-gray-400">
                            <div class="flex justify-between"><span>Rank</span><span class="text-white">#${anime.rank}</span></div>
                            <div class="flex justify-between"><span>Popularity</span><span class="text-white">#${anime.popularity}</span></div>
                            <div class="flex justify-between"><span>Members</span><span class="text-white">${anime.members}</span></div>
                        </div>
                    </div>

                    <!-- Right Info -->
                    <div class="md:col-span-2 space-y-8">
                        <div>
                            <h1 class="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">${anime.title}</h1>
                            <p class="text-lg text-gray-500 font-medium">${anime.title_english || ''}</p>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            ${anime.genres.map(g => `<span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">${g.name}</span>`).join('')}
                        </div>
                        
                        ${streamingHtml}

                        <div class="glass-card p-6 rounded-2xl relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h3 class="text-xl font-bold mb-4">Synopsis</h3>
                                <p class="text-gray-300 leading-relaxed text-sm md:text-base">${anime.synopsis}</p>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="glass-card p-4 rounded-xl">
                                <div class="text-xs text-gray-500 mb-1">Score</div>
                                <div class="text-2xl font-bold text-yellow-400">${anime.score}</div>
                            </div>
                            <div class="glass-card p-4 rounded-xl">
                                <div class="text-xs text-gray-500 mb-1">Episodes</div>
                                <div class="text-2xl font-bold">${anime.episodes || '?'}</div>
                            </div>
                            <div class="glass-card p-4 rounded-xl">
                                <div class="text-xs text-gray-500 mb-1">Duration</div>
                                <div class="text-lg font-bold truncate">${anime.duration}</div>
                            </div>
                            <div class="glass-card p-4 rounded-xl">
                                <div class="text-xs text-gray-500 mb-1">Status</div>
                                <div class="text-lg font-bold truncate">${anime.status}</div>
                            </div>
                        </div>

                        ${anime.trailer.embed_url ? `
                        <div class="rounded-2xl overflow-hidden glass-card p-1">
                            <iframe src="${anime.trailer.embed_url}" class="w-full aspect-video rounded-xl" allowfullscreen></iframe>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('view-detail').innerHTML = html;
    } catch (e) {
        document.getElementById('view-detail').innerHTML = `<p class="text-center text-red-500 py-10">Error loading details.</p>`;
    }
}

/* --- FILTERS & SEARCH --- */
// Apply filters
function applyFilters() {
    state.filterGenre = document.getElementById('filter-genre').value;
    state.filterStatus = document.getElementById('filter-status').value;
    state.page = 1;
    state.hasMore = true;
    document.getElementById('main-grid').innerHTML = ''; // Clear
    document.getElementById('infinite-loader').classList.remove('hidden'); // Show loader
    loadGrid();
}

async function triggerSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (q) {
        state.query = q;
        if (state.mode !== 'search') {
            await changeMode('search');
        } else {
            state.page = 1;
            state.hasMore = true;
            document.getElementById('main-grid').innerHTML = '';
            loadGrid();
        }
    }
}

// Search Listeners
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') triggerSearch();
});
// Add specific icon trigger (needs ID or selector from parent)
// The search icon is in HTML but not easily selectable effectively without ID. 
// Adding listener via parent delegation or ID is best. 
// However, the original code added listener to the SVG container? 
// I will rely on 'Enter' for now or the user should have added an onClick to the span.
// Let's add click listener to the icon span if possible.
const searchIconSpan = document.getElementById('search-input').previousElementSibling;
if (searchIconSpan) {
    searchIconSpan.style.cursor = 'pointer';
    searchIconSpan.onclick = triggerSearch;
}

/* --- INFINITE SCROLL --- */
function setupInfiniteScroll() {
    const container = document.getElementById('content-container');
    container.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 600) {
            if (state.hasMore && !state.isLoading) {
                state.page++;
                loadGrid(true);
            }
        }
    });
}

function scrollHoriz(id, dir) {
    const row = document.getElementById(id === 'trend' ? 'trending-row' : '');
    if (row) row.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

/* --- FAVORITES --- */
function isFavorite(id) {
    const favs = getFavorites();
    // Check if any stored object has this ID
    return favs.some(f => f.mal_id === id);
}

function getFavorites() {
    try {
        const stored = JSON.parse(localStorage.getItem('anime_favs'));
        if (!Array.isArray(stored)) return [];
        // Filter out legacy IDs (numbers) and ensure objects
        return stored.filter(item => typeof item === 'object' && item !== null && item.mal_id);
    } catch { return []; }
}

function toggleFavorite() {
    if (!currentAnime) return;

    let favs = getFavorites();
    const id = currentAnime.mal_id;
    const isFav = favs.some(f => f.mal_id === id);

    if (isFav) {
        favs = favs.filter(f => f.mal_id !== id);
    } else {
        favs.push(currentAnime);
    }
    localStorage.setItem('anime_favs', JSON.stringify(favs));

    // Update UI if on detail page
    const btn = document.getElementById('fav-btn');
    if (btn) {
        // Re-check status after toggle
        const newIsFav = !isFav;
        if (newIsFav) {
            btn.innerHTML = '♥ Saved to Favorites';
            btn.className = "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition bg-red-500/20 text-red-400 border border-red-500/50";
        } else {
            btn.innerHTML = '♡ Add to Favorites';
            btn.className = "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition glass-card hover:bg-white/10";
        }
    }

    // Refresh if on favorites page
    if (state.mode === 'favorites') {
        changeMode('favorites');
    }
}
