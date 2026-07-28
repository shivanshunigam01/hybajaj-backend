/**
 * Run side-effects after the HTTP response is free to return.
 * Never await this from request handlers.
 */
function runInBackground(label, fn) {
  setImmediate(() => {
    Promise.resolve()
      .then(fn)
      .catch((err) => {
        console.error(`[bg:${label}]`, err?.message || err);
      });
  });
}

module.exports = { runInBackground };
