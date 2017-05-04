"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const vehicle = {
    ATV: 'ATV',
    AUTOMOBILE: 'Automobile',
    JEEP: 'Jeep',
    MOTORCYCLE: 'Motorcycle',
    UTV: 'UTV'
};
function seasonal(vehicleKey, from, out) {
    if (from[vehicleKey]) {
        out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
    }
}
function relabel(from, out, labels) {
    Object.keys(labels).forEach(key => {
        if (from[key]) {
            out[labels[key]] = from[key];
        }
    });
}
exports.default = {
    ['Idaho Parks & Recreation'](from) {
        const out = {};
        const miles = from['MILES'];
        let name = from['NAME'];
        let label = from['name'];
        if (miles && miles > 0) {
            out['Miles'] = miles;
        }
        if (!is_1.default.empty(name) && !is_1.default.empty(label)) {
            label = label.toString();
            name = name.toString();
            const num = label.replace(/\D/g, '');
            label = ((num.length > 1 && name.includes(num)) || num.length > 3) ? name : name + ' ' + label;
        }
        if (label) {
            out['Label'] = label;
        }
        Object.keys(vehicle).forEach(key => { seasonal(key, from, out); });
        relabel(from, out, { JURISDICTION: 'Jurisdiction' });
        return out;
    },
    ['Idaho Geological Survey'](from) {
        const out = {};
        relabel(from, out, {
            FSAgencyName: 'Forest Service Agency',
            LandOwner: 'Land Owner',
            Deposit: 'Name',
            Mining_District: 'Mining District'
        });
        return out;
    }
};
//# sourceMappingURL=transform.js.map