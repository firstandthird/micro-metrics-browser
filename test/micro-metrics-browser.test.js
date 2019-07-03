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
  }, {
    key1: 'value1',
    key2: 'value2'
  });
  const img = mm.tracked[0];

  assert.equal(img, 'https://localhost/t.gif?type=foo&value=100&tags=bar:baz,test:works&data=key1:value1,key2:value2', 'data should be correct');
  assert.end();
});

test('image can be formed by empty data or empty tags', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  mm.track('foo', 100, {}, {
    key1: 'value1',
    key2: 'value2'
  });
  mm.track('foo', 100);
  mm.track('foo', 100, {
    bar: 'baz',
    test: 'works'
  });

  const img1 = mm.tracked[0];
  const img2 = mm.tracked[1];
  const img3 = mm.tracked[2];

  assert.equal(img1, 'https://localhost/t.gif?type=foo&value=100&data=key1:value1,key2:value2', 'data should be correct');
  assert.equal(img2, 'https://localhost/t.gif?type=foo&value=100', 'data should be correct');
  assert.equal(img3, 'https://localhost/t.gif?type=foo&value=100&tags=bar:baz,test:works', 'data should be correct');
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

test('conversion', assert => {
  const mm = new microMetrics.Metrics('https://localhost/');
  mm.conversion('test1', 'impression', 'a', '123', {
    test: 'works'
  });
  const img = mm.tracked[0];

  assert.equal(img, 'https://localhost/c.gif?name=test1&event=impression&option=a&session=123&data=test:works', 'data should be correct');
  assert.end();
});

test('defined endpoint in window, no host provided', assert => {
  window.metricsEndpoint = 'https://localhost/';

  const mm = new microMetrics.Metrics();

  mm.track('foo', 100, {}, {
    key1: 'value1',
    key2: 'value2'
  });

  const tracked = mm.tracked[0];

  assert.equal(tracked, 'https://localhost/t.gif?type=foo&value=100&data=key1:value1,key2:value2', 'data should be correct');
  assert.end();
});
