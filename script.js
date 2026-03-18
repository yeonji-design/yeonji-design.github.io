// Navigation and interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for any internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Function to open project pages
function openProject(projectId) {
    // Create project pages based on the project ID
    const projectPages = {
        'genai-registry': 'genai-registry.html',
        'ai-cost-dashboard': 'ai-cost-dashboard.html',
        'deep-learning-research': 'deep-learning-research.html'
    };
    
    const projectPage = projectPages[projectId];
    if (projectPage) {
        window.location.href = projectPage;
    }
}

// Add smooth transitions to header links
document.addEventListener('DOMContentLoaded', function() {
    const headerLinks = document.querySelectorAll('.header-link');
    headerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

