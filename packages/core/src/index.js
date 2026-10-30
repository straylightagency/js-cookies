/**
 * @author anthony@straylightagency.be
 */

class Cookies {
    /**
     * Decode a cookie value.
     *
     * @param {string} value
     * @returns {*}
     */
    #decode(value) {
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch {
            try {
                return decodeURIComponent(value);
            } catch {
                return value;
            }
        }
    }

    /**
     * Encode a cookie value.
     *
     * @param {*} value
     * @returns {string}
     */
    #encode(value) {
        const encoded = JSON.stringify(value);

        if (encoded === undefined) {
            throw new TypeError('Cookie value cannot be serialized.');
        }

        return encodeURIComponent(encoded);
    }

    /**
     * Get a cookie or all cookies.
     *
     * @param {string|undefined} key
     * @param {*} initial
     * @returns {*}
     */
    get(key = undefined, initial = undefined) {
        const entries = document.cookie
            ? document.cookie.split(';')
            : [];

        const result = Object.create(null);

        for (const entry of entries) {
            const separator = entry.indexOf('=');

            if (separator === -1) {
                continue;
            }

            const name = entry.slice(0, separator).trim();
            const value = entry.slice(separator + 1);

            let decoded_name;

            try {
                decoded_name = decodeURIComponent(name);
            } catch {
                decoded_name = name;
            }

            if (key === undefined) {
                result[decoded_name] = this.#decode(value);
                continue;
            }

            if (decoded_name === key) {
                return this.#decode(value);
            }
        }

        return key === undefined ? result : initial;
    }

    /**
     * Set a cookie.
     *
     * @param {string} key
     * @param {*} value
     * @param {Object} options
     */
    set(key, value, options = {}) {
        const {
            expires,
            maxAge,
            path,
            domain,
            sameSite,
            secure = false,
            ...additionalOptions
        } = options;

        const attributes = [
            `${encodeURIComponent(key)}=${this.#encode(value)}`
        ];

        if (expires !== undefined) {
            let expiration = expires;

            if (typeof expiration === 'number') {
                expiration = new Date(Date.now() + expiration * 1000);
            }

            if (!(expiration instanceof Date) || Number.isNaN(expiration.getTime())) {
                throw new TypeError('Invalid cookie expiration date.');
            }

            attributes.push(`Expires=${expiration.toUTCString()}`);
        }

        if (maxAge !== undefined) {
            if (!Number.isFinite(maxAge)) {
                throw new TypeError('Invalid cookie maxAge value.');
            }

            attributes.push(`Max-Age=${Math.floor(maxAge)}`);
        }

        if (path) {
            attributes.push(`Path=${path}`);
        }

        if (domain) {
            attributes.push(`Domain=${domain}`);
        }

        if (sameSite !== undefined) {
            const normalized = String(sameSite).toLowerCase();

            if (!['strict', 'lax', 'none'].includes(normalized)) {
                throw new TypeError('Invalid SameSite value.');
            }

            attributes.push(`SameSite=${normalized}`);
        }

        if (secure) {
            attributes.push('Secure');
        }

        if (additionalOptions.partitioned) {
            attributes.push('Partitioned');
        }

        document.cookie = attributes.join('; ');
    }

    /**
     * Check whether a cookie exists.
     *
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return Object.prototype.hasOwnProperty.call(this.get(), key);
    }

    /**
     * Remove a cookie.
     *
     * @param {string} key
     * @param {Object} options
     */
    remove(key, options = {}) {
        this.set(key, '', {
            ...options,
            expires: new Date(0),
            maxAge: 0,
        });
    }

    /**
     * Get all cookies.
     *
     * @returns {Object}
     */
    all() {
        return this.get();
    }
}

/**
 * @type {Cookies}
 */
export const cookies = new Cookies;

/**
 * @type {{expires, path: string, sameSite: string}}
 */
const default_options = {
    expires: (60 * 60 * 24 * 365),
    path: '/',
    sameSite: 'lax',
};

/**
 * @param {String} key
 * @param {*} initial
 * @returns {*|({value: undefined}|(function(*, {}=): void)|(function(): void))[]|boolean}
 */
export function fromCookie(key, initial = undefined) {
    const proxy = new Proxy( {
        value: initial,
    }, {
        get(target, prop, receiver) {
            if (prop === 'value') {
                return cookies.get(key, initial);
            }

            return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value) {
            return false;
        },
    } );
    const setter = (new_value, options = {}) => {
        cookies.set(key, new_value, {
            ...default_options,
            ...options,
        });
    };

    const remove = (options = {}) => {
        cookies.remove(key, {
            ...default_options,
            ...options
        });
    };

    return [ proxy, setter, remove ];
}