// ==========================================================================
// ResearchMate - Editorial Research & News Intelligence Platform
// Vanilla JavaScript Implementation
// ==========================================================================

// ---------- 1. DOM Element Bindings ----------
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultCount = document.getElementById("result-count");
const searchButton = document.getElementById("search-button");

const resultsTitle = document.getElementById("results-title");
const resultsCount = document.getElementById("results-count");
const statusMessage = document.getElementById("status-message");
const resultsList = document.getElementById("results-list");

const refreshButton = document.getElementById("refresh-briefing");

// Connect to FastAPI backend
const API_URL = "http://127.0.0.1:8000";

// ---------- 2. Editorial Category Mapping ----------
function getCategoryColorClass(category) {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("ai") || normalized.includes("research")) {
        return "category-blue";
    }
    if (normalized.includes("global") || normalized.includes("tech")) {
        return "category-violet";
    }
    if (normalized.includes("developer") || normalized.includes("code") || normalized.includes("program")) {
        return "category-indigo";
    }
    if (normalized.includes("job") || normalized.includes("intern")) {
        return "category-pink";
    }
    return "category-default";
}

function getCategoryDotClass(category) {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("ai") || normalized.includes("research")) return "dot-blue";
    if (normalized.includes("global") || normalized.includes("tech")) return "dot-violet";
    if (normalized.includes("developer")) return "dot-indigo";
    if (normalized.includes("job") || normalized.includes("intern")) return "dot-pink";
    return "dot-blue";
}

function getPlaceholderTheme(category) {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("ai") || normalized.includes("research")) {
        return {
            themeClass: "placeholder-blue",
            label: "AI & Research",
            svg: `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
            `
        };
    }
    if (normalized.includes("global") || normalized.includes("tech")) {
        return {
            themeClass: "placeholder-violet",
            label: "Global Tech",
            svg: `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            `
        };
    }
    if (normalized.includes("developer") || normalized.includes("code") || normalized.includes("program")) {
        return {
            themeClass: "placeholder-indigo",
            label: "Developer News",
            svg: `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            `
        };
    }
    if (normalized.includes("job") || normalized.includes("intern")) {
        return {
            themeClass: "placeholder-pink",
            label: "Jobs & Careers",
            svg: `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            `
        };
    }
    return {
        themeClass: "placeholder-blue",
        label: "Research Source",
        svg: `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        `
    };
}

// ---------- 3. Tasteful Editorial Visual Placeholder ----------
function createCategoryPlaceholder(category) {
    const { themeClass, label, svg } = getPlaceholderTheme(category);
    const placeholder = document.createElement("div");
    placeholder.className = `category-placeholder ${themeClass}`;
    placeholder.innerHTML = `
        <div class="placeholder-icon-circle">
            ${svg}
        </div>
        <span class="placeholder-label">${label}</span>
    `;
    return placeholder;
}

// ---------- 4. Thumbnail Element Builder ----------
function createThumbnailElement(article, category) {
    const wrapper = document.createElement("div");
    wrapper.className = "card-thumbnail-wrapper";

    let safeImageUrl = null;
    if (article.image_url && typeof article.image_url === "string" && article.image_url.trim() !== "") {
        try {
            const parsed = new URL(article.image_url.trim());
            if (["http:", "https:"].includes(parsed.protocol)) {
                safeImageUrl = parsed.href;
            }
        } catch {
            // Invalid image URL
        }
    }

    if (safeImageUrl) {
        const img = document.createElement("img");
        img.className = "card-thumbnail-img";
        img.src = safeImageUrl;
        img.alt = article.title ? `${article.title} thumbnail` : "Article thumbnail";
        img.loading = "lazy";
        img.decoding = "async";

        // Fallback gracefully when image fails to load
        img.onerror = function () {
            wrapper.replaceChildren(createCategoryPlaceholder(category));
        };

        wrapper.appendChild(img);
    } else {
        wrapper.appendChild(createCategoryPlaceholder(category));
    }

    return wrapper;
}

// ---------- 5. Favicon Fallback Builder ----------
function createFaviconFallback() {
    const fallback = document.createElement("span");
    fallback.className = "article-favicon-fallback";
    fallback.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    `;
    return fallback;
}

// ---------- 6. Skeleton Loading Helpers ----------
function createSkeletonCard() {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
        <div class="skeleton-shimmer skeleton-thumbnail"></div>
        <div class="skeleton-body">
            <div class="skeleton-meta">
                <div class="skeleton-shimmer skeleton-badge"></div>
                <div class="skeleton-shimmer skeleton-number"></div>
            </div>
            <div class="skeleton-shimmer skeleton-title-1"></div>
            <div class="skeleton-shimmer skeleton-title-2"></div>
            <div class="skeleton-shimmer skeleton-text-1"></div>
            <div class="skeleton-shimmer skeleton-text-2"></div>
            <div class="skeleton-shimmer skeleton-text-3"></div>
        </div>
        <div class="skeleton-footer">
            <div class="skeleton-shimmer skeleton-domain"></div>
            <div class="skeleton-shimmer skeleton-button"></div>
        </div>
    `;
    return skeleton;
}

function renderSkeletons(count = 3, isBriefing = false) {
    resultsList.replaceChildren();

    if (isBriefing) {
        const categoryTitles = ["AI & Research", "Global Tech"];
        categoryTitles.forEach((title) => {
            const section = document.createElement("section");
            section.className = "briefing-category";

            const header = document.createElement("div");
            header.className = "category-header";
            header.innerHTML = `
                <span class="category-header-dot ${getCategoryDotClass(title)}"></span>
                <h3>${title}</h3>
                <span class="category-header-count">Loading intelligence...</span>
            `;
            section.appendChild(header);

            const grid = document.createElement("div");
            grid.className = "briefing-grid";
            grid.appendChild(createSkeletonCard());
            grid.appendChild(createSkeletonCard());
            grid.appendChild(createSkeletonCard());
            section.appendChild(grid);

            resultsList.appendChild(section);
        });
    } else {
        const grid = document.createElement("div");
        grid.className = "search-results-grid";
        for (let i = 0; i < count; i++) {
            grid.appendChild(createSkeletonCard());
        }
        resultsList.appendChild(grid);
    }
}

// ---------- 7. Reusable Article Card Component ----------
function createArticleCard(article, category = "Research", index = 0) {
    const card = document.createElement("article");
    card.className = "result-card";

    // URL validation and hostname extraction
    let safeUrl = null;
    let domain = "Research source";

    try {
        if (article.url) {
            const parsedUrl = new URL(article.url);
            if (["http:", "https:"].includes(parsedUrl.protocol)) {
                safeUrl = parsedUrl.href;
                domain = parsedUrl.hostname.replace(/^www\./, "");
            }
        }
    } catch {
        // Keep article usable without valid URL
    }

    // 1. Prominent 16:9 Thumbnail Header at the top
    const thumbnail = createThumbnailElement(article, category);

    // 2. Card Body Container (Below Thumbnail)
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Category Badge & Source Number
    const header = document.createElement("div");
    header.className = "article-meta";

    const badge = document.createElement("span");
    badge.className = `article-category ${getCategoryColorClass(category)}`;
    badge.textContent = category;

    const number = document.createElement("span");
    number.className = "article-number";
    number.textContent = `SOURCE ${String(index + 1).padStart(2, "0")}`;

    header.append(badge, number);

    // Article Title with Favicon
    const headingWrapper = document.createElement("div");
    headingWrapper.className = "result-card-heading";

    if (article.favicon && typeof article.favicon === "string" && article.favicon.trim() !== "") {
        const faviconImg = document.createElement("img");
        faviconImg.className = "article-favicon";
        faviconImg.src = article.favicon.trim();
        faviconImg.alt = "";
        faviconImg.loading = "lazy";
        faviconImg.onerror = function () {
            this.replaceWith(createFaviconFallback());
        };
        headingWrapper.appendChild(faviconImg);
    } else {
        headingWrapper.appendChild(createFaviconFallback());
    }

    const heading = document.createElement("h3");
    if (safeUrl) {
        const titleLink = document.createElement("a");
        titleLink.href = safeUrl;
        titleLink.target = "_blank";
        titleLink.rel = "noopener noreferrer";
        titleLink.textContent = article.title || "Untitled article";
        heading.appendChild(titleLink);
    } else {
        heading.textContent = article.title || "Untitled article";
    }
    headingWrapper.appendChild(heading);

    // Article Summary (Clamped description for height consistency)
    const description = document.createElement("p");
    description.className = "article-summary";
    description.textContent = article.highlight || article.description || "No description available.";

    cardBody.append(header, headingWrapper, description);

    // 3. Card Footer (Domain and Article Link)
    const footer = document.createElement("div");
    footer.className = "article-footer";

    const source = document.createElement("span");
    source.className = "article-domain";
    source.textContent = domain;
    source.title = domain;

    footer.appendChild(source);

    if (safeUrl) {
        const link = document.createElement("a");
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "source-link";
        link.innerHTML = `Read source <span aria-hidden="true">↗</span>`;
        footer.appendChild(link);
    }

    // Assemble Card
    card.append(thumbnail, cardBody, footer);
    return card;
}

// ---------- 8. Daily Briefing Controller ----------
async function loadDailyBriefing() {
    resultsTitle.textContent = "Today's Research Briefing";
    resultsCount.textContent = "";

    statusMessage.className = "status-message";
    statusMessage.textContent = "Fetching today's verified research intelligence...";

    refreshButton.disabled = true;
    refreshButton.classList.add("loading");

    // Render skeleton placeholders
    renderSkeletons(3, true);

    try {
        const response = await fetch(`${API_URL}/daily-briefing`);

        if (!response.ok) {
            throw new Error(`Unable to load today's briefing (Status ${response.status}).`);
        }

        const data = await response.json();

        // Clear skeletons
        resultsList.replaceChildren();

        resultsTitle.textContent = "Today's Research Briefing";
        resultsCount.textContent = `${data.total_articles || 0} reports`;

        statusMessage.className = "status-message";
        statusMessage.textContent = "Latest verified research and industry developments.";

        // Render categories
        if (data.categories && typeof data.categories === "object") {
            for (const [category, articles] of Object.entries(data.categories)) {
                if (!Array.isArray(articles) || articles.length === 0) continue;

                const categorySection = document.createElement("section");
                categorySection.className = "briefing-category";

                const categoryHeader = document.createElement("div");
                categoryHeader.className = "category-header";
                categoryHeader.innerHTML = `
                    <span class="category-header-dot ${getCategoryDotClass(category)}"></span>
                    <h3>${category}</h3>
                    <span class="category-header-count">${articles.length} sources</span>
                `;
                categorySection.appendChild(categoryHeader);

                const grid = document.createElement("div");
                grid.className = "briefing-grid";

                articles.forEach((article, index) => {
                    const card = createArticleCard(article, category, index);
                    grid.appendChild(card);
                });

                categorySection.appendChild(grid);
                resultsList.appendChild(categorySection);
            }
        }

    } catch (error) {
        console.error("Daily briefing error:", error);
        resultsList.replaceChildren();

        statusMessage.className = "status-message error";
        statusMessage.textContent = error.message.includes("Failed to fetch")
            ? "Could not connect to the backend. Please ensure your FastAPI server is running on port 8000."
            : error.message;

        resultsTitle.textContent = "Briefing unavailable";
        resultsCount.textContent = "";

    } finally {
        refreshButton.disabled = false;
        refreshButton.classList.remove("loading");
    }
}

// ---------- 9. Search Form Controller ----------
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    const count = Number(resultCount.value) || 3;

    if (!query) {
        statusMessage.className = "status-message error";
        statusMessage.textContent = "Please enter a topic to research.";
        return;
    }

    // Loading State
    searchButton.disabled = true;
    searchButton.innerHTML = `<span>Searching...</span>`;

    resultsTitle.textContent = `Results for "${query}"`;
    resultsCount.textContent = "";

    statusMessage.className = "status-message";
    statusMessage.textContent = "Searching research sources...";

    // Show skeletons matching requested count
    renderSkeletons(count, false);

    try {
        const url = new URL("/search", API_URL);
        url.searchParams.set("q", query);
        url.searchParams.set("count", String(count));

        const response = await fetch(url);

        if (!response.ok) {
            let errorDetail = "Something went wrong.";
            try {
                const errorData = await response.json();
                if (errorData.detail) errorDetail = errorData.detail;
            } catch {
                // Non-JSON response
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        resultsList.replaceChildren();

        resultsTitle.textContent = `Results for "${data.query}"`;
        resultsCount.textContent = `${data.count || 0} sources found`;

        if (!data.results || data.results.length === 0) {
            statusMessage.className = "status-message";
            statusMessage.textContent = "No results found. Try another research query.";
            return;
        }

        statusMessage.className = "status-message";
        statusMessage.textContent = `Displaying ${data.results.length} sources retrieved via Octen.`;

        const grid = document.createElement("div");
        grid.className = "search-results-grid";

        data.results.forEach((result, index) => {
            const card = createArticleCard(result, "Search Result", index);
            grid.appendChild(card);
        });

        resultsList.appendChild(grid);

    } catch (error) {
        console.error("Research search error:", error);
        resultsList.replaceChildren();

        resultsTitle.textContent = "Search unsuccessful";
        resultsCount.textContent = "";

        statusMessage.className = "status-message error";
        statusMessage.textContent = error.message.includes("Failed to fetch")
            ? "Could not connect to the backend. Please check that FastAPI is running on port 8000."
            : error.message;

    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = `<span>Search</span> <span class="btn-arrow" aria-hidden="true">↗</span>`;
    }
});

// ---------- 10. Event Listeners & Initialization ----------
refreshButton.addEventListener("click", loadDailyBriefing);

// Initialize application by loading the daily briefing
loadDailyBriefing();
