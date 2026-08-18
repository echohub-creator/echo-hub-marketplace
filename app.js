// Echo Hub Marketplace - Production Frontend
// Supabase Configuration
const SUPABASE_URL = 'https://egrnqtvpptkvvnckjzfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncm5xdHZwcHRrdnZuY2tqemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTk0OTksImV4cCI6MjEwMjU3NTQ5OX0.kC6IoXl6wcV6v_qPNBfVi8t3OumYBGS0E3eWEy5yHjc';

// Initialize Supabase Client
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// PII DETECTION ENGINE (Blocks Personally Identifiable Information)
// ============================================

class PIIDetector {
    constructor() {
        // Regex patterns for PII detection
        this.patterns = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(?:\+?1[-\.\s]?)?\(?([0-9]{3})\)?[-\.\s]?([0-9]{3})[-\.\s]?([0-9]{4})\b/g,
            url: /(https?:\/\/[^\s]+|www\.[^\s]+|ftp:\/\/[^\s]+)/g,
            discord: /@[a-zA-Z0-9_]{2,32}#[0-9]{4}|discord\.gg\/[a-zA-Z0-9]+/g,
            socialHandle: /@[a-zA-Z0-9_]{2,}/g,
            ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
            creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
            ssn: /\b(?:\d{3}[-\s]?){2}\d{4}\b/g,
        };
    }

    detectPII(text) {
        if (!text || typeof text !== 'string') return [];
        const detectedPII = [];
        for (const [type, pattern] of Object.entries(this.patterns)) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                detectedPII.push({
                    type: type,
                    value: match[0],
                    position: match.index
                });
            }
        }
        return detectedPII;
    }

    hasPII(text) {
        return this.detectPII(text).length > 0;
    }

    getSummary(piiList) {
        const types = new Set(piiList.map(p => p.type));
        return Array.from(types).join(', ');
    }
}

const piiDetector = new PIIDetector();

// ============================================
// MESSAGE DISPLAY SYSTEM
// ============================================

function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.className = `message ${type}`;
    element.textContent = message;
    element.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// ============================================
// LISTING MANAGEMENT
// ============================================

async function fetchAndDisplayListings() {
    try {
        const listingsContainer = document.getElementById('listingsContainer');
        const loadingElement = document.getElementById('listingsLoading');
        loadingElement.style.display = 'block';
        listingsContainer.innerHTML = '';

        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listings:', error);
            showMessage('listingsMessage', `⚠️ Failed to load listings: ${error.message}`, 'error');
            loadingElement.style.display = 'none';
            return;
        }

        loadingElement.style.display = 'none';

        if (!data || data.length === 0) {
            listingsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No listings yet. Be the first to post!</p>';
            return;
        }

        listingsContainer.innerHTML = data.map(listing => `
            <div class="listing-card">
                <h3>${escapeHtml(listing.title)}</h3>
                <span class="category">${escapeHtml(listing.category)}</span>
                <p class="description">${escapeHtml(listing.description)}</p>
                <div class="price">$${parseFloat(listing.price).toFixed(2)}</div>
                <span class="status ${listing.status.toLowerCase()}">${escapeHtml(listing.status)}</span>
                <div class="timestamp">Posted: ${new Date(listing.created_at).toLocaleDateString()}</div>
            </div>
        `).join('');

        showMessage('listingsMessage', `✅ Loaded ${data.length} listing${data.length !== 1 ? 's' : ''}`, 'success');
    } catch (err) {
        console.error('Error in fetchAndDisplayListings:', err);
        showMessage('listingsMessage', '⚠️ An unexpected error occurred', 'error');
    }
}

// ============================================
// DISCORD WEBHOOK INTEGRATION
// ============================================

async function sendToDiscord(listing) {
    try {
        console.log('Listing submitted (Discord notification would be sent in Phase 3):', listing);
        return true;
    } catch (err) {
        console.error('Discord notification failed:', err);
        return false;
    }
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

document.getElementById('listingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const status = document.getElementById('status').value.trim();

    const fieldsToCheck = [
        { name: 'Title', value: title },
        { name: 'Description', value: description }
    ];

    let piiFound = false;
    let piiSummary = '';

    for (const field of fieldsToCheck) {
        if (piiDetector.hasPII(field.value)) {
            piiFound = true;
            const detectedPII = piiDetector.detectPII(field.value);
            piiSummary += `${field.name}: ${piiDetector.getSummary(detectedPII)}\n`;
        }
    }

    if (piiFound) {
        showMessage('formMessage',
            `🚫 BLOCKED: PII detected in submission!\n\nDetected: ${piiSummary}\n\nPlease remove all personal information (emails, phone numbers, URLs, Discord handles) and resubmit.`,
            'error');
        return;
    }

    if (!title || !category || !description || !price || !status) {
        showMessage('formMessage', '⚠️ Please fill in all required fields', 'warning');
        return;
    }

    if (price < 0) {
        showMessage('formMessage', '⚠️ Price must be a positive number', 'warning');
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    title: title,
                    category: category,
                    description: description,
                    price: price,
                    status: status,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            showMessage('formMessage', `❌ Submission failed: ${error.message}`, 'error');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }

        await sendToDiscord(data[0]);
        showMessage('formMessage', '✅ Listing submitted successfully! It will appear in the marketplace shortly.', 'success');
        document.getElementById('listingForm').reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        await fetchAndDisplayListings();

    } catch (err) {
        console.error('Error submitting listing:', err);
        showMessage('formMessage', '❌ An unexpected error occurred. Please try again.', 'error');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

async function initializeMarketplace() {
        console.log('Echo Hub Marketplace initializing...');
        console.log('Supabase URL:', SUPABASE_URL);

        // Load initial listings
        await fetchAndDisplayListings();

        // Set up real-time updates (optional - comment out if not needed)
        setupRealtimeListings();

        console.log('Echo Hub Marketplace ready!');
}

// Run initialization immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMarketplace);
} else {
        initializeMarketplace();
}

// ============================================
// REAL-TIME UPDATES (Supabase Realtime)
// ============================================

function setupRealtimeListings() {
    try {
        supabase
            .channel('listings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'listings'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchAndDisplayListings();
                }
            )
            .subscribe();
    } catch (err) {
        console.warn('Real-time updates not available:', err);
        setInterval(fetchAndDisplayListings, 30000);
    }
}

// ============================================
// HEALTH CHECK
// ============================================

async function healthCheck() {
    try {
        const { error } = await supabase
            .from('listings')
            .select('id')
            .limit(1);

        if (error) {
            console.warn('Health check failed:', error);
            return false;
        }
        console.log('✅ Supabase connection healthy');
        return true;
    } catch (err) {
        console.error('Health check error:', err);
        return false;
    }
}

// Run health check on load
window.addEventListener('load', healthCheck);

// Export for debugging
window.EchoHub = {
    piiDetector,
    fetchAndDisplayListings,
    healthCheck,
    supabase
};

console.log('Echo Hub Marketplace v1.0 - PII Protection Active');
