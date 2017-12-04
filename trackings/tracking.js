import Metrics from './metrics';
import { on, find, ready } from 'domassist';

export default class Tracking {
  constructor(url = window.metricsEndpoint, element, options = {}) {
    if (url) {
      this.metrics = new Metrics(url);
      if (element) {
        this.trackElements(element, options);
      }
      ready(this.autotrack.bind(this));
    } else {
      return;
    }
  }

  getData(element, options = {}) {
    const dataset = element.dataset;
    const href = dataset.mmTrackHref || element.getAttribute('href');
    const value = dataset.mmTrackValue || options.value;
    const type = dataset.mmTrackType || options.type;
    const tags = options.tags || {};
    const data = options.data || {};

    Object.keys(dataset).forEach(key => {
      if (key.includes('mmTrackTag')) {
        tags[key.replace('mmTrackTag', '').toLowerCase()] = dataset[key];
      } else if (key.includes('mmTrackData')) {
        data[key.replace('mmTrackData', '').toLowerCase()] = dataset[key];
      }
    });

    return { type, value, tags, data, href };
  }

  trackElements(element, options = {}) {
    if (Array.isArray(element)) {
      element.forEach(data => {
        find(data.element).forEach(el => {
          this.trackElements(el, data);
        });
      });

      return;
    }

    this.metrics.log('tracking', element, options);
    on(element, 'click', event => {
      this.onTrackedClick(element, event, options);
    });
  }

  onTrackedClick(element, event, options) {
    const data = this.getData(element, options);
    const target = element.getAttribute('target');

    this.metrics.track(data.type, data.value, data.tags, data.data);

    if (element.dataset.mmTrackHref === 'false') {
      event.preventDefault();
    } else if (data.href && !event.metaKey && event.which === 1 && target !== '_blank') {
      event.preventDefault();
      setTimeout(() => { window.location = data.href; }, options.delay);
    }
  }

  autotrack() {
    const elements = find('[data-mm-track]');
    elements.forEach(element => this.trackElements(element));
  }
}
