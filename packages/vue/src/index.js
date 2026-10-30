import { cookies } from '@straylightagency/cookies';
import { ref, readonly } from 'vue';

/**
 * @type {{expires: number, path: string, sameSite: string}}
 */
const default_options = {
    expires: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
};

/**
 * @param {string} key
 * @param {*} initial
 * @returns {Array}
 */
function useCookie(key, initial = undefined) {
    const getter = ref(cookies.get(key, initial));

    const setter = (new_value, options = {}) => {
        cookies.set(key, new_value, {
            ...default_options,
            ...options,
        });

        getter.value = new_value;
    };

    const remove = (options = {}) => {
        cookies.remove(key, {
            ...default_options,
            ...options,
        });

        getter.value = undefined;
    };

    return [
        readonly(getter),
        setter,
        remove,
    ];
}

export {
    useCookie,
    cookies
};