import test from 'tape-rollup';
import * as microMetrics from '../micro-metrics-browser';

test('should normalise host', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  assert.equal(mm.host, 'https://localhost', 'last slash is removed');
  assert.end();
});

test('should not debug by default', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  assert.equal(mm.debug, false, 'debug is false');
  assert.end();
});

test('image should have correct parameters', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  mm.track('foo', 100, {
    bar: 'baz',
    test: 'works'
  });
  const img = mm.tracked[0];

  assert.equal(img, 'https://localhost/t.gif?type=foo&value=100&tags=bar:baz,test:works', 'data should be correct');
  assert.end();
});

test('performance tracking', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  microMetrics.performance(mm);

  const img = mm.tracked[0];
  assert.ok(img.indexOf('https://localhost/t.gif?type=browser.performance&value=') > -1, 'contains correct start');
  assert.ok(img.indexOf('isMobile:') > -1, 'contains correct isMobile tag');
  assert.ok(img.indexOf('url:') > -1, 'contains correct url tag');
  assert.end();
});
