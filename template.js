// Function to load HTML components (navbar, footer, sidebar)
function loadComponent(elementId, componentPath, callback) {
    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${componentPath}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            if (callback) callback();
        })
        .catch(error => console.error(`Error loading ${componentPath}:`, error));
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
        const linkPage = link.getAttribute('data-page') || link.getAttribute('href');
        const linkPageName = linkPage.split('/').pop();
        
        if (linkPageName === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

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

// Load all components when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const basePath = getBasePath();
    
    // Load navbar
    if (document.getElementById('navbar-container')) {
        loadComponent('navbar-container', `${basePath}/components/navbar.html`);
    }
    
    // Load footer
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', `${basePath}/components/footer.html`);
    }
    
    // Load sidebar for Section 1
    if (document.getElementById('sidebar-section')) {
        loadComponent('sidebar-section', `${basePath}/components/sidebar-section.html`, highlightCurrentPage);
    }
    
    // If sidebar is loaded directly in the page (not via component), still highlight current page
    if (document.querySelector('.sidebar') && !document.getElementById('sidebar-section')) {
        highlightCurrentPage();
    }
    
    // For debugging
    console.log(`Base path: ${basePath}`);
});