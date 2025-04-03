// Calculate base path for GitHub Pages compatibility
function getBasePath() {
    // Extract repository name from URL for GitHub Pages
    if (window.location.hostname.endsWith('github.io')) {
        const pathSegments = window.location.pathname.split('/');
        // If hosted at username.github.io/repo-name/
        if (pathSegments.length > 1) {
            const repoName = pathSegments[1];
            return `/${repoName}`;
        }
    }
    
    // For local development or non-GitHub hosting
    return '';
}

// Function to get path to root from current location
function getPathToRoot() {
    // Count how many directories deep we are
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    
    // If on GitHub Pages, account for the repository name
    if (window.location.hostname.endsWith('github.io')) {
        // Remove repo name from the depth calculation
        pathSegments.shift();
    }
    
    // Generate the path to root (../ for each directory level)
    return pathSegments.length > 0 ? 
           pathSegments.map(() => '..').join('/') : 
           '.';
}

// Function to resolve path to absolute path
function resolvePath(relativePath) {
    const basePath = getBasePath();
    const pathToRoot = getPathToRoot();
    
    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    
    // Create full path
    return `${basePath}/${cleanPath}`;
}

// Function to fix all links in the document
function fixLinks() {
    const basePath = getBasePath();
    
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
            return; // Skip external links and anchors
        }
        
        // Remove leading slash if present
        const cleanPath = href.startsWith('/') ? href.substring(1) : href;
        
        // Add basePath only for GitHub Pages
        link.setAttribute('href', `${basePath}/${cleanPath}`);
    });
}

// Function to load HTML components
function loadComponent(elementId, componentPath, callback) {
    const basePath = getBasePath();
    const fullPath = `${basePath}/${componentPath}`;
    
    console.log(`Loading component from: ${fullPath}`);
    
    fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${fullPath}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            fixLinks();
            if (callback) callback();
        })
        .catch(error => console.error(`Error loading ${fullPath}:`, error));
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    const basePath = getBasePath();
    console.log(`Base path detected: ${basePath}`);
    console.log(`Path to root: ${getPathToRoot()}`);
    
    // Load components
    if (document.getElementById('navbar-container')) {
        loadComponent('navbar-container', 'components/navbar.html');
    }
    
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', 'components/footer.html');
    }
    
    if (document.getElementById('sidebar-section')) {
        loadComponent('sidebar-section', 'components/sidebar-section.html', highlightCurrentPage);
    }
    
    // Handle direct sidebar
    if (document.querySelector('.sidebar') && !document.getElementById('sidebar-section')) {
        highlightCurrentPage();
    }
});

// Function to highlight the current page in the sidebar
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.sidebar a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}