// Calculate base path for GitHub Pages compatibility
function getBasePath() {
    // Extract repository name from URL for GitHub Pages
    if (window.location.hostname.endsWith('github.io')) {
        const pathSegments = window.location.pathname.split('/');
        // If hosted at username.github.io/repo-name/
        if (pathSegments.length > 1 && pathSegments[1] !== "") { // Check pathSegments[1] is not empty root path case
            const repoName = pathSegments[1];
            return `/${repoName}`;
        }
    }
    // For local development or non-GitHub hosting
    return '';
}

// Function to get path to root from current location (less critical with revised fixLinks)
function getPathToRoot() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (window.location.hostname.endsWith('github.io') && pathSegments.length > 0) {
        pathSegments.shift(); // Remove repo name if present
    }
    return pathSegments.length > 0 ? pathSegments.map(() => '..').join('/') : '.';
}

// Function to resolve path (less critical with revised fixLinks, might be removable if not used elsewhere)
function resolvePath(relativePath) {
    const basePath = getBasePath();
    // Remove leading slash if present for combining, but logic might need review based on usage
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    // This simple combination might not be universally correct, depends on relativePath format
    return `${basePath}/${cleanPath}`;
}

// Function to fix specific links for GitHub Pages compatibility
function fixLinks() {
    const basePath = getBasePath(); // e.g., "/SEA-CDM" or ""

    // Only proceed if we are on GitHub Pages (basePath is not empty)
    if (!basePath) {
        // console.log("Not on GitHub Pages or basePath is empty, skipping link fixing."); // Optional logging
        return; // No fixing needed for local/other hosting
    }
    // console.log(`GitHub Pages detected. BasePath: ${basePath}. Fixing links...`); // Optional logging

    document.querySelectorAll('a').forEach(link => {
        let href = link.getAttribute('href');

        // Trim whitespace which can cause issues
        if (href) {
            href = href.trim();
        }

        // Skip empty, anchor, external, mailto, tel links etc.
        // Added check for javascript:
        if (!href || href === '' || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
            // console.log(`Skipping non-relative/absolute link: ${href}`); // Optional logging
            return;
        }

        // Check if it's an absolute path relative to the domain (starts with /)
        if (href.startsWith('/')) {
            // Only prepend the basePath if the href doesn't *already* start with it.
            // This prevents double-prefixing like /SEA-CDM/SEA-CDM/...
            if (!href.startsWith(basePath + '/')) { // Check against basePath + '/' for robustness
                 // console.log(`Fixing absolute link: ${href} -> ${basePath + href}`); // Optional logging
                link.setAttribute('href', basePath + href);
            } else {
                 // console.log(`Absolute link already has basePath, keeping: ${href}`); // Optional logging
            }
        }
        // --- Do NOT modify relative links ---
        // Relative links (e.g., "subfolder/page.html", "../other.html") are handled by the browser.
        // else { console.log(`Keeping relative link as is: ${href}`); // Optional logging }
    });
}


// Function to load HTML components
function loadComponent(elementId, componentPath, callback) {
    const basePath = getBasePath();
    // Construct full path relative to the *root* of the site
    // Assuming componentPath is relative *from the root*, e.g., 'components/navbar.html'
    const fullPath = `${basePath}/${componentPath.startsWith('/') ? componentPath.substring(1) : componentPath}`;

    // console.log(`Loading component from: ${fullPath}`); // Log the final path being fetched

    fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${fullPath}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const container = document.getElementById(elementId);
            if (container) {
                container.innerHTML = html;
                // console.log(`Component ${elementId} loaded, fixing links within it...`); // Optional logging
                fixLinks(); // Fix links *within* the loaded component
                if (callback) callback();
            } else {
                 console.error(`Element with ID ${elementId} not found.`);
            }
        })
        .catch(error => console.error(`Error loading component ${componentPath} from ${fullPath}:`, error));
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    const basePath = getBasePath();
    // console.log(`DOM Content Loaded. Base path detected: ${basePath}`); // Optional logging
    // console.log(`Path to root: ${getPathToRoot()}`); // Optional logging

    // Load components
    if (document.getElementById('navbar-container')) {
        // Assume path is relative to root
        loadComponent('navbar-container', 'components/navbar.html');
    }

    if (document.getElementById('footer-container')) {
        // Assume path is relative to root
        loadComponent('footer-container', 'components/footer.html');
    }

    if (document.getElementById('sidebar-section')) {
         // Assume path is relative to root
        loadComponent('sidebar-section', 'components/sidebar-section.html', highlightCurrentPage);
    } else if (document.querySelector('.sidebar')) { // Handle direct sidebar if no container
        // If sidebar is static HTML, links might need fixing if not handled by components
        // However, the revised fixLinks only runs *after* component loading.
        // If you have static sidebars/navbars not loaded via JS, their links
        // won't be fixed by this script. Consider loading them via loadComponent too.
         console.log("Static sidebar detected, ensuring highlighting runs."); // Optional logging
        highlightCurrentPage();
    }

    // Initial link fix for static content might be needed if links are absolute /...
    // but this is often better handled by writing links correctly initially.
    // fixLinks(); // You could run it once here, but beware of unintended consequences.
});

// Function to highlight the current page in the sidebar
function highlightCurrentPage() {
    // Use the full pathname for better matching on GH Pages
    const currentPagePath = window.location.pathname;
    // console.log(`Highlighting sidebar links for page: ${currentPagePath}`); // Optional logging

    document.querySelectorAll('.sidebar a').forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        // Resolve the link's full path for accurate comparison
        // new URL(href, base) resolves relative URLs against a base URL
        const linkFullPath = new URL(linkHref, window.location.href).pathname;

         // Remove trailing slashes for comparison consistency (optional)
        const cleanCurrentPath = currentPagePath.replace(/\/$/, '');
        const cleanLinkPath = linkFullPath.replace(/\/$/, '');

        // Check if the current page path ends with the link's path
        // This handles cases where base paths might differ slightly but the target file is the same
        // e.g. current is /SEA-CDM/page.html, link is /SEA-CDM/page.html
        // e.g. current is /SEA-CDM/folder/, link is /SEA-CDM/folder/index.html (browser might add index.html)
         if (cleanCurrentPath === cleanLinkPath || cleanCurrentPath === cleanLinkPath + '/index.html' || cleanCurrentPath + '/index.html' === cleanLinkPath) {
            // console.log(`Activating sidebar link: ${linkHref}`); // Optional logging
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Ensure others are not active
        }
    });
}