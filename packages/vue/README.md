# @straylightagency/cookies

A lightweight JavaScript utility to simplify working with browser cookies.

It provides a simple API to create, retrieve, check, and remove cookies, with automatic serialization and deserialization of JavaScript values. It also includes helper functions for accessing cookies through a Proxy or Vue.js composables.

## Features

- Native ES modules and no external dependencies.
- Simple API for creating, retrieving, and removing cookies.
- Automatic serialization and deserialization using JSON.
- Support for strings, numbers, booleans, objects, arrays, and `null`.
- Configurable expiration, path, domain, SameSite, and Secure attributes.
- Optional default values when retrieving cookies.
- Proxy-based accessors for Vanilla JavaScript applications.
- Dedicated Vue.js integration through `@straylightagency/cookies-vue`.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Cookie methods](#cookie-methods)
- [Supported data types](#supported-data-types)
- [Cookie options](#cookie-options)
- [Default values](#default-values)
- [Proxy-based access](#proxy-based-access)
- [Vue.js integration](#vuejs-integration)
- [API reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @straylightagency/cookies
```

## Quick start

Import the `cookies` instance and start managing cookies:

```js
import { cookies } from '@straylightagency/cookies';

// Create a cookie
cookies.set('user', { name: 'John', age: 30 });

// Retrieve a cookie
const user = cookies.get('user');

// Check if a cookie exists
if (cookies.has('user')) {
    console.log(user);
}

// Retrieve all cookies
const allCookies = cookies.all();

// Remove a cookie
cookies.remove('user');
```

## Cookie methods

The package exposes a single `cookies` instance with the following methods:

| Method | Parameters | Description |
|---|---|---|
| `get(key?, default_value?)` | Optional cookie name and fallback value. | Retrieves a cookie or all cookies. |
| `set(key, value, options?)` | Cookie name, value, and optional attributes. | Creates or updates a cookie. |
| `has(key)` | Cookie name. | Checks whether a cookie exists. |
| `remove(key, options?)` | Cookie name and optional attributes. | Removes a cookie. |
| `all()` | None. | Retrieves all cookies. |

### Retrieve a cookie

```js
const user = cookies.get('user');
```

You can provide a fallback value if the cookie does not exist:

```js
const theme = cookies.get('theme', 'light');
```

### Retrieve all cookies

```js
const allCookies = cookies.all();

console.log(allCookies.user);
console.log(allCookies.theme);
```

### Check if a cookie exists

```js
if (cookies.has('user')) {
    console.log('User cookie exists');
}
```

### Remove a cookie

```js
cookies.remove('user');
```

If the cookie was created with custom `path` or `domain` attributes, provide the same attributes when removing it:

```js
cookies.remove('user', {
    path: '/',
    domain: 'example.com',
});
```

## Supported data types

Cookie values are automatically serialized using `JSON.stringify()` and deserialized using `JSON.parse()`.

The following types are supported:

| Type | Example |
|---|---|
| String | `'Hello world'` |
| Number | `42` |
| Boolean | `true` |
| Null | `null` |
| Object | `{ name: 'John' }` |
| Array | `[1, 2, 3]` |

Values that cannot be serialized using JSON, such as functions and `undefined`, are not supported.

Dates are serialized as strings and are not automatically reconstructed as `Date` instances.

## Cookie options

You can pass an optional options object to `set()` to configure cookie attributes.

```js
cookies.set('token', 'my-token', {
    expires: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'strict',
    secure: true,
});
```

The following options are supported:

| Option | Type | Description |
|---|---|---|
| `expires` | `Date \| number` | Expiration date or duration in seconds. |
| `maxAge` | `number` | Cookie lifetime in seconds. |
| `path` | `string` | Path associated with the cookie. |
| `domain` | `string` | Domain associated with the cookie. |
| `sameSite` | `string` | SameSite policy: `strict`, `lax`, or `none`. |
| `secure` | `boolean` | Restricts the cookie to secure connections (HTTPS). |
| `partitioned` | `boolean` | Enables the Partitioned attribute. |

### Expiration

The `expires` option accepts either a JavaScript `Date` or a duration in seconds.

```js
// Expires in 7 days
cookies.set('token', 'my-token', {
    expires: 60 * 60 * 24 * 7,
});

// Expires at a specific date
cookies.set('token', 'my-token', {
    expires: new Date('2027-01-01'),
});
```

Alternatively, use `maxAge` to specify the cookie lifetime in seconds:

```js
cookies.set('token', 'my-token', {
    maxAge: 60 * 60,
});
```

When neither `expires` nor `maxAge` is specified, the cookie is treated as a session cookie.

### SameSite

The `sameSite` option controls when cookies are sent with cross-site requests.

Accepted values are:

- `strict`
- `lax`
- `none`

When using `sameSite: 'none'`, the `secure` option should also be enabled.

### Security

Cookies created through JavaScript cannot use the `HttpOnly` attribute. This attribute must be configured by the server through the `Set-Cookie` HTTP response header.

Cookies are accessible to JavaScript running on the same origin, so avoid storing sensitive information in them.

## Default values

The `get()` method accepts an optional fallback value:

```js
const theme = cookies.get('theme', 'light');
```

If the requested cookie does not exist, the provided fallback value is returned.

When no fallback value is provided, `undefined` is returned.

## Proxy-based access

For Vanilla JavaScript applications, the package provides a `useCookie()` helper.

It returns an array containing:

1. A read-only Proxy exposing the cookie value through its `.value` property.
2. A setter function.
3. A remove function.

```js
import { useCookie } from '@straylightagency/cookies';

const [token, setToken, removeToken] = useCookie('token');

// Read the current value
console.log(token.value);

// Update the cookie
setToken('my-token');

// Remove the cookie
removeToken();
```

### Default options

The `useCookie()` helper applies the following default options:

| Option | Default value |
|---|---|
| `expires` | 365 days |
| `path` | `/` |
| `sameSite` | `lax` |

You can override these options when updating or removing a cookie:

```js
setToken('my-token', {
    expires: 60 * 60,
    sameSite: 'strict',
});
```

The Proxy reads directly from the underlying cookie whenever `.value` is accessed. This means it always returns the latest stored value.

The Proxy is read-only. Use the provided setter function to update the cookie.

## Vue.js integration

For Vue.js applications, use the dedicated [`@straylightagency/cookies-vue`](https://www.npmjs.com/package/@straylightagency/cookies-vue) package.

It provides a composable that integrates the cookie API with Vue's reactivity system.

### Installation

```bash
npm install @straylightagency/cookies-vue
```

### useCookie()

```js
import { useCookie } from '@straylightagency/cookies-vue';

const [token, setToken, removeToken] = useCookie('token');

// Read the current value
console.log(token.value);

// Update the cookie
setToken('my-token');

// Remove the cookie
removeToken();
```

The composable returns an array containing:

1. A readonly Vue `ref` containing the cookie value.
2. A setter function.
3. A remove function.

The returned ref is reactive and can be used directly in Vue components and templates.

### Default values

You can provide an initial value when creating the composable:

```js
const [theme, setTheme, removeTheme] = useCookie('theme', 'light');
```

If the cookie does not exist, the initial value is used.

After calling `remove()`, the ref value is set to `undefined`.

### Vue component example

```vue
<script setup>
import { useCookie } from '@straylightagency/cookies-vue';

const [theme, setTheme, removeTheme] = useCookie('theme', 'light');
</script>

<template>
    <div>
        <p>Current theme: {{ theme }}</p>

        <button @click="setTheme('light')">
            Light
        </button>

        <button @click="setTheme('dark')">
            Dark
        </button>

        <button @click="removeTheme()">
            Reset
        </button>
    </div>
</template>
```

### Custom options

The setter and remove functions accept optional cookie attributes:

```js
setTheme('dark', {
    expires: 60 * 60 * 24,
    sameSite: 'strict',
});
```

The composable uses the same default options as the Vanilla JavaScript helper.

**Note:** The composable initializes its ref from the cookie value when called. Changes made directly to cookies outside the composable are not automatically reflected in the ref.

## API reference

### Vanilla JavaScript

| Function | Parameters | Description |
|---|---|---|
| `useCookie(key, initial?)` | Cookie name and optional initial value. | Creates a Proxy-based cookie accessor. |

### Vue.js

| Function | Parameters | Description |
|---|---|---|
| `useCookie(key, initial?)` | Cookie name and optional initial value. | Creates a reactive cookie accessor. |

### Cookie methods

| Method | Parameters | Description |
|---|---|---|
| `get(key?, default_value?)` | Optional cookie name and fallback value. | Retrieves a cookie or all cookies. |
| `set(key, value, options?)` | Cookie name, value, and optional attributes. | Creates or updates a cookie. |
| `has(key)` | Cookie name. | Checks whether a cookie exists. |
| `remove(key, options?)` | Cookie name and optional attributes. | Removes a cookie. |
| `all()` | None. | Retrieves all cookies. |

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected cookie behavior in a browser.
5. Submit a pull request.

Repository: https://github.com/straylightagency/js-cookies

Report issues: https://github.com/straylightagency/js-cookies/issues

## License

`@straylightagency/cookies` is released under the MIT License.

See the [LICENSE](LICENSE) file for details.