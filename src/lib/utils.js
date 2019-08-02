import PUBLIC_KEY from './publickey';

const _ = require('lodash');
const NodeRSA = require('node-rsa');

export function canUseSessionStorage() {
  const test = 'test';
  try {
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

export function canUseLocalStorage() {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function encryptWithPublicKey(data) {
   const key = new NodeRSA();
   key.importKey(PUBLIC_KEY, 'pkcs8-public-pem');
   return key.encrypt(data, 'base64');
}
