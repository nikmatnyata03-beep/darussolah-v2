const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sliderCSS = `
    /* Slider Styles */
    .slider-section {
      background: var(--sand);
      padding: 80px 0;
      border-radius: 32px;
      margin-bottom: 80px;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
      padding: 0 5%;
    }
    .slider-nav {
      display: flex;
      gap: 12px;
    }
    .slider-btn {
      background: var(--paper);
      border: 1px solid var(--line);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--pine);
      transition: all 0.2s ease;
    }
    .slider-btn:hover, .slider-btn:focus-visible {
      background: var(--pine);
      color: var(--paper);
      border-color: var(--pine);
      outline: none;
    }
    .slider-track {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 0 5% 32px;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
      scroll-behavior: smooth;
    }
    .slider-track::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }
    .slider-item {
      flex: 0 0 calc(100% - 24px);
      scroll-snap-align: center;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 32px;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 640px) {
      .slider-item {
        flex: 0 0 calc(50% - 24px);
      }
    }
    @media (min-width: 900px) {
      .slider-item {
        flex: 0 0 420px;
        scroll-snap-align: start;
      }
      .slider-header {
        padding: 0;
      }
      .slider-track {
        padding: 0 0 32px 0;
      }
      .slider-section.container-bleed {
        background: transparent;
        padding: 0;
      }
      .slider-section.container-bleed .slider-track {
        padding-bottom: 24px;
      }
    }
    /* Testimonial Specific */
    .testi-quote {
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--pine-deep);
      margin-bottom: 24px;
      flex-grow: 1;
    }
    .testi-quote::before {
      content: '"';
      color: var(--gold);
      font-family: 'DM Serif Display', serif;
      font-size: 2.5rem;
      line-height: 0.5;
      margin-right: 8px;
      vertical-align: -0.2em;
    }
    .testi-author {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: auto;
    }
    .testi-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--pine-light);
      color: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.25rem;
      flex-shrink: 0;
      object-fit: cover;
    }
    .testi-author-info strong {
      display: block;
      color: var(--pine-deep);
      margin-bottom: 2px;
      font-size: 1.05rem;
    }
    .testi-author-info span {
      display: block;
      font-size: 0.85rem;
      color: var(--muted);
    }
    /* Bio Specific */
    .bio-item {
      padding: 32px;
    }
    .bio-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }
    .bio-image {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--line);
      border: 2px solid var(--sand);
    }
    .bio-info strong {
      display: block;
      color: var(--pine-deep);
      font-size: 1.2rem;
      line-height: 1.2;
    }
    .bio-info span {
      display: inline-block;
      font-size: 0.8rem;
      color: var(--pine);
      background: var(--sand);
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 500;
      margin-top: 8px;
    }
    .bio-text {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }
`;

if (!html.includes('/* Slider Styles */')) {
  html = html.replace('  </style>', sliderCSS + '\n  </style>');
  fs.writeFileSync('index.html', html);
}
