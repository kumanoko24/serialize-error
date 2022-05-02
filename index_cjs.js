var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.js
var serialize_error_exports = {};
__export(serialize_error_exports, {
  NonError: () => NonError,
  deserializeError: () => deserializeError,
  errorConstructors: () => error_constructors_default,
  isErrorLike: () => isErrorLike,
  serializeError: () => serializeError
});
module.exports = __toCommonJS(serialize_error_exports);

// error-constructors.js
var list = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  globalThis.DOMException,
  globalThis.AssertionError,
  globalThis.SystemError
].filter(Boolean).map((constructor) => [constructor.name, constructor]);
var errorConstructors = new Map(list);
var error_constructors_default = errorConstructors;

// index.js
var NonError = class extends Error {
  name = "NonError";
  constructor(message) {
    super(NonError._prepareSuperMessage(message));
  }
  static _prepareSuperMessage(message) {
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
};
var commonProperties = [
  {
    property: "name",
    enumerable: false
  },
  {
    property: "message",
    enumerable: false
  },
  {
    property: "stack",
    enumerable: false
  },
  {
    property: "code",
    enumerable: true
  },
  {
    property: "cause",
    enumerable: false
  }
];
var toJsonWasCalled = Symbol(".toJSON was called");
var toJSON = (from) => {
  from[toJsonWasCalled] = true;
  const json = from.toJSON();
  delete from[toJsonWasCalled];
  return json;
};
var getErrorConstructor = (name) => error_constructors_default.get(name) ?? Error;
var destroyCircular = ({
  from,
  seen,
  to_,
  forceEnumerable,
  maxDepth,
  depth,
  useToJSON
}) => {
  const to = to_ ?? (Array.isArray(from) ? [] : {});
  seen.push(from);
  if (depth >= maxDepth) {
    return to;
  }
  if (useToJSON && typeof from.toJSON === "function" && from[toJsonWasCalled] !== true) {
    return toJSON(from);
  }
  const destroyLocal = (value) => {
    const Error2 = getErrorConstructor(value.name);
    return destroyCircular({
      from: value,
      seen: [...seen],
      to_: isErrorLike(value) ? new Error2() : void 0,
      forceEnumerable,
      maxDepth,
      depth,
      useToJSON
    });
  };
  for (const [key, value] of Object.entries(from)) {
    if (typeof Buffer === "function" && Buffer.isBuffer(value)) {
      to[key] = "[object Buffer]";
      continue;
    }
    if (value !== null && typeof value === "object" && typeof value.pipe === "function") {
      to[key] = "[object Stream]";
      continue;
    }
    if (typeof value === "function") {
      continue;
    }
    if (!value || typeof value !== "object") {
      to[key] = value;
      continue;
    }
    if (!seen.includes(from[key])) {
      depth++;
      to[key] = destroyLocal(from[key]);
      continue;
    }
    to[key] = "[Circular]";
  }
  for (const { property, enumerable } of commonProperties) {
    if (typeof from[property] !== "undefined" && from[property] !== null) {
      Object.defineProperty(to, property, {
        value: isErrorLike(from[property]) ? destroyLocal(from[property]) : from[property],
        enumerable: forceEnumerable ? true : enumerable,
        configurable: true,
        writable: true
      });
    }
  }
  return to;
};
function serializeError(value, options = {}) {
  const {
    maxDepth = Number.POSITIVE_INFINITY,
    useToJSON = true
  } = options;
  if (typeof value === "object" && value !== null) {
    return destroyCircular({
      from: value,
      seen: [],
      forceEnumerable: true,
      maxDepth,
      depth: 0,
      useToJSON
    });
  }
  if (typeof value === "function") {
    return `[Function: ${value.name ?? "anonymous"}]`;
  }
  return value;
}
function deserializeError(value, options = {}) {
  const { maxDepth = Number.POSITIVE_INFINITY } = options;
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const Error2 = getErrorConstructor(value.name);
    return destroyCircular({
      from: value,
      seen: [],
      to_: new Error2(),
      maxDepth,
      depth: 0
    });
  }
  return new NonError(value);
}
function isErrorLike(value) {
  return value && typeof value === "object" && "name" in value && "message" in value && "stack" in value;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NonError,
  deserializeError,
  errorConstructors,
  isErrorLike,
  serializeError
});
