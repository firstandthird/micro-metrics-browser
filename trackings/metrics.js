export default class Metrics {
  constructor(host, debug = false) {
    this.host = host;
    this.debug = debug;
    this.tracked = [];

    if (this.host[host.length - 1] === '/') {
      // URL ending with '/'
      this.host = host.slice(0, -1);
    }
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
