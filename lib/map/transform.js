"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("../util/text");
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
        const who = 'Jurisdiction';
        let name = from['NAME'];
        let label = from['name'];
        if (miles && miles > 0) {
            out['Miles'] = miles;
        }
        if (is_1.default.value(label)) {
            label = label.toString().trim();
        }
        if (!is_1.default.empty(name) && !is_1.default.empty(label)) {
            name = text_1.titleCase(name.toString().trim());
            const num = label.replace(/\D/g, '');
            label =
                (num.length > 1 && name.includes(num)) || num.length > 3
                    ? name
                    : name + ' ' + label;
        }
        if (label) {
            out['Label'] = label;
        }
        Object.keys(vehicle).forEach(key => {
            seasonal(key, from, out);
        });
        relabel(from, out, { JURISDICTION: who });
        if (out[who]) {
            out[who] = text_1.titleCase(out[who]);
        }
        return out;
    },
    ['Idaho Geological Survey'](from) {
        const out = {};
        relabel(from, out, {
            FSAgencyName: 'Forest Service Agency',
            LandOwner: 'Land Owner',
            DEPOSIT: 'Name',
            Mining_District: 'Mining District'
        });
        return out;
    }
};
//# sourceMappingURL=transform.js.map