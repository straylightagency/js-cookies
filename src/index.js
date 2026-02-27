/**
 * @author anthony@straylightagency.be
 */
class Cookies {
    /**
     * @param key {String|undefined}
     * @param default_value {*}
     * @returns {*}
     */
    get(key = undefined, default_value = undefined) {
        const cookies = document.cookie ? document.cookie.split('; ') : [];
        const l = cookies.length;
        let result = key ? undefined : {};
        let i = 0;
        let parts, name, value;

        for ( ; i < l ; i++ ) {
            parts = cookies[ i ].split('=');
            name = decodeURIComponent( parts.shift() );
            value = parts.join( '=' );

            if ( !key ) {
                result[ name ] = value;
            } else if ( key === name ) {
                if ( value === '' ) {
                    return value;
                }

                if ( value.indexOf('"') === 0 ) {
                    // This is a quoted cookie as according to RFC2068, unescape...
                    value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                }

                // Replace server-side written pluses with spaces.
                // If we can't parse the cookie, ignore it, it's unusable.
                value = decodeURIComponent( value.replace(/\+/g, ' ' ) );

                try {
                    value = JSON.parse( value );
                } catch ( e ) { /* shhhhhh... */ }

                return value;
            }
        }

        return ( key && !result ) ? default_value : result;
    }

    /**
     * @param key {String}
     * @param val {*}
     * @param options {{}}
     */
    set(key, val, options = {}) {
        let expires = options.expires;

        if ( typeof expires === 'number' ) {
            expires = new Date();
            expires.setSeconds( expires.getSeconds() + options.expires );
        }

        const cookie = [
            encodeURIComponent( key ),
            '=',
            encodeURIComponent( JSON.stringify( val ) ),
            expires ? '; Expires=' + expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; Path=' + options.path : '',
            options.domain ? '; Domain=' + options.domain : '',
            options.sameSite ? '; SameSite=' + options.sameSite : '',
            options.hostOnly ? '; HostOnly' : '',
            options.secure ? '; Secure' : '',
            options.session ? '; Session' : '',
            options.httpOnly ? '; HttpOnly' : '',
        ];

        document.cookie = cookie.join('');
    }

    /**
     * @param key {String}
     * @returns {boolean}
     */
    has(key) {
        return this.get( key ) !== undefined;
    }

    /**
     * @param key {String}
     * @param options {{}}
     */
    remove(key, options) {
        this.set( key, '', Object.assign( true, {}, options, {
            expires: -1,
        } ) );
    }

    /**
     * @returns {*}
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
 * @type {{expires, path: string, domain: string, sameSite: string, secure: boolean, hostOnly: boolean, httpOnly: boolean, session: boolean}}
 */
const defaultOptions = {
    expires: (60 * 60 * 24 * 365),
    path: '/',
    domain: window.location.host,
    sameSite: 'lax',
    secure: false,
    hostOnly: true,
    httpOnly: false,
    session: false
};

/**
 * @param key {String}
 * @param default_value {*}
 * @returns {*|({value: undefined}|(function(*, {}=): void)|(function(): void))[]|boolean}
 */
export function useCookie(key, default_value = undefined) {
    const proxy = new Proxy( {
        value: default_value,
    }, {
        set(target, prop, value) {
            return false;
        },
        get(target, prop) {
            return cookies.get( key, default_value );
        }
    } );

    const setter = (new_value, options = {}) => cookies.set( key, new_value, Object.assign( defaultOptions, options ) );
    const remove = (options) => cookies.remove( key, options );

    return [ proxy, setter, remove ];
}