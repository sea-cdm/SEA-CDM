// Function to load HTML components (navbar, footer, sidebar)
function loadComponent(elementId, componentPath, callback) {
    fetch(componentPath)
        .then(response => response.text())
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
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Load all components when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Determine the relative path to components based on the current page's location
    const pathToRoot = location.pathname.split('/').filter(Boolean).map(() => '..').join('/') || '.';
    
    // Load navbar
    if (document.getElementById('navbar-container')) {
        loadComponent('navbar-container', `${pathToRoot}/components/navbar.html`);
    }
    
    // Load footer
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', `${pathToRoot}/components/footer.html`);
    }
    
    // Load sidebar for Section 1
    if (document.getElementById('sidebar-section')) {
        loadComponent('sidebar-section', `${pathToRoot}/components/sidebar-section.html`, highlightCurrentPage);
    }
    
    // If sidebar is loaded directly in the page (not via component), still highlight current page
    if (document.querySelector('.sidebar') && !document.getElementById('sidebar-section')) {
        highlightCurrentPage();
    }
});