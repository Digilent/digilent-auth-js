import { DigilentAuthJs } from './dist/digilent-auth-js';
if (typeof window !== 'undefined') {
    window.DigilentAuthJs = DigilentAuthJs;
}
else {
    exports.DigilentAuthJs = DigilentAuthJs;
}
