const noop = () => {};

// Silence non-critical runtime logs across edge functions.
console.log = noop;
console.info = noop;
console.debug = noop;
