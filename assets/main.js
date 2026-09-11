// BiliNote Official Website Client Script
// High-reliability progressive enhancement + Accordion interactions

(function () {
  'use strict';

  // 1. Accordion / FAQ Interaction
  const accItems = document.querySelectorAll('.acc-item');
  accItems.forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    const content = item.querySelector('.acc-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items for clean single-focus accordion
      accItems.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherContent = other.querySelector('.acc-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = null;
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // 2. Fetch Latest Release Info (Progressive Enhancement)
  const API_LATEST = 'https://api.github.com/repos/JX-Kenshin/bilinote-site/releases/latest';

  const heroBadgeTag = document.getElementById('hero-badge-tag');
  const btnVersion = document.getElementById('btn-version');
  const releaseTagDisplay = document.getElementById('release-tag-display');
  const releaseDateDisplay = document.getElementById('release-date-display');
  const releaseNotesBody = document.getElementById('release-notes-body');

  async function syncLatestRelease() {
    try {
      const res = await fetch(API_LATEST, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (!res.ok) {
        // Silent degrade; HTML already has reliable static fallbacks
        return;
      }

      const data = await res.json();
      const tagName = data.tag_name || 'v2.5.5';

      // Format publish date
      let dateStr = '稳定发行版';
      if (data.published_at) {
        const d = new Date(data.published_at);
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 发布`;
      }

      // Update badge
      if (heroBadgeTag) {
        heroBadgeTag.textContent = `${tagName} 最新版已发布`;
      }

      // Update CTA Subtitle
      if (btnVersion) {
        btnVersion.textContent = `${tagName} · 64-bit 独立安装包`;
      }

      // Update Release card header
      if (releaseTagDisplay) {
        releaseTagDisplay.textContent = tagName;
      }
      if (releaseDateDisplay) {
        releaseDateDisplay.textContent = dateStr;
      }

      // Render release notes markdown if present and valid
      if (data.body && releaseNotesBody) {
        const rendered = parseSimpleMarkdown(data.body);
        if (rendered.trim()) {
          releaseNotesBody.innerHTML = rendered;
        }
      }
    } catch {
      // Offline or rate-limited; fallback static text is already pristine
    }
  }

  function parseSimpleMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h3>$1</h3>')
      .replace(/^# (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>')
      .replace(/\n\n+/g, '<br>');
  }

  // Execute sync
  syncLatestRelease();
})();
