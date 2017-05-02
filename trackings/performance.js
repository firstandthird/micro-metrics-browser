export default function performance(metrics) {
  if (window.performance && window.performance.timing) {
    // Not complete
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        // Load listeners have to finish for loadEventEnd to have value
        setTimeout(() => { performance(metrics); });
      });
    } else if (!window.performance.timing.loadEventEnd) {
      // This might happen on load event
      setTimeout(() => { performance(metrics); });
    } else {
      // We're good to go
      const start = window.performance.timing.fetchStart;
      const end = window.performance.timing.loadEventEnd;
      const value = end - start;
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
      const url = encodeURIComponent(window.location.pathname);
      metrics.track('browser.performance', value, { isMobile, url });
    }
  }
}
