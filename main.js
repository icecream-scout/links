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
        <svg class="social-icon" viewBox="${config.icons.menu.viewBox}" xmlns="http://www.w3.org/2000/svg">
            <path d="${config.icons.menu.path}"/>
        </svg>
    `;

    // Share icon based on OS/device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isMacOS = /macintosh/.test(userAgent) && !/(iphone|ipad|ipod)/.test(userAgent);
    const isAppleDevice = isIOS || isMacOS;

    const shareIconConfig = isAppleDevice ? config.icons.share.apple : config.icons.share.android;
    const nativeShareIcon = `
        <svg class="social-icon" viewBox="${shareIconConfig.viewBox}" xmlns="http://www.w3.org/2000/svg">
            <path d="${shareIconConfig.path}"/>
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
                    <svg class="social-icon" viewBox="${config.icons.copy.viewBox}" xmlns="http://www.w3.org/2000/svg">
                        <path d="${config.icons.copy.path}"/>
                    </svg>
                </button>
                <span class="url-text">${window.location.href}</span>
            </div>
            <button class="share-native-button">
                ${nativeShareIcon}
                Share
            </button>
            <button class="close-modal" aria-label="Close modal">
                <svg class="social-icon" viewBox="${config.icons.close.viewBox}" xmlns="http://www.w3.org/2000/svg">
                    <path d="${config.icons.close.path}"/>
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