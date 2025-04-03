// Calculate base path for GitHub Pages compatibility
function getBasePath() {
    // Extract repository name from URL for GitHub Pages
    const pathSegments = window.location.pathname.split('/');
    
    // GitHub Pages URLs look like: username.github.io/repo-name/...
    // For GitHub Pages, we need to include the repo name in the base path
    if (window.location.hostname.endsWith('github.io')) {
        // If hosted at username.github.io/repo-name/
        if (pathSegments.length > 1) {
            const repoName = pathSegments[1];
            return `/${repoName}`;
        }
    }
    
    // For local development or non-GitHub hosting
    return '';
}

// Function to fix all links in the document to include base path
function fixLinks() {
    const basePath = getBasePath();
    if (!basePath) return; // No need to fix links if not on GitHub Pages
    
    // Only process links that don't start with http:// or https:// or #
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http://') && !href.startsWith('https://') && 
            !href.startsWith('#') && !href.startsWith(basePath)) {
            
            // Remove leading slash if present since basePath already has it
            const cleanHref = href.startsWith('/') ? href.substring(1) : href;
            
            // Don't add the basePath if the link already starts with it
            if (!href.startsWith(basePath)) {
                link.setAttribute('href', `${basePath}/${cleanHref}`);
            }
        }
    });
}

// Function to load HTML components (navbar, footer, sidebar)
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
            
            // Fix links in the newly loaded component
            fixLinks();
            
            if (callback) callback();
        })
        .catch(error => console.error(`Error loading ${fullPath}:`, error));
}

// Function to set the author name in the footer
function setAuthorName(name) {
    // Wait for the footer to load before setting the name
    setTimeout(() => {
        const authorElement = document.getElementById('author-name');
        if (authorElement) authorElement.textContent = name;
    }, 100);
}

// Function to highlight the current page in the sidebar
function highlightCurrentPage() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Find the link in the sidebar that matches the current page and add the active class
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Load all components when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const basePath = getBasePath();
    console.log(`Base path detected: ${basePath}`);
    
    // Fix any links that might already be in the page
    fixLinks();
    
    // Load navbar
    if (document.getElementById('navbar-container')) {
        loadComponent('navbar-container', 'components/navbar.html', function() {
            console.log('Navbar loaded and links fixed');
        });
    }
    
    // Load footer
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', 'components/footer.html');
    }
    
    // Load sidebar for Section 1
    if (document.getElementById('sidebar-section')) {
        loadComponent('sidebar-section', 'components/sidebar-section.html', highlightCurrentPage);
    }
    
    // If sidebar is loaded directly in the page (not via component), still highlight current page
    if (document.querySelector('.sidebar') && !document.getElementById('sidebar-section')) {
        highlightCurrentPage();
    }
});