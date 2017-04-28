export default class Metrics {
  constructor(host, debug = false) {
    this.host = host;
    this.debug = debug;

    if (this.host[host.length - 1] === '/') {
      // URL ending with '/'
      this.host = host.slice(0, -1);
    }
  }

  track(type, value, tagsObj) {
    const tags = Object
      .keys(tagsObj)
      .map(tag => `${tag}:${tagsObj[tag]}`)
      .join(',');

    const url = `${this.host}/t.gif?type=${type}&value=${value}&tags=${tags}`;
    this.log(url);
    const img = new Image();
    img.src = url;
    document.body.appendChild(img);
  }

  trackLoad() {
    if (window.performance && window.performance.timing) {
      // Not complete
      if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
          // Load listeners have to finish for loadEventEnd to have value
          setTimeout(this.trackLoad.bind(this));
        });
      } else if (!window.performance.timing.loadEventEnd) {
        // This might happen on load event
        setTimeout(this.trackLoad.bind(this));
      } else {
        // We're good to go
        const start = window.performance.timing.fetchStart;
        const end = window.performance.timing.loadEventEnd;
        const value = end - start;
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
        const url = encodeURIComponent(window.location.pathname);
        this.track('browser.performance', value, { isMobile, url });
      }
    }
  }

  log(...args) {
    if (this.debug) {
      console.log('METRICS', args); //eslint-disable-line no-console
    }
  }
}
