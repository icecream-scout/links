async function initializeContent() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();

        // Set page title
        document.getElementById('pageTitle').textContent = config.pageTitle;
        document.title = config.pageTitle;

        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Generate social links
        if (config.socialLinks?.length > 0) {
            const socialContainer = document.createElement('div');
            socialContainer.className = 'social-links';
            for (const social of config.socialLinks) {
                const socialLink = document.createElement('a');
                socialLink.href = social.url;
                socialLink.className = 'social-link';
                socialLink.target = '_blank';
                socialLink.rel = 'noopener noreferrer';
                socialLink.innerHTML = `
                    <svg class="social-icon ${social.icon}" aria-label="${social.platform}">
                        <use href="./icons.svg#${social.icon}"></use>
                    </svg>
                `;
                socialContainer.appendChild(socialLink);
            }

            // Insert after header
            const header = document.querySelector('header');
            header.parentNode.insertBefore(socialContainer, header.nextSibling);
        }

        // Generate link cards
        const linkContainer = document.getElementById('linkContainer');
        for (const link of config.links) {
            const linkCard = document.createElement('a');
            linkCard.href = link.url;
            linkCard.className = 'link-card';
            linkCard.innerHTML = `
                <div class="link-content">
                    <h2>${link.title}</h2>
                    <p>${link.description}</p>
                </div>
            `;
            linkContainer.appendChild(linkCard);
        }
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeContent);

console.log(performance.memory);