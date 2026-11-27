// ==========================================================================
// ResearchMate — AI Research Assistant & Editorial Intelligence Platform
// Supabase Authentication, Personalized Onboarding & Research Workspace
// ==========================================================================

// ---------- 1. Configuration & Supabase Initialization ----------
const config = window.RESEARCHMATE_CONFIG || {
    SUPABASE_URL: "https://your-project-id.supabase.co",
    SUPABASE_ANON_KEY: "your-anon-publishable-key-here",
    API_URL: "http://127.0.0.1:8000"
};

// Intelligently resolve API URL: prefer local FastAPI backend when running locally in development
function resolveApiUrl() {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
        if (config.API_URL && (config.API_URL.includes("localhost") || config.API_URL.includes("127.0.0.1"))) {
            return config.API_URL;
        }
        return "http://127.0.0.1:8000";
    }
    return config.API_URL || "http://127.0.0.1:8000";
}

const API_URL = resolveApiUrl();
const isPlaceholderSupabase =
    !config.SUPABASE_URL ||
    config.SUPABASE_URL.includes("your-project-id") ||
    !config.SUPABASE_ANON_KEY ||
    config.SUPABASE_ANON_KEY.includes("your-anon-publishable-key");

// Ensure only one shared Supabase client is created and reused throughout the application
function getSharedSupabaseClient() {
    if (window._supabaseClientInstance) {
        return window._supabaseClientInstance;
    }
    if (!isPlaceholderSupabase && window.supabase && typeof window.supabase.createClient === "function") {
        try {
            window._supabaseClientInstance = window.supabase.createClient(
                config.SUPABASE_URL,
                config.SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                }
            );
            return window._supabaseClientInstance;
        } catch (e) {
            console.error("[ResearchMate] Supabase client initialization failed:", e);
        }
    }
    return null;
}

const supabaseClient = getSharedSupabaseClient();

// ---------- 2. Approved Canonical Topics (Strict List of 12) ----------
const APPROVED_TOPICS = [
    {
        name: "Artificial Intelligence",
        desc: "Foundational AI architectures, benchmark evaluations, and cognitive systems.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`
    },
    {
        name: "Machine Learning",
        desc: "Deep learning models, reinforcement learning, and predictive optimization.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
    },
    {
        name: "Large Language Models",
        desc: "Frontier LLMs, fine-tuning techniques, reasoning models, and agentic workflows.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
    },
    {
        name: "Robotics & Automation",
        desc: "Humanoid robotics, embedded physical intelligence, and industrial automation.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`
    },
    {
        name: "Quantum Computing",
        desc: "Quantum processors, fault-tolerant qubit hardware, and quantum algorithm theory.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
    },
    {
        name: "Cybersecurity & Cryptography",
        desc: "Post-quantum crypto, zero-day threat intelligence, and secure enclave systems.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
    },
    {
        name: "Biotechnology & Genomics",
        desc: "CRISPR gene editing, computational biology, protein folding, and synthetic bio.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>`
    },
    {
        name: "Autonomous Systems",
        desc: "Self-driving navigation, aerial UAVs, multi-agent coordination, and sensor fusion.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`
    },
    {
        name: "Cloud & Distributed Systems",
        desc: "Edge computing, low-latency distributed networks, and resilient infrastructure.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`
    },
    {
        name: "Semiconductors & Hardware",
        desc: "Custom silicon, high-bandwidth memory (HBM), and advanced lithography.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`
    },
    {
        name: "Developer Tools & Platforms",
        desc: "Compiler engineering, developer experience, and software verification tools.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
    },
    {
        name: "Global Technology Trends",
        desc: "Emerging technological ecosystems, venture shifts, and regulatory frameworks.",
        icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
    }
];

const APPROVED_TOPIC_NAMES = new Set(APPROVED_TOPICS.map((t) => t.name));

// ---------- 3. Application State ----------
let currentUser = null;
let userPreferences = []; // Exactly 4 topics
let selectedOnboardingTopics = new Set();
let selectedModalTopics = new Set();
let currentBriefingData = null;
let activeCategory = "all";

// ---------- 4. DOM Elements ----------
// Views
const authView = document.getElementById("auth-view");
const onboardingView = document.getElementById("onboarding-view");
const dashboardView = document.getElementById("dashboard-view");
const editPreferencesModal = document.getElementById("edit-preferences-modal");

// Nav & Header
const topBarDate = document.getElementById("top-bar-date");
const topTickerText = document.getElementById("top-ticker-text");
const navCenterChannels = document.querySelector(".nav-center-channels");
const telemetryWrapper = document.getElementById("telemetry-wrapper");
const telemetryPill = document.getElementById("telemetry-pill");
const telemetryPopover = document.getElementById("telemetry-popover");
const telemetryClose = document.getElementById("telemetry-close");
const telemetryRate = document.getElementById("telemetry-rate");
const telemetryLatency = document.getElementById("telemetry-latency");
const navUserProfile = document.getElementById("nav-user-profile");
const userAvatarInitials = document.getElementById("user-avatar-initials");
const userEmailText = document.getElementById("user-email-text");
const navEditTopicsBtn = document.getElementById("nav-edit-topics-btn");
const navSignOutBtn = document.getElementById("nav-sign-out-btn");

// Mobile Drawer Elements
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileNavDrawer = document.getElementById("mobile-nav-drawer");
const mobileUserActions = document.getElementById("mobile-user-actions");
const mobileUserInitials = document.getElementById("mobile-user-initials");
const mobileUserEmail = document.getElementById("mobile-user-email");
const mobileEditTopicsBtn = document.getElementById("mobile-edit-topics-btn");
const mobileSignOutBtn = document.getElementById("mobile-sign-out-btn");

// Hero Showcase Elements
const heroShowcase = document.getElementById("hero-showcase");
const heroLeadBanner = document.getElementById("hero-lead-banner");
const heroCategoryBadge = document.getElementById("hero-category-badge");
const heroSourceDomain = document.getElementById("hero-source-domain");
const heroTitle = document.getElementById("hero-title");
const heroTitleLink = document.getElementById("hero-title-link");
const heroAuthorName = document.getElementById("hero-author-name");
const heroMetaStatus = document.getElementById("hero-meta-status");
const heroFloatingCards = document.getElementById("hero-floating-cards");

// Trending Section Elements
const trendingSection = document.getElementById("trending-section");
const trendingLeadCard = document.getElementById("trending-lead-card");
const trendingListColumn = document.getElementById("trending-list-column");
const focusTopicsWidget = document.getElementById("focus-topics-widget");
const widgetTopicsList = document.getElementById("widget-topics-list");
const widgetEditTopicsBtn = document.getElementById("widget-edit-topics-btn");

// Sidebar Telemetry Widget Elements
const telemetryWidgetCard = document.getElementById("telemetry-widget-card");
const widgetHitRate = document.getElementById("widget-hit-rate");
const widgetHits = document.getElementById("widget-hits");
const widgetApiAttempts = document.getElementById("widget-api-attempts");
const widgetLatency = document.getElementById("widget-latency");

// Bento Metrics
const bentoHitRate = document.getElementById("bento-hit-rate");
const bentoHits = document.getElementById("bento-hits");
const bentoMisses = document.getElementById("bento-misses");
const bentoEvictions = document.getElementById("bento-evictions");
const bentoApiAttempts = document.getElementById("bento-api-attempts");
const bentoLatency = document.getElementById("bento-latency");

// Auth Controls
const googleAuthBtn = document.getElementById("google-auth-btn");
const tabSignIn = document.getElementById("tab-signin");
const tabSignUp = document.getElementById("tab-signup");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authError = document.getElementById("auth-error");
let isSignUpMode = false;

// Onboarding Controls
const topicGrid = document.getElementById("topic-grid");
const topicCounter = document.getElementById("topic-counter");
const topicCounterPill = document.getElementById("topic-counter-pill");
const savePreferencesBtn = document.getElementById("save-preferences-btn");
const onboardingError = document.getElementById("onboarding-error");
const onboardingErrorText = document.getElementById("onboarding-error-text");
const onboardingLoadingOverlay = document.getElementById("onboarding-loading-overlay");

// Modal Controls
const modalTopicGrid = document.getElementById("modal-topic-grid");
const modalTopicCounter = document.getElementById("modal-topic-counter");
const modalTopicCounterBadge = document.getElementById("modal-topic-counter-badge");
const modalSaveBtn = document.getElementById("modal-save-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalError = document.getElementById("modal-error");

// Dashboard Search & Briefing Controls
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultCount = document.getElementById("result-count");
const searchButton = document.getElementById("search-button");
const searchKbd = document.getElementById("search-kbd");
const briefingTabs = document.getElementById("briefing-tabs");
const resultsTitle = document.getElementById("results-title");
const resultsCount = document.getElementById("results-count");
const statusMessage = document.getElementById("status-message");
const resultsList = document.getElementById("results-list");
const refreshButton = document.getElementById("refresh-briefing");

// ---------- 5. View Routing & State Management ----------
function showView(viewName) {
    if (authView) authView.hidden = viewName !== "auth";
    if (onboardingView) onboardingView.hidden = viewName !== "onboarding";
    if (dashboardView) dashboardView.hidden = viewName !== "dashboard";

    // Cleanly reset any contextual error state when switching away or to clean views
    if (viewName === "onboarding" && onboardingError) {
        onboardingError.hidden = true;
        if (onboardingErrorText) onboardingErrorText.textContent = "";
    }
    if (viewName === "auth" && authError) {
        authError.hidden = true;
        authError.textContent = "";
    }

    if (viewName === "dashboard") {
        if (telemetryWrapper) telemetryWrapper.hidden = false;
        if (navUserProfile) navUserProfile.hidden = false;
        if (mobileUserActions) mobileUserActions.hidden = false;
        if (navCenterChannels) navCenterChannels.hidden = false;
    } else if (viewName === "onboarding") {
        if (telemetryWrapper) telemetryWrapper.hidden = true;
        if (navUserProfile) navUserProfile.hidden = false;
        if (mobileUserActions) mobileUserActions.hidden = false;
        if (navCenterChannels) navCenterChannels.hidden = true;
    } else {
        // Auth view
        if (telemetryWrapper) telemetryWrapper.hidden = true;
        if (navUserProfile) navUserProfile.hidden = true;
        if (mobileUserActions) mobileUserActions.hidden = true;
        if (navCenterChannels) navCenterChannels.hidden = true;
    }

    closeMobileDrawer();
}

function updateUserHeader(user) {
    if (!user) return;
    const email = user.email || "researcher@octen.ai";
    if (userEmailText) userEmailText.textContent = email;
    if (mobileUserEmail) mobileUserEmail.textContent = email;

    const parts = email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    const words = parts.trim().split(/\s+/);
    const initials = words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : email.slice(0, 2).toUpperCase();

    if (userAvatarInitials) userAvatarInitials.textContent = initials;
    if (mobileUserInitials) mobileUserInitials.textContent = initials;
}

// ---------- 6. Supabase Preferences Controller ----------
async function checkUserPreferencesAndRoute(user) {
    if (!user) {
        console.warn("[ResearchMate Preferences] No user provided. Showing Auth view.");
        showView("auth");
        return;
    }

    currentUser = user;
    updateUserHeader(user);

    // 1. Instant optimistic restore from user-scoped localStorage
    let loadedFromCache = false;
    const cachedPrefs = localStorage.getItem(`rm_prefs_${user.id}`);
    if (cachedPrefs) {
        try {
            const parsed = JSON.parse(cachedPrefs);
            if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((t) => APPROVED_TOPIC_NAMES.has(t))) {
                console.log("[ResearchMate Preferences] Instant restore from user localStorage:", parsed);
                userPreferences = parsed;
                showView("dashboard");
                setupDashboardTabs(userPreferences);
                renderFocusTopicsWidget();
                loadDailyBriefing(userPreferences);
                fetchStats();
                loadedFromCache = true;
            }
        } catch (e) {
            console.warn("[ResearchMate Preferences] Corrupted localStorage cache:", e);
        }
    }

    if (!supabaseClient) {
        console.warn("[ResearchMate Preferences] Supabase client is not available.");
        if (!loadedFromCache) {
            showView("onboarding");
            renderTopicGrid();
        }
        return;
    }

    console.log(`[ResearchMate Preferences] Querying user_preferences for user ID: ${user.id} (${user.email || 'no-email'})`);

    try {
        const { data, error, status } = await supabaseClient
            .from("user_preferences")
            .select("topics")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("[ResearchMate Supabase Query Error]", {
                status: status,
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });

            // If already loaded from cache, remain on dashboard
            if (loadedFromCache) return;

            // Specific check for relation/table missing in database (PostgreSQL 42P01)
            const isTableMissing =
                error.code === "42P01" ||
                (error.message && (
                    error.message.toLowerCase().includes("does not exist") ||
                    error.message.toLowerCase().includes("relation")
                ));

            showView("onboarding");
            renderTopicGrid();
            if (onboardingError && onboardingErrorText) {
                onboardingError.hidden = false;
                onboardingErrorText.textContent = isTableMissing
                    ? "The preferences table is not available yet. Apply the included Supabase migration, then try again."
                    : `Supabase Error (${error.code || status}): ${error.message}`;
            }
            return;
        }

        console.log("[ResearchMate Preferences] Query succeeded. Record:", data);

        if (data && Array.isArray(data.topics) && data.topics.length === 4 && data.topics.every((t) => APPROVED_TOPIC_NAMES.has(t))) {
            console.log("[ResearchMate Preferences] User has 4 saved topics:", data.topics);
            const topicsChanged = JSON.stringify(userPreferences) !== JSON.stringify(data.topics);
            userPreferences = data.topics;
            localStorage.setItem(`rm_prefs_${user.id}`, JSON.stringify(data.topics));

            showView("dashboard");
            setupDashboardTabs(userPreferences);
            renderFocusTopicsWidget();
            if (topicsChanged || !currentBriefingData) {
                loadDailyBriefing(userPreferences);
            }
            fetchStats();
        } else {
            // If we have cached preferences from localStorage, sync them to Supabase
            if (loadedFromCache && userPreferences && userPreferences.length === 4) {
                supabaseClient
                    .from("user_preferences")
                    .upsert({
                        user_id: user.id,
                        topics: userPreferences,
                        updated_at: new Date().toISOString()
                    }, { onConflict: "user_id" })
                    .then(() => console.log("[ResearchMate Preferences] Synced cached preferences to Supabase."))
                    .catch((err) => console.warn("[ResearchMate Preferences] Could not sync cached preferences to Supabase:", err));
                return;
            }

            // New user without 4 saved topics -> route to Onboarding cleanly without error banner
            console.log("[ResearchMate Preferences] New user without saved preferences. Routing to Onboarding.");
            showView("onboarding");
            if (onboardingError) onboardingError.hidden = true;
            renderTopicGrid();
        }
    } catch (err) {
        console.error("[ResearchMate Preferences] Unexpected exception during query:", err);
        if (loadedFromCache) return;
        showView("onboarding");
        renderTopicGrid();
        if (onboardingError && onboardingErrorText) {
            onboardingError.hidden = false;
            onboardingErrorText.textContent = err.message || "Failed to load preferences.";
        }
    }
}

// ---------- 7. Onboarding Topic Selection Component ----------
function renderTopicGrid() {
    if (!topicGrid) return;
    topicGrid.replaceChildren();

    APPROVED_TOPICS.forEach((topic) => {
        const chip = document.createElement("div");
        chip.className = `topic-chip ${selectedOnboardingTopics.has(topic.name) ? "selected" : ""}`;
        chip.dataset.topic = topic.name;
        chip.tabIndex = 0;
        chip.role = "checkbox";
        chip.setAttribute("aria-checked", selectedOnboardingTopics.has(topic.name) ? "true" : "false");

        chip.innerHTML = `
            <div class="topic-chip-icon">${topic.icon}</div>
            <div class="topic-chip-content">
                <span class="topic-chip-title">${topic.name}</span>
                <span class="topic-chip-desc">${topic.desc}</span>
            </div>
            <div class="topic-chip-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `;

        chip.addEventListener("click", () => toggleOnboardingTopic(topic.name, chip));
        chip.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggleOnboardingTopic(topic.name, chip);
            }
        });

        topicGrid.appendChild(chip);
    });

    updateOnboardingCounter();
}

function toggleOnboardingTopic(topicName, chipElement) {
    if (selectedOnboardingTopics.has(topicName)) {
        selectedOnboardingTopics.delete(topicName);
        chipElement.classList.remove("selected");
        chipElement.setAttribute("aria-checked", "false");
    } else {
        if (selectedOnboardingTopics.size >= 4) {
            // Shake chip to signal max quota reached
            chipElement.animate([
                { transform: "translateX(0)" },
                { transform: "translateX(-4px)" },
                { transform: "translateX(4px)" },
                { transform: "translateX(0)" }
            ], { duration: 250 });
            return;
        }
        selectedOnboardingTopics.add(topicName);
        chipElement.classList.add("selected");
        chipElement.setAttribute("aria-checked", "true");
    }

    updateOnboardingCounter();
}

function updateOnboardingCounter() {
    const count = selectedOnboardingTopics.size;
    if (topicCounter) topicCounter.textContent = `${count} / 4`;

    const isReady = count === 4;
    if (topicCounterPill) {
        topicCounterPill.classList.toggle("ready", isReady);
    }
    if (savePreferencesBtn) {
        savePreferencesBtn.disabled = !isReady;
    }
}

// Save Onboarding Preferences Click
if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener("click", async () => {
        if (selectedOnboardingTopics.size !== 4) return;

        const topicsArray = Array.from(selectedOnboardingTopics);
        // Strict frontend validation against canonical list
        const allValid = topicsArray.every((t) => APPROVED_TOPIC_NAMES.has(t));
        if (!allValid) {
            if (onboardingError && onboardingErrorText) {
                onboardingError.hidden = false;
                onboardingErrorText.textContent = "Please select approved research topics only.";
            }
            return;
        }

        // Display Figma Make Loading Transition Overlay
        if (onboardingLoadingOverlay) onboardingLoadingOverlay.hidden = false;
        if (onboardingError) onboardingError.hidden = true;

        try {
            if (currentUser) {
                localStorage.setItem(`rm_prefs_${currentUser.id}`, JSON.stringify(topicsArray));
            }

            if (!isPlaceholderSupabase && supabaseClient && currentUser) {
                const { error, status } = await supabaseClient
                    .from("user_preferences")
                    .upsert({
                        user_id: currentUser.id,
                        topics: topicsArray,
                        updated_at: new Date().toISOString()
                    }, { onConflict: "user_id" });

                if (error) {
                    console.error("[ResearchMate Supabase Save Error]", {
                        status: status,
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    });
                    throw error;
                }
            }

            userPreferences = topicsArray;

            // Smooth transition animation matching Figma Make
            setTimeout(() => {
                if (onboardingLoadingOverlay) onboardingLoadingOverlay.hidden = true;
                showView("dashboard");
                setupDashboardTabs(userPreferences);
                renderFocusTopicsWidget();
                loadDailyBriefing(userPreferences);
                fetchStats();
            }, 850);

        } catch (err) {
            console.error("[ResearchMate Preferences] Failed to save preferences:", err);
            if (onboardingLoadingOverlay) onboardingLoadingOverlay.hidden = true;
            if (onboardingError && onboardingErrorText) {
                onboardingError.hidden = false;
                onboardingErrorText.textContent = err.message || "Failed to save preferences. Please verify your Supabase migration.";
            }
        }
    });
}

// ---------- 8. Edit Preferences Modal (From Dashboard) ----------
function openEditPreferencesModal() {
    if (!editPreferencesModal) return;
    selectedModalTopics = new Set(userPreferences);
    renderModalTopicGrid();
    updateModalCounter();
    if (modalError) modalError.hidden = true;
    editPreferencesModal.hidden = false;
}

function closeEditPreferencesModal() {
    if (!editPreferencesModal) return;
    editPreferencesModal.hidden = true;
}

function renderModalTopicGrid() {
    if (!modalTopicGrid) return;
    modalTopicGrid.replaceChildren();

    APPROVED_TOPICS.forEach((topic) => {
        const chip = document.createElement("div");
        chip.className = `topic-chip ${selectedModalTopics.has(topic.name) ? "selected" : ""}`;
        chip.tabIndex = 0;

        chip.innerHTML = `
            <div class="topic-chip-icon">${topic.icon}</div>
            <div class="topic-chip-content">
                <span class="topic-chip-title">${topic.name}</span>
                <span class="topic-chip-desc">${topic.desc}</span>
            </div>
            <div class="topic-chip-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `;

        chip.addEventListener("click", () => {
            if (selectedModalTopics.has(topic.name)) {
                selectedModalTopics.delete(topic.name);
                chip.classList.remove("selected");
            } else {
                if (selectedModalTopics.size >= 4) return;
                selectedModalTopics.add(topic.name);
                chip.classList.add("selected");
            }
            updateModalCounter();
        });

        modalTopicGrid.appendChild(chip);
    });
}

function updateModalCounter() {
    const count = selectedModalTopics.size;
    if (modalTopicCounter) modalTopicCounter.textContent = `${count} / 4`;
    const isReady = count === 4;
    if (modalTopicCounterBadge) modalTopicCounterBadge.classList.toggle("ready", isReady);
    if (modalSaveBtn) modalSaveBtn.disabled = !isReady;
}

if (navEditTopicsBtn) navEditTopicsBtn.addEventListener("click", openEditPreferencesModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeEditPreferencesModal);
if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeEditPreferencesModal);

if (modalSaveBtn) {
    modalSaveBtn.addEventListener("click", async () => {
        if (selectedModalTopics.size !== 4) return;

        const newTopics = Array.from(selectedModalTopics);
        const allValid = newTopics.every((t) => APPROVED_TOPIC_NAMES.has(t));
        if (!allValid) {
            if (modalError) {
                modalError.hidden = false;
                modalError.textContent = "Please select approved research topics only.";
            }
            return;
        }

        modalSaveBtn.disabled = true;
        modalSaveBtn.textContent = "Updating...";

        try {
            // Update in-memory state and localStorage first
            userPreferences = newTopics;
            if (currentUser) {
                localStorage.setItem(`rm_prefs_${currentUser.id}`, JSON.stringify(newTopics));
            }

            if (!isPlaceholderSupabase && supabaseClient && currentUser) {
                const { error, status } = await supabaseClient
                    .from("user_preferences")
                    .upsert({
                        user_id: currentUser.id,
                        topics: newTopics,
                        updated_at: new Date().toISOString()
                    }, { onConflict: "user_id" });

                if (error) {
                    console.error("[ResearchMate Supabase Modal Update Error]", {
                        status: status,
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    });
                    throw error;
                }
            }

            closeEditPreferencesModal();
            setupDashboardTabs(userPreferences);
            renderFocusTopicsWidget();
            loadDailyBriefing(userPreferences);

        } catch (err) {
            console.error("[ResearchMate Preferences] Modal update error:", err);
            if (modalError) {
                modalError.hidden = false;
                modalError.textContent = err.message || "Failed to update preferences.";
            }
        } finally {
            modalSaveBtn.disabled = false;
            modalSaveBtn.textContent = "Update Preferences";
        }
    });
}

// ---------- 9. Authentication Controllers ----------
function setupAuthTabs() {
    if (!tabSignIn || !tabSignUp) return;

    tabSignIn.addEventListener("click", () => {
        isSignUpMode = false;
        tabSignIn.classList.add("active");
        tabSignUp.classList.remove("active");
        tabSignIn.setAttribute("aria-selected", "true");
        tabSignUp.setAttribute("aria-selected", "false");
        authSubmitBtn.querySelector("span").textContent = "Sign In";
        if (authError) authError.hidden = true;
    });

    tabSignUp.addEventListener("click", () => {
        isSignUpMode = true;
        tabSignUp.classList.add("active");
        tabSignIn.classList.remove("active");
        tabSignUp.setAttribute("aria-selected", "true");
        tabSignIn.setAttribute("aria-selected", "false");
        authSubmitBtn.querySelector("span").textContent = "Create Account";
        if (authError) authError.hidden = true;
    });
}

if (authForm) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) return;

        authSubmitBtn.disabled = true;
        const origText = authSubmitBtn.querySelector("span").textContent;
        authSubmitBtn.querySelector("span").textContent = isSignUpMode ? "Creating..." : "Signing in...";
        if (authError) authError.hidden = true;

        if (isPlaceholderSupabase) {
            // Local simulation when placeholders are untouched
            setTimeout(() => {
                authSubmitBtn.disabled = false;
                authSubmitBtn.querySelector("span").textContent = origText;
                const mockUser = { id: `user_${btoa(email).slice(0, 8)}`, email: email };
                localStorage.setItem("rm_mock_session", JSON.stringify(mockUser));
                checkUserPreferencesAndRoute(mockUser);
            }, 600);
            return;
        }

        try {
            if (isSignUpMode) {
                const { data, error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) {
                    await checkUserPreferencesAndRoute(data.user);
                } else {
                    if (authError) {
                        authError.hidden = false;
                        authError.textContent = "Account created. Please check your email to confirm your account.";
                    }
                }
            } else {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                await checkUserPreferencesAndRoute(data.user);
            }
        } catch (err) {
            console.error("Auth error:", err);
            if (authError) {
                authError.hidden = false;
                authError.textContent = err.message || "Authentication failed.";
            }
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.querySelector("span").textContent = origText;
        }
    });
}

// Google OAuth Handler
if (googleAuthBtn) {
    googleAuthBtn.addEventListener("click", async () => {
        if (isPlaceholderSupabase) {
            // Simulated OAuth in placeholder mode
            const mockUser = { id: "google_user_researcher", email: "researcher@gmail.com" };
            localStorage.setItem("rm_mock_session", JSON.stringify(mockUser));
            checkUserPreferencesAndRoute(mockUser);
            return;
        }

        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error("Google OAuth error:", err);
            if (authError) {
                authError.hidden = false;
                authError.textContent = err.message || "Failed to initiate Google sign-in.";
            }
        }
    });
}

// Sign Out Handler
async function handleSignOut() {
    closeMobileDrawer();
    if (supabaseClient) {
        try {
            await supabaseClient.auth.signOut();
        } catch (e) {
            console.warn("Sign out error:", e);
        }
    }
    localStorage.removeItem("rm_mock_session");
    currentUser = null;
    userPreferences = [];
    selectedOnboardingTopics.clear();
    selectedModalTopics.clear();
    currentBriefingData = null;
    if (briefingTabs) briefingTabs.replaceChildren();
    if (widgetTopicsList) widgetTopicsList.replaceChildren();
    showView("auth");
}

if (navSignOutBtn) {
    navSignOutBtn.addEventListener("click", handleSignOut);
}
if (mobileSignOutBtn) {
    mobileSignOutBtn.addEventListener("click", handleSignOut);
}

// ---------- 10. Dashboard Dynamic Tabs ----------
function setupDashboardTabs(topics) {
    if (!briefingTabs) return;
    briefingTabs.replaceChildren();

    // "All Channels" tab
    const allTab = document.createElement("button");
    allTab.className = "tab-item active";
    allTab.dataset.category = "all";
    allTab.type = "button";
    allTab.textContent = "All Channels";
    allTab.addEventListener("click", () => selectCategoryTab("all", allTab));
    briefingTabs.appendChild(allTab);

    // Dynamic tabs for user's 4 topics
    const categoriesToRender = (Array.isArray(topics) && topics.length === 4)
        ? topics
        : ((Array.isArray(userPreferences) && userPreferences.length === 4)
            ? userPreferences
            : ["AI & Research", "Global Tech", "Developer News", "Jobs & Internships"]);

    categoriesToRender.forEach((category) => {
        const tab = document.createElement("button");
        tab.className = "tab-item";
        tab.dataset.category = category;
        tab.type = "button";
        tab.textContent = category;
        tab.addEventListener("click", () => selectCategoryTab(category, tab));
        briefingTabs.appendChild(tab);
    });
}

function selectCategoryTab(category, tabElement) {
    const tabs = briefingTabs.querySelectorAll(".tab-item");
    tabs.forEach((t) => t.classList.remove("active"));
    tabElement.classList.add("active");
    activeCategory = category;

    if (currentBriefingData) {
        renderBriefingContent();
    } else {
        loadDailyBriefing(userPreferences);
    }
}

// ---------- 11. Backend Telemetry Controller (GET /stats) ----------
async function fetchStats() {
    if (!telemetryPill) return;

    try {
        const startTime = performance.now();
        const response = await fetch(`${API_URL}/stats`);
        const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

        if (!response.ok) return;

        const data = await response.json();
        const cache = data.cache || {};

        const hitRate = cache.hit_rate !== undefined ? `${cache.hit_rate}%` : "0%";
        const hits = cache.hits || 0;
        const misses = cache.misses || 0;
        const evictions = cache.evictions || 0;
        const apiAttempts = data.api_attempts || 0;

        if (telemetryRate) telemetryRate.textContent = hitRate;
        if (telemetryLatency) telemetryLatency.textContent = `${latencyMs}ms`;

        if (bentoHitRate) bentoHitRate.textContent = hitRate;
        if (bentoHits) bentoHits.textContent = String(hits);
        if (bentoMisses) bentoMisses.textContent = String(misses);
        if (bentoEvictions) bentoEvictions.textContent = String(evictions);
        if (bentoApiAttempts) bentoApiAttempts.textContent = String(apiAttempts);
        if (bentoLatency) bentoLatency.textContent = `${latencyMs}ms`;

        // Sidebar Telemetry Widget Card (Newspaper Design)
        if (widgetHitRate) widgetHitRate.textContent = hitRate;
        if (widgetHits) widgetHits.textContent = String(hits);
        if (widgetApiAttempts) widgetApiAttempts.textContent = String(apiAttempts);
        if (widgetLatency) widgetLatency.textContent = `${latencyMs}ms`;

    } catch (error) {
        console.warn("Telemetry unavailable:", error.message);
    }
}

function openTelemetryPopover() {
    if (!telemetryPopover) return;
    telemetryPopover.hidden = false;
    telemetryPill.setAttribute("aria-expanded", "true");
}

function closeTelemetryPopover() {
    if (!telemetryPopover) return;
    telemetryPopover.hidden = true;
    telemetryPill.setAttribute("aria-expanded", "false");
}

if (telemetryPill) {
    telemetryPill.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = telemetryPill.getAttribute("aria-expanded") === "true";
        if (isExpanded) closeTelemetryPopover();
        else openTelemetryPopover();
    });
}

if (telemetryClose) {
    telemetryClose.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTelemetryPopover();
    });
}

document.addEventListener("click", (e) => {
    if (telemetryPopover && !telemetryPopover.hidden) {
        if (!telemetryPopover.contains(e.target) && !telemetryPill.contains(e.target)) {
            closeTelemetryPopover();
        }
    }
});

// ---------- 12. Article Cards & Thumbnail Builders ----------
function getCategoryColorClass(category) {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("ai") || normalized.includes("language") || normalized.includes("learning")) return "category-blue";
    if (normalized.includes("quantum") || normalized.includes("robotics") || normalized.includes("autonomous")) return "category-violet";
    if (normalized.includes("developer") || normalized.includes("cloud") || normalized.includes("hardware")) return "category-indigo";
    if (normalized.includes("biotech") || normalized.includes("cybersecurity")) return "category-pink";
    return "category-default";
}

function createCategoryPlaceholder(category) {
    const placeholder = document.createElement("div");
    placeholder.className = "category-placeholder";
    placeholder.innerHTML = `
        <div class="placeholder-icon-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        </div>
        <span class="placeholder-label">${category || "Research Source"}</span>
    `;
    return placeholder;
}

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
            // Invalid image URL format
        }
    }

    if (safeImageUrl) {
        const img = document.createElement("img");
        img.className = "card-thumbnail-img";
        img.src = safeImageUrl;
        img.alt = article.title ? `${article.title} thumbnail` : "Article thumbnail";
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () {
            wrapper.replaceChildren(createCategoryPlaceholder(category));
        };
        wrapper.appendChild(img);
    } else {
        wrapper.appendChild(createCategoryPlaceholder(category));
    }

    return wrapper;
}

function createFaviconFallback() {
    const fallback = document.createElement("span");
    fallback.className = "article-favicon-fallback";
    fallback.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    `;
    return fallback;
}

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

function renderSkeletons(count = 6, isBriefing = false) {
    if (!resultsList) return;
    resultsList.replaceChildren();

    if (isBriefing) {
        const categories = (userPreferences && userPreferences.length === 4)
            ? userPreferences.slice(0, 2)
            : ["AI & Research", "Global Tech"];

        categories.forEach((cat) => {
            const section = document.createElement("section");
            section.className = "briefing-category";

            const header = document.createElement("div");
            header.className = "category-header";
            header.innerHTML = `
                <span class="category-header-dot"></span>
                <h3>${cat}</h3>
                <span class="category-header-count">Loading intelligence...</span>
            `;
            section.appendChild(header);

            const grid = document.createElement("div");
            grid.className = "briefing-grid";
            for (let i = 0; i < 3; i++) {
                grid.appendChild(createSkeletonCard());
            }
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

function getCleanArticleDescription(article, fallback = "No description available.") {
    if (!article) return fallback;
    const raw = article.summary || article.description || article.highlight || "";
    if (typeof raw !== "string") return fallback;
    const trimmed = raw.trim();
    if (!trimmed) return fallback;

    // Guard against raw JSON error responses or network error artifacts
    if (trimmed.startsWith("{") && (trimmed.includes('"error"') || trimmed.includes('"message"') || trimmed.includes('"detail"'))) {
        return fallback;
    }
    if (trimmed.toLowerCase().startsWith("error:") || trimmed.toLowerCase().includes("failed to fetch")) {
        return fallback;
    }

    // Limit length to approx 350 chars with graceful sentence/word boundary truncation
    if (trimmed.length > 350) {
        const cut = trimmed.slice(0, 350);
        const lastPeriod = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
        if (lastPeriod > 180) {
            return cut.slice(0, lastPeriod + 1).trim();
        }
        const lastSpace = cut.lastIndexOf(" ");
        if (lastSpace > 0) {
            return cut.slice(0, lastSpace).replace(/[.,;: -]+$/, "") + "...";
        }
        return cut + "...";
    }

    return trimmed;
}

function createArticleCard(article, category = "Research", index = 0) {
    const card = document.createElement("article");
    card.className = "result-card";

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

    const thumbnail = createThumbnailElement(article, category);
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const header = document.createElement("div");
    header.className = "article-meta";

    const badge = document.createElement("span");
    badge.className = `article-category ${getCategoryColorClass(category)}`;
    badge.textContent = category;

    const number = document.createElement("span");
    number.className = "article-number";
    number.textContent = `SOURCE ${String(index + 1).padStart(2, "0")}`;

    header.append(badge, number);

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

    const description = document.createElement("p");
    description.className = "article-summary";
    description.textContent = getCleanArticleDescription(article, "No description available.");

    cardBody.append(header, headingWrapper, description);

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

    card.append(thumbnail, cardBody, footer);
    return card;
}

// ---------- 13. Top Bar, Hero Showcase & Magazine Feed Helpers ----------
function updateTopBarDate() {
    if (!topBarDate) return;
    const now = new Date();
    topBarDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function updateTickerText(articles) {
    if (!topTickerText) return;
    if (Array.isArray(articles) && articles.length > 0) {
        const headlines = articles
            .slice(0, 3)
            .map((a) => a.title)
            .filter(Boolean);
        if (headlines.length > 0) {
            topTickerText.textContent = headlines.join(" • ");
            return;
        }
    }
    topTickerText.textContent = "Live Intelligence Briefing • Octen Verified Sources • LRU Cache Enabled";
}

function getDomainFromUrl(rawUrl, fallback = "Verified Source") {
    if (!rawUrl || typeof rawUrl !== "string") return fallback;
    try {
        const parsed = new URL(rawUrl.trim());
        if (["http:", "https:"].includes(parsed.protocol)) {
            return parsed.hostname.replace(/^www\./, "");
        }
    } catch {
        // Fallback
    }
    return fallback;
}

function getSafeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    try {
        const parsed = new URL(rawUrl.trim());
        if (["http:", "https:"].includes(parsed.protocol)) {
            return parsed.href;
        }
    } catch {
        return null;
    }
    return null;
}

function extractOrderedBriefingArticles(categoriesData) {
    if (!categoriesData || typeof categoriesData !== "object") return [];
    const entries = Object.entries(categoriesData).filter(
        ([_, articles]) => Array.isArray(articles) && articles.length > 0
    );
    if (entries.length === 0) return [];

    let maxCount = 0;
    entries.forEach(([_, arts]) => {
        if (arts.length > maxCount) maxCount = arts.length;
    });

    const ordered = [];
    for (let i = 0; i < maxCount; i++) {
        for (const [catName, arts] of entries) {
            if (i < arts.length) {
                ordered.push({ ...arts[i], category: catName });
            }
        }
    }
    return ordered;
}

function createSubCardThumbFallback(category) {
    const placeholder = document.createElement("div");
    placeholder.className = "floating-sub-img";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.style.backgroundColor = "#F1F5F9";
    placeholder.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    `;
    return placeholder;
}

function renderHeroShowcase(articles) {
    if (!heroLeadBanner) return;

    if (!articles || articles.length === 0) {
        if (heroCategoryBadge) heroCategoryBadge.textContent = "AI Research";
        if (heroSourceDomain) heroSourceDomain.textContent = "Octen Verified";
        if (heroTitleLink) {
            heroTitleLink.href = "#";
            heroTitleLink.textContent = "No research reports available for the selected topics.";
        }
        if (heroFloatingCards) heroFloatingCards.replaceChildren();
        return;
    }

    const leadArticle = articles[0];
    const safeUrl = getSafeUrl(leadArticle.url);
    const domain = getDomainFromUrl(leadArticle.url, "Octen Verified");
    const safeImage = getSafeUrl(leadArticle.image_url);

    if (heroCategoryBadge) heroCategoryBadge.textContent = leadArticle.category || "Research Intelligence";
    if (heroSourceDomain) heroSourceDomain.textContent = domain;

    if (heroTitleLink) {
        heroTitleLink.textContent = leadArticle.title || "Untitled Research Report";
        if (safeUrl) {
            heroTitleLink.href = safeUrl;
            heroTitleLink.target = "_blank";
            heroTitleLink.rel = "noopener noreferrer";
        } else {
            heroTitleLink.href = "#";
            heroTitleLink.removeAttribute("target");
        }
    }

    if (heroAuthorName) heroAuthorName.textContent = domain;
    if (heroMetaStatus) heroMetaStatus.textContent = "Octen Verified Intelligence";

    // Dynamic background image or elegant dark gradient matching visual reference
    if (safeImage) {
        heroLeadBanner.style.backgroundImage = `linear-gradient(180deg, rgba(11, 21, 54, 0.45) 0%, rgba(11, 21, 54, 0.92) 100%), url('${safeImage}')`;
        heroLeadBanner.style.backgroundSize = "cover";
        heroLeadBanner.style.backgroundPosition = "center center";
    } else {
        heroLeadBanner.style.backgroundImage = "linear-gradient(135deg, #0B1536 0%, #172A6B 100%)";
    }

    // Secondary Floating Cards (Docked in Bottom-Right Corner)
    if (heroFloatingCards) {
        heroFloatingCards.replaceChildren();
        const secondaryArticles = articles.slice(1, 3);

        if (secondaryArticles.length === 0) {
            heroFloatingCards.style.display = "none";
        } else {
            heroFloatingCards.style.display = "flex";
            secondaryArticles.forEach((article) => {
                heroFloatingCards.appendChild(createFloatingSubCard(article));
            });
        }
    }
}

function createFloatingSubCard(article) {
    const card = document.createElement("div");
    card.className = "floating-sub-card";

    const safeUrl = getSafeUrl(article.url);
    const domain = getDomainFromUrl(article.url, "Verified Source");
    const safeImage = getSafeUrl(article.image_url);

    if (safeImage) {
        const img = document.createElement("img");
        img.className = "floating-sub-img";
        img.src = safeImage;
        img.alt = article.title ? `${article.title} thumbnail` : "Thumbnail";
        img.loading = "lazy";
        img.onerror = function() {
            this.replaceWith(createSubCardThumbFallback(article.category));
        };
        card.appendChild(img);
    } else {
        card.appendChild(createSubCardThumbFallback(article.category));
    }

    const content = document.createElement("div");
    content.className = "floating-sub-content";

    const badge = document.createElement("span");
    badge.className = "floating-sub-badge";
    badge.textContent = article.category || "Research";

    const titleDiv = document.createElement("div");
    titleDiv.className = "floating-sub-title";

    if (safeUrl) {
        const link = document.createElement("a");
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = article.title || "Untitled";
        titleDiv.appendChild(link);
    } else {
        titleDiv.textContent = article.title || "Untitled";
    }

    const sourceSpan = document.createElement("span");
    sourceSpan.className = "floating-sub-source";
    sourceSpan.textContent = domain;

    content.append(badge, titleDiv, sourceSpan);
    card.appendChild(content);

    return card;
}

function renderTrendingSection(articles) {
    if (!trendingLeadCard || !trendingListColumn) return;

    trendingLeadCard.replaceChildren();
    trendingListColumn.replaceChildren();

    if (!articles || articles.length === 0) return;

    // Lead Card in Trending: Article #3 if available, or first available
    const leadArticle = articles.length > 3 ? articles[3] : articles[0];
    if (leadArticle) {
        trendingLeadCard.appendChild(createTrendingLeadCardContent(leadArticle));
    }

    // Stacked Horizontal Cards: Articles #4, #5, #6 if available
    const listArticles = articles.length > 4 ? articles.slice(4, 7) : articles.slice(1, 4);
    listArticles.forEach((art) => {
        trendingListColumn.appendChild(createTrendingRowCard(art));
    });

    // Populate Focus Topics Widget
    renderFocusTopicsWidget();
}

function createTrendingLeadCardContent(article) {
    const fragment = document.createDocumentFragment();

    const safeUrl = getSafeUrl(article.url);
    const domain = getDomainFromUrl(article.url, "Verified Source");
    const safeImage = getSafeUrl(article.image_url);

    const media = document.createElement("div");
    media.className = "lead-card-media";
    if (safeImage) {
        const img = document.createElement("img");
        img.src = safeImage;
        img.alt = article.title ? `${article.title} cover` : "Article cover";
        img.loading = "lazy";
        img.onerror = function() {
            this.replaceWith(createCategoryPlaceholder(article.category));
        };
        media.appendChild(img);
    } else {
        media.appendChild(createCategoryPlaceholder(article.category));
    }
    fragment.appendChild(media);

    const body = document.createElement("div");
    body.className = "lead-card-body";

    const meta = document.createElement("div");
    meta.className = "lead-card-meta";
    const badge = document.createElement("span");
    badge.className = `article-category ${getCategoryColorClass(article.category)}`;
    badge.textContent = article.category || "Research";
    meta.appendChild(badge);

    const titleH3 = document.createElement("h3");
    titleH3.className = "lead-card-title";
    if (safeUrl) {
        const titleLink = document.createElement("a");
        titleLink.href = safeUrl;
        titleLink.target = "_blank";
        titleLink.rel = "noopener noreferrer";
        titleLink.textContent = article.title || "Untitled";
        titleH3.appendChild(titleLink);
    } else {
        titleH3.textContent = article.title || "Untitled";
    }

    const summary = document.createElement("p");
    summary.className = "lead-card-summary";
    summary.textContent = getCleanArticleDescription(article, "Verified research intelligence.");

    const footer = document.createElement("div");
    footer.className = "lead-card-footer";
    const domainSpan = document.createElement("span");
    domainSpan.className = "article-domain";
    domainSpan.textContent = domain;
    footer.appendChild(domainSpan);

    if (safeUrl) {
        const readLink = document.createElement("a");
        readLink.href = safeUrl;
        readLink.target = "_blank";
        readLink.rel = "noopener noreferrer";
        readLink.className = "source-link";
        readLink.innerHTML = `Read source <span aria-hidden="true">↗</span>`;
        footer.appendChild(readLink);
    }

    body.append(meta, titleH3, summary, footer);
    fragment.appendChild(body);

    return fragment;
}

function createTrendingRowCard(article) {
    const card = document.createElement("div");
    card.className = "trending-row-card";

    const safeUrl = getSafeUrl(article.url);
    const domain = getDomainFromUrl(article.url, "Verified Source");
    const safeImage = getSafeUrl(article.image_url);

    if (safeImage) {
        const img = document.createElement("img");
        img.className = "trending-row-thumb";
        img.src = safeImage;
        img.alt = "";
        img.loading = "lazy";
        img.onerror = function() {
            this.replaceWith(createSubCardThumbFallback(article.category));
        };
        card.appendChild(img);
    } else {
        card.appendChild(createSubCardThumbFallback(article.category));
    }

    const body = document.createElement("div");
    body.className = "trending-row-body";

    const meta = document.createElement("div");
    meta.className = "trending-row-meta";
    const badge = document.createElement("span");
    badge.className = `article-category ${getCategoryColorClass(article.category)}`;
    badge.textContent = article.category || "Research";
    const dot = document.createElement("span");
    dot.innerHTML = "&bull;";
    const domainSpan = document.createElement("span");
    domainSpan.className = "article-domain";
    domainSpan.textContent = domain;
    meta.append(badge, dot, domainSpan);

    const titleH4 = document.createElement("h4");
    titleH4.className = "trending-row-title";
    if (safeUrl) {
        const link = document.createElement("a");
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = article.title || "Untitled";
        titleH4.appendChild(link);
    } else {
        titleH4.textContent = article.title || "Untitled";
    }

    body.append(meta, titleH4);
    card.appendChild(body);

    return card;
}

function renderFocusTopicsWidget() {
    if (!widgetTopicsList) return;
    widgetTopicsList.replaceChildren();

    const topics = (Array.isArray(userPreferences) && userPreferences.length === 4)
        ? userPreferences
        : (currentBriefingData ? Object.keys(currentBriefingData).slice(0, 4) : []);

    topics.forEach((topic) => {
        const count = (currentBriefingData && Array.isArray(currentBriefingData[topic]))
            ? currentBriefingData[topic].length
            : 3;

        const row = document.createElement("div");
        row.className = "widget-topic-row";
        row.tabIndex = 0;
        row.role = "button";
        row.title = `Filter briefing to ${topic}`;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = topic;

        const countBadge = document.createElement("span");
        countBadge.className = "widget-topic-count";
        countBadge.textContent = `${count} reports`;

        row.append(nameSpan, countBadge);

        row.addEventListener("click", () => {
            if (briefingTabs) {
                const tab = briefingTabs.querySelector(`[data-category="${CSS.escape(topic)}"]`);
                if (tab) selectCategoryTab(topic, tab);
            }
        });

        row.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (briefingTabs) {
                    const tab = briefingTabs.querySelector(`[data-category="${CSS.escape(topic)}"]`);
                    if (tab) selectCategoryTab(topic, tab);
                }
            }
        });

        widgetTopicsList.appendChild(row);
    });
}

// ---------- 14. Daily Briefing Renderer ----------
function renderBriefingContent() {
    if (!currentBriefingData || !resultsList) return;

    // Restore hero showcase and trending section if previously hidden by search
    if (heroShowcase) heroShowcase.hidden = false;
    if (trendingSection) trendingSection.hidden = false;

    // Extract ordered articles across topics for hero and trending
    const allOrdered = extractOrderedBriefingArticles(currentBriefingData);

    // Populate Top Bar Ticker with headlines
    updateTickerText(allOrdered);

    // Populate Hero Showcase (Lead banner + 2 floating cards)
    renderHeroShowcase(allOrdered);

    // Populate Trending Section (Lead card + 3 compact cards + Focus topics widget)
    renderTrendingSection(allOrdered);

    resultsList.replaceChildren();

    if (activeCategory === "all") {
        resultsTitle.textContent = "Featured Intelligence Feed";

        let totalCount = 0;
        for (const [category, articles] of Object.entries(currentBriefingData)) {
            if (!Array.isArray(articles) || articles.length === 0) continue;
            totalCount += articles.length;

            const categorySection = document.createElement("section");
            categorySection.className = "briefing-category";

            const categoryHeader = document.createElement("div");
            categoryHeader.className = "category-header";
            categoryHeader.innerHTML = `
                <span class="category-header-dot"></span>
                <h3>${category}</h3>
                <span class="category-header-count">${articles.length} sources</span>
            `;
            categorySection.appendChild(categoryHeader);

            const grid = document.createElement("div");
            grid.className = "briefing-grid";

            articles.forEach((article, index) => {
                grid.appendChild(createArticleCard(article, category, index));
            });

            categorySection.appendChild(grid);
            resultsList.appendChild(categorySection);
        }

        resultsCount.textContent = `${totalCount} reports`;
        statusMessage.className = "status-message";
        statusMessage.textContent = "Latest verified research matching your focus domains.";

    } else {
        const articles = currentBriefingData[activeCategory] || [];
        resultsTitle.textContent = `${activeCategory} Intelligence`;
        resultsCount.textContent = `${articles.length} sources`;

        if (articles.length === 0) {
            statusMessage.className = "status-message";
            statusMessage.textContent = `No reports currently available in ${activeCategory}.`;
            return;
        }

        statusMessage.className = "status-message";
        statusMessage.textContent = `Displaying curated sources in ${activeCategory}.`;

        const grid = document.createElement("div");
        grid.className = "briefing-grid";

        articles.forEach((article, index) => {
            grid.appendChild(createArticleCard(article, activeCategory, index));
        });

        resultsList.appendChild(grid);
    }
}

async function loadDailyBriefing(topics = null) {
    if (!resultsTitle || !refreshButton) return;

    // Resolve active topics: prefer passed topics, else userPreferences, else null
    const activeTopics = (Array.isArray(topics) && topics.length === 4)
        ? topics
        : ((Array.isArray(userPreferences) && userPreferences.length === 4) ? userPreferences : null);

    resultsTitle.textContent = "Today's Research Briefing";
    resultsCount.textContent = "";

    statusMessage.className = "status-message";
    statusMessage.textContent = "Fetching verified research intelligence...";

    refreshButton.disabled = true;
    refreshButton.classList.add("loading");

    renderSkeletons(6, true);

    try {
        const url = new URL("/daily-briefing", API_URL);
        if (Array.isArray(activeTopics) && activeTopics.length === 4) {
            activeTopics.forEach((t) => url.searchParams.append("topics", t));
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Unable to load briefing (Status ${response.status}).`);
        }

        const data = await response.json();
        currentBriefingData = data.categories || {};

        renderBriefingContent();
        fetchStats();

    } catch (error) {
        console.error("Daily briefing error:", error);
        resultsList.replaceChildren();

        statusMessage.className = "status-message error";
        statusMessage.textContent = error.message.includes("Failed to fetch")
            ? "Could not connect to the backend server. Please verify FastAPI is running."
            : error.message;

        resultsTitle.textContent = "Briefing unavailable";
        resultsCount.textContent = "";

    } finally {
        refreshButton.disabled = false;
        refreshButton.classList.remove("loading");
    }
}

// ---------- 15. Search Form Controller (GET /search) ----------
if (searchForm) {
    searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();
        const count = Number(resultCount.value) || 3;

        if (!query) {
            statusMessage.className = "status-message error";
            statusMessage.textContent = "Please enter a topic to research.";
            return;
        }

        // Hide magazine hero and trending showcase during search mode so results are prominent
        if (heroShowcase) heroShowcase.hidden = true;
        if (trendingSection) trendingSection.hidden = true;

        // Deactivate briefing tabs
        if (briefingTabs) {
            briefingTabs.querySelectorAll(".tab-item").forEach((b) => b.classList.remove("active"));
        }

        searchButton.disabled = true;
        searchButton.innerHTML = `<span>Searching...</span>`;

        resultsTitle.textContent = `Results for "${query}"`;
        resultsCount.textContent = "";

        statusMessage.className = "status-message";
        statusMessage.textContent = "Searching verified research sources via Octen...";

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
            statusMessage.textContent = `Displaying ${data.results.length} verified sources retrieved via Octen.`;

            const grid = document.createElement("div");
            grid.className = "search-results-grid";

            data.results.forEach((result, index) => {
                grid.appendChild(createArticleCard(result, "Search Result", index));
            });

            resultsList.appendChild(grid);
            fetchStats();

        } catch (error) {
            console.error("Research search error:", error);
            resultsList.replaceChildren();

            resultsTitle.textContent = "Search unsuccessful";
            resultsCount.textContent = "";

            statusMessage.className = "status-message error";
            statusMessage.textContent = error.message.includes("Failed to fetch")
                ? "Could not connect to backend server."
                : error.message;

        } finally {
            searchButton.disabled = false;
            searchButton.innerHTML = `<span>Search</span> <span class="btn-arrow" aria-hidden="true">↗</span>`;
        }
    });
}

if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        if (heroShowcase) heroShowcase.hidden = false;
        if (trendingSection) trendingSection.hidden = false;
        loadDailyBriefing(userPreferences);
    });
}

// Focus topics widget edit button click
if (widgetEditTopicsBtn) {
    widgetEditTopicsBtn.addEventListener("click", openEditPreferencesModal);
}

// Mobile Navigation Drawer Controller
function toggleMobileDrawer() {
    if (!mobileNavDrawer || !mobileMenuBtn) return;
    const isHidden = mobileNavDrawer.hidden;
    mobileNavDrawer.hidden = !isHidden;
    mobileMenuBtn.classList.toggle("open", isHidden);
    mobileMenuBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
}

function closeMobileDrawer() {
    if (!mobileNavDrawer || !mobileMenuBtn) return;
    mobileNavDrawer.hidden = true;
    mobileMenuBtn.classList.remove("open");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMobileDrawer();
    });
}

document.addEventListener("click", (e) => {
    if (mobileNavDrawer && !mobileNavDrawer.hidden) {
        if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileDrawer();
        }
    }
});

if (mobileEditTopicsBtn) {
    mobileEditTopicsBtn.addEventListener("click", () => {
        closeMobileDrawer();
        openEditPreferencesModal();
    });
}

// Synchronized Channel Navigation (Desktop + Mobile)
function setActiveNavChannel(targetHref) {
    const desktopLinks = document.querySelectorAll(".nav-channel-link");
    const mobileLinks = document.querySelectorAll(".mobile-channel-link");

    desktopLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === targetHref);
    });
    mobileLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === targetHref);
    });
}

const navChannelLinks = document.querySelectorAll(".nav-channel-link");
navChannelLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const targetHref = link.getAttribute("href");
        setActiveNavChannel(targetHref);
        if (heroShowcase) heroShowcase.hidden = false;
        if (trendingSection) trendingSection.hidden = false;
    });
});

const mobileChannelLinks = document.querySelectorAll(".mobile-channel-link");
mobileChannelLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const targetHref = link.getAttribute("href");
        setActiveNavChannel(targetHref);
        closeMobileDrawer();
        if (heroShowcase) heroShowcase.hidden = false;
        if (trendingSection) trendingSection.hidden = false;
    });
});

// Keyboard shortcuts for search
if (searchKbd) {
    const isMac = (navigator.platform || "").toUpperCase().includes("MAC") ||
        (navigator.userAgent || "").toUpperCase().includes("MAC");
    searchKbd.textContent = isMac ? "⌘K" : "Ctrl+K";
}

window.addEventListener("keydown", (event) => {
    const isSearchShortcut =
        (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");

    if (isSearchShortcut && searchInput && !dashboardView.hidden) {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    }

    if (event.key === "Escape") {
        if (telemetryPopover && !telemetryPopover.hidden) closeTelemetryPopover();
        if (editPreferencesModal && !editPreferencesModal.hidden) closeEditPreferencesModal();
    }
});

// ---------- 16. Initial Boot Sequence ----------
let isAuthResolving = false;

async function initApp() {
    updateTopBarDate();
    setupAuthTabs();

    if (!isPlaceholderSupabase && supabaseClient) {
        // Listen for live auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log(`[ResearchMate Auth] State change event: ${event}`);

            if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
                if (session && session.user) {
                    isAuthResolving = true;
                    await checkUserPreferencesAndRoute(session.user);
                    isAuthResolving = false;
                }
            } else if (event === "SIGNED_OUT") {
                currentUser = null;
                userPreferences = [];
                isAuthResolving = false;
                showView("auth");
            } else if (event === "INITIAL_SESSION") {
                if (session && session.user) {
                    isAuthResolving = true;
                    await checkUserPreferencesAndRoute(session.user);
                    isAuthResolving = false;
                } else {
                    showView("auth");
                }
            }
        });

        // Check active session on startup in case onAuthStateChange does not fire INITIAL_SESSION
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) {
                console.error("[ResearchMate Auth] getSession error:", error);
            }
            if (!isAuthResolving) {
                if (data && data.session && data.session.user) {
                    isAuthResolving = true;
                    await checkUserPreferencesAndRoute(data.session.user);
                    isAuthResolving = false;
                } else {
                    showView("auth");
                }
            }
        } catch (e) {
            console.error("[ResearchMate Auth] Session check exception:", e);
            if (!isAuthResolving) {
                showView("auth");
            }
        }
    } else {
        console.warn("[ResearchMate Auth] Real Supabase client not initialized or placeholder credentials in use.");
        showView("auth");
    }
}

// Run boot sequence
initApp();
