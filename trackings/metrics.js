import { on, find, ready } from 'domassist';

export default class Metrics {
  constructor(host, debug = false) {
    this.host = host;
    this.debug = debug || (typeof window.localStorage === 'object' && !!window.localStorage.getItem('MetricsDebug'));
    this.tracked = [];

    if (this.host[host.length - 1] === '/') {
      // URL ending with '/'
      this.host = host.slice(0, -1);
    }

    ready(this.autotrack.bind(this));
  }

  track(type, value, tagsObj = {}, dataObj = {}) {
    const values = [`type=${type}`, `value=${value}`];
    const tags = Metrics.serializeObject(tagsObj);
    const data = Metrics.serializeObject(dataObj);

    if (tags) {
      values.push(`tags=${tags}`);
    }

    if (data) {
      values.push(`data=${data}`);
    }

    const url = `${this.host}/t.gif?${values.join('&')}`;

    this.log(url);
    this.tracked.push(url);
    const img = new Image();
    img.src = url;
  }

  conversion(name, event, option, session, dataObj = {}) {
    const values = [`name=${name}`, `event=${event}`, `option=${option}`, `session=${session}`];
    const data = Metrics.serializeObject(dataObj);
    if (data) {
      values.push(`data=${data}`);
    }
    const url = `${this.host}/c.gif?${values.join('&')}`;
    this.log(url);
    this.tracked.push(url);
    const img = new Image();
    img.src = url;
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

    this.log('tracking', element, options);
    on(element, 'click', event => {
      this.onTrackedClick(element, event, options);
    });
  }

  onTrackedClick(element, event, options) {
    const data = this.getData(element, options);
    const target = element.getAttribute('target');

    this.track(data.type, data.value, data.tags, data.data);

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

  log(...args) {
    if (this.debug) {
      console.log('METRICS', args); //eslint-disable-line no-console
    }
  }

  static serializeObject(obj) {
    return Object
      .keys(obj)
      .map(key => `${key}:${obj[key]}`)
      .join(',');
  }
}
