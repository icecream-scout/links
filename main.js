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

// SVG Icons
const ICONS = {
    menu: {
        viewBox: "0 0 24 24",
        path: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
    },
    share: {
        apple: {
            viewBox: "0 0 24 24",
            path: "M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"
        },
        android: {
            viewBox: "0 0 24 24",
            path: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
        }
    },
    copy: {
        viewBox: "0 0 24 24",
        path: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
    },
    close: {
        viewBox: "0 0 24 24",
        path: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    }
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
const initializeContent = async () => {
    try {
        const config = await (await fetch('config.json')).json();
        const header = document.querySelector(SELECTORS.header);

        initializeHeader(config, header);
        config.social?.show && initializeSocialLinks(header, config.social.links);
        initializeLinkCards(config.mainLinks);
        initializeShareFeature(config);
    } catch (error) {
        console.error('Failed to initialize content:', error);
    }
};

const initializeHeader = (config, headerElement) => {
    const { pageTitle, header } = config;

    if (header.accountIcon?.show) {
        headerElement.insertBefore(
            createElement('img', 'account-icon', {
                src: header.accountIcon.url,
                alt: header.accountIcon.alt
            }),
            headerElement.firstChild
        );
    }

    document.getElementById('pageTitle').textContent = pageTitle;
    document.title = pageTitle;

    if (header.bio?.show) {
        const bioElement = createElement('p', 'bio');
        bioElement.textContent = header.bio.text;
        headerElement.parentNode.insertBefore(bioElement, headerElement.nextSibling);
    }

    document.getElementById('currentYear').textContent = new Date().getFullYear();
};

const initializeSocialLinks = (header, links = []) => {
    if (!links.length) return;

    const socialContainer = createElement('div', 'social-links');
    const activeLinks = links
        .filter(social => social.show !== false)
        .map(({ url, icon, platform }) => {
            const link = createElement('a', 'social-link', {
                href: url,
                target: '_blank',
                rel: 'noopener noreferrer'
            });
            link.innerHTML = `
                <svg class="social-icon ${icon}" aria-label="${platform}">
                    <use href="./icons.svg#${icon}"></use>
                </svg>
            `;
            return link;
        });

    if (activeLinks.length) {
        socialContainer.append(...activeLinks);
        header.parentNode.insertBefore(socialContainer, header.nextSibling);
    }
};

const initializeLinkCards = (links = []) => {
    const container = document.getElementById(SELECTORS.linkContainer);
    if (!container || !links.length) return;

    container.append(...links.map(link => {
        const card = createElement('a', 'link-card', {
            href: link.url,
            ...(isExternalUrl(link.url) && { target: '_blank', rel: 'noopener noreferrer' })
        });

        card.innerHTML = `
            <svg class="link-icon" aria-hidden="true">
                <use href="./icons.svg#${link.icon || 'icon-link'}"></use>
            </svg>
            <div class="link-content">
                <h2>${link.title}</h2>
                <p>${link.description}</p>
            </div>
        `;
        return card;
    }));
};

const isExternalUrl = url => {
    if (!url || url.startsWith('#') || url.startsWith('/')) return false;
    try {
        return window.location.hostname !== new URL(url).hostname;
    } catch {
        return false;
    }
};

const createShareElements = ({ pageTitle }) => {
    const shareButton = createElement('button', 'share-button', {
        'aria-label': 'Share options'
    });
    shareButton.innerHTML = `
        <svg class="social-icon" viewBox="${ICONS.menu.viewBox}" xmlns="http://www.w3.org/2000/svg">
            <path d="${ICONS.menu.path}"/>
        </svg>
    `;

    const isAppleDevice = /iphone|ipad|ipod|macintosh/.test(navigator.userAgent.toLowerCase());
    const shareIconConfig = ICONS.share[isAppleDevice ? 'apple' : 'android'];

    const shareModal = createElement('div', 'share-modal');
    const qrSize = Math.round(200 * (window.devicePixelRatio || 1));

    shareModal.innerHTML = `
        <div class="share-content">
            <h2>${pageTitle}</h2>
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(location.href)}" alt="QR Code" width="200" height="200">
            <div class="url-container">
                <button class="copy-button" aria-label="Copy URL">
                    <svg class="social-icon" viewBox="${ICONS.copy.viewBox}" xmlns="http://www.w3.org/2000/svg">
                        <path d="${ICONS.copy.path}"/>
                    </svg>
                </button>
                <span class="url-text">${location.href}</span>
            </div>
            <button class="share-native-button">
                <svg class="social-icon" viewBox="${shareIconConfig.viewBox}" xmlns="http://www.w3.org/2000/svg">
                    <path d="${shareIconConfig.path}"/>
                </svg>
                Share
            </button>
            <button class="close-modal" aria-label="Close modal">
                <svg class="social-icon" viewBox="${ICONS.close.viewBox}" xmlns="http://www.w3.org/2000/svg">
                    <path d="${ICONS.close.path}"/>
                </svg>
            </button>
        </div>
    `;

    return { shareButton, shareModal };
};

const initializeShareFeature = config => {
    const { shareButton, shareModal } = createShareElements(config);
    document.body.append(shareButton, shareModal);

    const toggleModal = show => shareModal.classList.toggle('active', show);

    shareButton.addEventListener('click', () => toggleModal(true));
    shareModal.querySelector('.close-modal').addEventListener('click', () => toggleModal(false));
    shareModal.addEventListener('click', e => e.target === shareModal && toggleModal(false));

    shareModal.querySelector('.copy-button').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(location.href);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    });

    shareModal.querySelector('.share-native-button').addEventListener('click', async () => {
        if (!navigator.share) return;
        try {
            await navigator.share({
                title: document.title,
                url: location.href
            });
        } catch (err) {
            err.name !== 'AbortError' && console.error('Error sharing:', err);
        }
    });
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeContent);

// Lazy loading images
const observer = new IntersectionObserver(entries => {
    for (const { isIntersecting, target } of entries) {
        if (isIntersecting) {
            target.src = target.dataset.src;
            observer.unobserve(target);
        }
    }
});

const lazyLoadImage = img => {
    img.dataset.src = img.src;
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    observer.observe(img);
};