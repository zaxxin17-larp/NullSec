"use strict";

const fs = require("fs");
const { EventEmitter } = require("events");

try {
  fs.appendFileSync(
    "/data/data/com.termux/files/usr/tmp/opencode/preload-loaded.log",
    "loaded pid=" + process.pid + "\n",
  );
} catch {}

const originalWatch = fs.watch;
const NODE_MODULES = /(^|[\\/])node_modules([\\/]|$)/;

fs.watch = function (filename, options, listener) {
  if (typeof filename === "string" && NODE_MODULES.test(filename)) {
    const emitter = new EventEmitter();
    emitter.close = () => process.nextTick(() => emitter.emit("close"));
    emitter.unref = () => emitter;
    return emitter;
  }
  return originalWatch.apply(this, arguments);
};
