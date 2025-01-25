// Constants
const SELECTORS = {
    header: 'header',
    pageTitle: '#pageTitle',
    linkContainer: 'linkContainer',
    currentYear: '#currentYear'
};

const CLASSES = {
    accountIcon: 'account-icon',
    bio: 'bio',
    socialLinks: 'social-links',
    socialLink: 'social-link',
    linkCard: 'link-card',
    // ... other class names
};

// Utility functions
const createElement = (tag, className, attributes = {}) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
};

// Main initialization
async function initializeContent() {
    try {
        const config = await fetchConfig();
        const header = document.querySelector(SELECTORS.header);

        initializeHeader(config, header);
        if (config.social?.show) {
            initializeSocialLinks(config.social.links, header);
        }
        initializeLinkCards(config.mainLinks);
        initializeShareFeature(config);
    } catch (error) {
        console.error('Failed to initialize content:', error);
    }
}

async function fetchConfig() {
    const response = await fetch('config.json');
    return await response.json();
}

function initializeHeader(config, header) {
    if (config.header.accountIcon?.show) {
        const accountIcon = createAccountIcon(config.header.accountIcon);
        header.insertBefore(accountIcon, header.firstChild);
    }

    document.getElementById('pageTitle').textContent = config.pageTitle;
    document.title = config.pageTitle;

    if (config.header.bio?.show && config.header.bio.text) {
        const bioElement = createBioElement(config.header.bio);
        header.parentNode.insertBefore(bioElement, header.nextSibling);
    }

    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

function createAccountIcon(iconConfig) {
    const accountIcon = document.createElement('img');
    accountIcon.src = iconConfig.url;
    accountIcon.alt = iconConfig.alt;
    accountIcon.className = 'account-icon';
    return accountIcon;
}

function createBioElement(bioConfig) {
    const bioElement = document.createElement('p');
    bioElement.className = 'bio';
    bioElement.textContent = bioConfig.text;
    return bioElement;
}

function initializeSocialLinks(links, header) {
    if (!links?.length) return;

    const socialContainer = document.createElement('div');
    socialContainer.className = 'social-links';

    const activeLinks = links
        .filter(social => social.show !== false)
        .map(social => createSocialLink(social));

    if (activeLinks.length) {
        socialContainer.append(...activeLinks);
        header.parentNode.insertBefore(socialContainer, header.nextSibling);
    }
}

function createSocialLink(social) {
    const link = document.createElement('a');
    link.href = social.url;
    link.className = 'social-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `
        <svg class="social-icon ${social.icon}" aria-label="${social.platform}">
            <use href="./icons.svg#${social.icon}"></use>
        </svg>
    `;
    return link;
}

function initializeLinkCards(links) {
    if (!links?.length) return;

    const linkContainer = document.getElementById(SELECTORS.linkContainer);
    if (!linkContainer) {
        console.warn('Link container not found');
        return;
    }

    const linkCards = links.map(link => createLinkCard(link));
    linkContainer.append(...linkCards);
}

function createLinkCard(link) {
    const linkCard = document.createElement('a');
    linkCard.href = link.url;
    linkCard.className = CLASSES.linkCard;

    // Add target="_blank" and rel="noopener noreferrer" for external links
    if (isExternalUrl(link.url)) {
        linkCard.target = '_blank';
        linkCard.rel = 'noopener noreferrer';
    }

    linkCard.innerHTML = `
        <svg class="link-icon" aria-hidden="true">
            <use href="./icons.svg#${link.icon || 'icon-link'}"></use>
        </svg>
        <div class="link-content">
            <h2>${link.title}</h2>
            <p>${link.description}</p>
        </div>
    `;
    return linkCard;
}

// Utility function to check if URL is external
function isExternalUrl(url) {
    // Return false for relative URLs or empty URLs
    if (!url || url.startsWith('#') || url.startsWith('/')) {
        return false;
    }

    try {
        // Compare current domain with link domain
        const currentDomain = window.location.hostname;
        const urlDomain = new URL(url).hostname;
        return currentDomain !== urlDomain;
    } catch {
        // If URL parsing fails, assume it's internal
        return false;
    }
}

function initializeShareFeature(config) {
    const { shareButton, shareModal } = createShareElements(config);
    document.body.append(shareButton, shareModal);
    initializeShareEventListeners(shareButton, shareModal);
}

function createShareElements(config) {
    // Create share button (three dots)
    const shareButton = document.createElement('button');
    shareButton.className = 'share-button';
    shareButton.setAttribute('aria-label', 'Share options');
    shareButton.innerHTML = `
        <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
    `;

    // Share icon based on OS/device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isMacOS = /macintosh/.test(userAgent) && !/(iphone|ipad|ipod)/.test(userAgent);
    const isAppleDevice = isIOS || isMacOS;

    const nativeShareIcon = isAppleDevice ? `
        <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
        </svg>
    ` : `
        <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
    `;

    // Calculate QR code size based on device pixel ratio
    const qrSize = Math.round(200 * (window.devicePixelRatio || 1));

    // Create share modal
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-content">
            <h2>${config.pageTitle}</h2>
            <img class="qr-code"
                src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(window.location.href)}" 
                alt="QR Code"
                width="200"
                height="200"
            >
            <div class="url-container">
                <button class="copy-button" aria-label="Copy URL">
                    <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                </button>
                <span class="url-text">${window.location.href}</span>
            </div>
            <button class="share-native-button">
                ${nativeShareIcon}
                Share
            </button>
            <button class="close-modal" aria-label="Close modal">
                <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;

    return { shareButton, shareModal };
}

function initializeShareEventListeners(shareButton, shareModal) {
    shareButton.addEventListener('click', () => {
        shareModal.classList.add('active');
    });

    shareModal.querySelector('.close-modal').addEventListener('click', () => {
        shareModal.classList.remove('active');
    });

    shareModal.querySelector('.copy-button').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    });

    shareModal.querySelector('.share-native-button').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }
    });

    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeContent);

console.log(performance.memory);

// Performance optimization
const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    }
});

// Lazy load images
function lazyLoadImage(img) {
    img.dataset.src = img.src;
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    observer.observe(img);
}