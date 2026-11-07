
// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultCount = document.getElementById("result-count");
const searchButton = document.getElementById("search-button");

const resultsTitle = document.getElementById("results-title");
const resultsCount = document.getElementById("results-count");
const statusMessage = document.getElementById("status-message");
const resultsList = document.getElementById("results-list");

const refreshButton = document.getElementById("refresh-briefing");

// Connect to our FastAPI backend.
const API_URL = "http://127.0.0.1:8000";


// ==========================================
// 2. REUSABLE ARTICLE CARD FUNCTION
// ==========================================

function createArticleCard(article, category = "Research", index = 0) {

    const card = document.createElement("article");
    card.className = "result-card";

    // Validate the article URL.
    let safeUrl = null;
    let domain = "Research source";

    try {
        const parsedUrl = new URL(article.url);

        if (["http:", "https:"].includes(parsedUrl.protocol)) {
            safeUrl = parsedUrl.href;
            domain = parsedUrl.hostname.replace(/^www\./, "");
        }
    } catch {
        // Keep the article usable even without a valid URL.
    }


    // ARTICLE HEADER

    const header = document.createElement("div");
    header.className = "article-meta";

    const badge = document.createElement("span");
    badge.className = "article-category";
    badge.textContent = category;

    const number = document.createElement("span");
    number.className = "article-number";
    number.textContent =
        `SOURCE ${String(index + 1).padStart(2, "0")}`;

    header.append(badge, number);


    // ARTICLE TITLE

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


    // ARTICLE SUMMARY

    const description = document.createElement("p");
    description.className = "article-summary";

    description.textContent =
        article.highlight ||
        article.description ||
        "No description available.";


    // ARTICLE FOOTER

    const footer = document.createElement("div");
    footer.className = "article-footer";

    const source = document.createElement("span");
    source.className = "article-domain";
    source.textContent = domain;

    footer.appendChild(source);


    // READ FULL ARTICLE LINK

    if (safeUrl) {

        const link = document.createElement("a");

        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "source-link";
        link.textContent = "Read full article ↗";

        footer.appendChild(link);

    }


    // ADD EVERYTHING TO THE CARD

    card.append(header, heading, description, footer);

    return card;
}


// ==========================================
// 3. LOAD DAILY BRIEFING
// ==========================================

async function loadDailyBriefing() {

    resultsTitle.textContent = "Your Daily Briefing";
    resultsCount.textContent = "";

    statusMessage.textContent =
        "Fetching today's AI and tech updates...";

    resultsList.replaceChildren();

    refreshButton.disabled = true;

    try {

        const response = await fetch(`${API_URL}/daily-briefing`);

        if (!response.ok) {
            throw new Error("Unable to load today's briefing.");
        }

        const data = await response.json();

        resultsList.replaceChildren();

        resultsTitle.textContent = "Your Daily Briefing";

        resultsCount.textContent =
            `${data.total_articles} articles`;


        // LOOP THROUGH ARTICLE CATEGORIES

        for (const [category, articles] of Object.entries(data.categories)) {

            const categorySection = document.createElement("section");

            categorySection.className = "briefing-category";


            // CATEGORY HEADING

            const categoryHeading = document.createElement("h2");

            categoryHeading.textContent = category;

            categorySection.appendChild(categoryHeading);


            // LOOP THROUGH ARTICLES IN EACH CATEGORY

            for (const [index, article] of articles.entries()) {

                const card = createArticleCard(
                    article,
                    category,
                    index
                );

                categorySection.appendChild(card);

            }

            resultsList.appendChild(categorySection);

        }


        statusMessage.textContent =
            "Your latest research and technology updates are ready.";

    } catch (error) {

        console.error("Daily briefing error:", error);

        statusMessage.textContent =
            "Couldn't load the briefing. Please check your backend and try again.";

    } finally {

        refreshButton.disabled = false;

    }

}


// ==========================================
// 4. SEARCH FORM
// ==========================================

searchForm.addEventListener("submit", async (event) => {

    // Prevent the browser from refreshing the page.
    event.preventDefault();

    const query = searchInput.value.trim();
    const count = Number(resultCount.value);


    if (!query) {

        statusMessage.textContent =
            "Please enter a topic to research.";

        return;

    }


    // SHOW LOADING FEEDBACK

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    resultsTitle.textContent = "Searching the web...";
    resultsCount.textContent = "";

    statusMessage.textContent =
        "Finding useful sources for your research.";

    resultsList.replaceChildren();


    try {

        // SEND SEARCH REQUEST TO FASTAPI

        const url = new URL("/search", API_URL);

        url.searchParams.set("q", query);
        url.searchParams.set("count", String(count));

        const response = await fetch(url);


        // HANDLE HTTP ERRORS

        if (!response.ok) {

            let errorData = {};

            try {
                errorData = await response.json();
            } catch {
                // Response may not contain JSON.
            }

            throw new Error(
                errorData.detail || "Something went wrong."
            );

        }


        const data = await response.json();


        // UPDATE SEARCH RESULTS HEADING

        resultsTitle.textContent =
            `Results for "${data.query}"`;

        resultsCount.textContent =
            `${data.count} sources`;


        // CHECK IF RESULTS ARE AVAILABLE

        if (!data.results || data.results.length === 0) {

            statusMessage.textContent =
                "No results found. Try another topic.";

            return;

        }


        statusMessage.textContent =
            "Here are the sources we found.";


        // CREATE REUSABLE ARTICLE CARDS

        data.results.forEach((result, index) => {

            const card = createArticleCard(
                result,
                "Search Result",
                index
            );

            resultsList.appendChild(card);

        });


    } catch (error) {

        console.error("Research search failed:", error);

        resultsTitle.textContent = "Search unsuccessful";

        statusMessage.textContent =
            error.message.includes("Failed to fetch")
                ? "Could not connect to the backend. Check that FastAPI is running and CORS is configured."
                : error.message;

    } finally {

        // RE-ENABLE SEARCH BUTTON

        searchButton.disabled = false;

        searchButton.innerHTML =
            'Search <span aria-hidden="true">↗</span>';

    }

});


// ==========================================
// 5. INITIALIZE APPLICATION
// ==========================================

// Load daily briefing when the page opens.
loadDailyBriefing();


// Refresh daily briefing when refresh button is clicked.
refreshButton.addEventListener("click", loadDailyBriefing);
