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

  log(...args) {
    if (this.debug) {
      console.log('METRICS', args); //eslint-disable-line no-console
    }
  }
}
