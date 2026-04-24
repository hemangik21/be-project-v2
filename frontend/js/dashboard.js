/**
 * Dashboard Logic - Person B (Performance Tracking)
 */

/**
 * Load dashboard for candidate
 */
async function loadDashboard() {
    const candidateId = document.getElementById('dashboard-candidate-id').value.trim();
    if (!candidateId) {
        showToast('Please enter a Candidate ID', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // Fetch candidate data
        const [candidate, summary, recommendations] = await Promise.all([
            api.getCandidate(candidateId),
            api.getPerformanceSummary(candidateId),
            api.getRecommendations(candidateId)
        ]);
        
        // Display all sections
        console.log("STEP 1: stats");
        displayStats(summary);
        console.log("STEP 2: profile");
        displayProfileInfo(candidate.profile, candidate.resume);
       console.log("STEP 3: history");
        try {
            displayPerformanceHistory(summary.history);
        } catch (e) {
            console.error("❌ History crashed:", e);
        }

        console.log("STEP 4: recommendations");
        try {
            displayRecommendations(recommendations);
        } catch (e) {
            console.error("❌ Recommendations crashed:", e);
        }
                
        // Show dashboard content
        document.getElementById('dashboard-content').style.display = 'block';
        
        showLoading(false);
        showToast('Dashboard loaded successfully!', 'success');
        
    } catch (error) {
        showLoading(false);
        showToast('Error loading dashboard: ' + error.message, 'error');
    }
}

/**
 * Display statistics overview
 */

function formatTrend(trend) {
    if (trend === 'improving') return '↑ Improving';
    if (trend === 'declining') return '↓ Declining';
    if (trend === 'stable') return '→ Stable';
    return 'Not enough data';
}

function displayStats(summary) {
    
    document.getElementById('total-interviews').textContent =
        summary.total_questions || 0;

    document.getElementById('avg-performance').textContent =
        ((summary.avg_total_score || 0) * 100).toFixed(0) + '%';

    document.getElementById('improvement-rate').textContent =
        formatTrend(summary.trend) || 'N/A';
    
    // Display trend


    // const trendElement = document.getElementById('stat-trend');
    // const trend = summary.trend || 'insufficient_data';
    
    // if (trend === 'improving') {
    //     trendElement.textContent = '↑ Improving';
    //     trendElement.style.color = '#10B981';
    // } else if (trend === 'declining') {
    //     trendElement.textContent = '↓ Declining';
    //     trendElement.style.color = '#EF4444';
    // } else if (trend === 'stable') {
    //     trendElement.textContent = '→ Stable';
    //     trendElement.style.color = '#F59E0B';
    // } else {
    //     trendElement.textContent = '-- N/A';
    //     trendElement.style.color = '#6B7280';
    // }
}

/**
 * Display profile information
 */
function displayProfileInfo(profile, resume) {

    const profileInfoDiv = document.getElementById('profile-info');
    
    const metadata = profile.metadata;
    
    profileInfoDiv.innerHTML = `
        <div class="info-item">
            <div class="info-label">Experience Level</div>
            <div class="info-value">${metadata.experience_level || 'N/A'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Primary Domain</div>
            <div class="info-value">${metadata.primary_domain || 'N/A'}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Total Skills</div>
            <div class="info-value">${resume?.skills?.length || 0}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Profile Version</div>
            <div class="info-value">v${profile.version || 1}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Created At</div>
            <div class="info-value">${formatDate(profile.created_at)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Last Updated</div>
            <div class="info-value">${formatDate(profile.updated_at)}</div>
        </div>
    `;
    
    // Display skills if available
    if (resume && resume.skills && resume.skills.length > 0) {
        const skillsHtml = `
            <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Skills</div>
                <div class="info-value" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                    ${resume.skills.map(skill => `
                        <span style="background: rgba(79, 70, 229, 0.1); 
                                     color: var(--primary-color); 
                                     padding: 0.25rem 0.75rem; 
                                     border-radius: 0.25rem; 
                                     font-size: 0.875rem;">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
        profileInfoDiv.innerHTML += skillsHtml;
    }
}

/**
 * Display performance history (mock - would come from API)
 */
function displayPerformanceHistory(history) {
    const historyDiv = document.getElementById('performance-history');

    if (!history || history.length === 0) {
        historyDiv.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                No interview history yet.
            </p>
        `;
        return;
    }

    historyDiv.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-header">
                <span><strong>${item.question_text || 'Question ' + (index + 1)}</strong></span>
                <span class="history-score">${(item.total_score * 100).toFixed(0)}%</span>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.875rem;">
                ${formatDate(item.timestamp)}
            </div>
        </div>
    `).join('');
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
    const recDiv = document.getElementById('recommendations-content');
    
    if (recommendations.error) {
        recDiv.innerHTML = `
            <p style="color: var(--danger-color);">${recommendations.error}</p>
        `;
        return;
    }
    
    const topics = recommendations.recommended_topics || {};
    const topTopics = Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    recDiv.innerHTML = `
        <div style="background: var(--bg-color); padding: 1.5rem; border-radius: 0.375rem; margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.5rem;">Profile Summary</h4>
            <p style="color: var(--text-secondary);">
                Experience Level: <strong>${recommendations.experience_level}</strong><br>
                Primary Domain: <strong>${recommendations.primary_domain}</strong><br>
                Total Matches: <strong>${recommendations.total_matches}</strong> questions<br>
                Average Similarity: <strong>${(recommendations.average_similarity * 100).toFixed(0)}%</strong>
            </p>
        </div>
        
        <div style="background: var(--bg-color); padding: 1.5rem; border-radius: 0.375rem;">
            <h4 style="margin-bottom: 1rem;">Recommended Focus Areas</h4>
            ${topTopics.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${topTopics.map(([topic, count]) => `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${topic}</span>
                            <span style="background: var(--primary-color); 
                                         color: white; 
                                         padding: 0.25rem 0.75rem; 
                                         border-radius: 0.25rem; 
                                         font-size: 0.875rem;">
                                ${count} questions
                            </span>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="color: var(--text-secondary);">No specific recommendations yet. Complete more interviews to get personalized suggestions.</p>
            `}
        </div>
    `;
}