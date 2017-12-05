import Metrics from './metrics';
import { delegate, ready } from 'domassist';

function getData(element, options = {}) {
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

export default function autoTrack(url, options = {}) {
  url = url || window.metricsEndpoint || null;

  if (!url) {
    return;
  }

  const mm = new Metrics(url);

  delegate(document.body, 'click', '[data-mm-track]', e => {
    const element = e.target;
    const data = getData(e.target, options);
    const target = e.target.getAttribute('target');

    mm.track(data.type, data.value, data.tags, data.data);

    if (element.dataset.mmTrackHref === 'false') {
      event.preventDefault();
    } else if (data.href && !event.metaKey && event.which === 1 && target !== '_blank') {
      event.preventDefault();
      setTimeout(() => { window.location = data.href; }, options.timeout);
    }
  });
}

ready(autoTrack());
