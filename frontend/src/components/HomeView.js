import React from 'react';
import '../home.css';

function IconBadge({ children }) {
  return (
    <div className="icon-badge" aria-hidden="true">{children}</div>
  );
}

function HomeView() {
  return (
    <div className="home-viewport">
      <section className="home-hero" data-aos="fade-up" data-aos-duration="1200">
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <h2 className="home-title">A calmer way to understand your mind</h2>
            <p className="home-subtitle">SoulSCRIBE is your AI companion for reflection, journaling, and emotional wellbeing. Chat naturally, track moods, and see gentle insights that help you grow.</p>
            <div className="home-cta-row">
              <a href="#features" className="nav-button px-4 py-2 rounded-md">Explore Features</a>
              <a href="#themes" className="c-button c-button--gooey">
                Themes & Personalization
                <span className="c-button__blobs"><div /><div /><div /></span>
              </a>
            </div>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="hero-orbit">
              <svg viewBox="0 0 140 140" className="hero-planet"><circle cx="70" cy="70" r="34" /></svg>
              <svg viewBox="0 0 140 140" className="hero-ring"><circle cx="70" cy="70" r="56" /></svg>
              <svg viewBox="0 0 140 140" className="hero-dots"><circle cx="18" cy="18" r="3"/><circle cx="122" cy="28" r="2"/><circle cx="34" cy="120" r="2"/></svg>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="home-section" data-aos="fade-up" data-aos-duration="1000">
        <h3 className="section-title">What it does</h3>
        <div className="home-grid">
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M3 5a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/></svg>
            </IconBadge>
            <h4 className="feature-title">Guided AI conversations</h4>
            <p className="feature-text">Talk freely. Your assistant listens, reflects, and offers supportive prompts grounded in CBT-inspired techniques.</p>
          </div>
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 1 8-8v2h2A10 10 0 1 0 12 22v-2z"/></svg>
            </IconBadge>
            <h4 className="feature-title">Mood tracking</h4>
            <p className="feature-text">Log how you feel in the moment. Over time, spot patterns and micro-trends that help you take action.</p>
          </div>
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg>
            </IconBadge>
            <h4 className="feature-title">Gentle insights</h4>
            <p className="feature-text">Simple visuals and summaries—no overwhelming charts. Just enough clarity to guide your next step.</p>
          </div>
        </div>
      </section>

      <section id="why" className="home-section" data-aos="fade-up" data-aos-duration="1000">
        <h3 className="section-title">Why it helps</h3>
        <div className="home-grid">
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10h-4a6 6 0 1 1-6-6V2z"/></svg>
            </IconBadge>
            <h4 className="feature-title">Build awareness</h4>
            <p className="feature-text">Small daily reflections compound into meaningful self-knowledge and emotional literacy.</p>
          </div>
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.5L12 17l-5.5 3.7 1-6.5L3 9.9 9 9z"/></svg>
            </IconBadge>
            <h4 className="feature-title">Reduce friction</h4>
            <p className="feature-text">Minimal UI, fast responses, and calm visuals make reflection feel easy—not like homework.</p>
          </div>
          <div className="feature-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M4 12h16M4 6h16M4 18h10"/></svg>
            </IconBadge>
            <h4 className="feature-title">Stay consistent</h4>
            <p className="feature-text">Lightweight streaks and reminders keep you engaged without pressure or guilt.</p>
          </div>
        </div>
      </section>

      <section id="themes" className="home-section" data-aos="fade-up" data-aos-duration="1000">
        <h3 className="section-title">Adaptive themes</h3>
        <p className="section-lead">Your interface adapts to how you feel. Soothing palettes for calm, grounding tones for anxious moments, and muted gradients for low days.</p>
        <div className="themes-row">
          <div className="theme-chip theme-bright-chip"><span />Happy & Energized</div>
          <div className="theme-chip theme-calm-chip"><span />Calm & Neutral</div>
          <div className="theme-chip theme-muted-chip"><span />Sad & Tired</div>
          <div className="theme-chip theme-angry-chip"><span />Angry & Frustrated</div>
        </div>
      </section>

      <section id="how" className="home-section" data-aos="fade-up" data-aos-duration="1000">
        <h3 className="section-title">How it works</h3>
        <div className="steps-grid">
          <div className="step-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/></svg>
            </IconBadge>
            <h4 className="feature-title">1. Check in</h4>
            <p className="feature-text">Choose your mood or start chatting. No pressure—just meet yourself where you are.</p>
          </div>
          <div className="step-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg>
            </IconBadge>
            <h4 className="feature-title">2. Reflect</h4>
            <p className="feature-text">Get supportive prompts and gentle reframes that help you unpack your thoughts.</p>
          </div>
          <div className="step-card">
            <IconBadge>
              <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 1-6.36 15.36"/></svg>
            </IconBadge>
            <h4 className="feature-title">3. Notice patterns</h4>
            <p className="feature-text">See simple trends over time and learn what supports you best.</p>
          </div>
        </div>
      </section>

      <section id="privacy" className="home-section" data-aos="fade-up" data-aos-duration="1000">
        <div className="privacy-card">
          <IconBadge>
            <svg viewBox="0 0 24 24"><path d="M12 1l8 4v6c0 5-3.5 9.74-8 11-4.5-1.26-8-6-8-11V5z"/></svg>
          </IconBadge>
          <div>
            <h4 className="feature-title">Privacy by design</h4>
            <p className="feature-text">Your reflections belong to you. We use secure practices and clear controls so you decide what stays, what’s saved, and what’s deleted.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeView;
