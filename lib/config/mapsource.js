"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const map_1 = require("@toba/map");
const vehicle = {
    ATV: 'ATV',
    AUTOMOBILE: 'Automobile',
    JEEP: 'Jeep',
    MOTORCYCLE: 'Motorcycle',
    UTV: 'UTV'
};
function seasonal(vehicleKey, from, out) {
    if (tools_1.is.defined(from, vehicleKey)) {
        out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
    }
}
function trails(from) {
    const out = {};
    const miles = from['MILES'];
    const who = 'Jurisdiction';
    let name = from['NAME'];
    let label = from['name'];
    if (miles && miles > 0) {
        out['Miles'] = miles;
    }
    if (tools_1.is.value(label)) {
        label = label.trim();
    }
    if (!tools_1.is.empty(name) && !tools_1.is.empty(label)) {
        name = tools_1.titleCase(name.trim());
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
    map_1.relabel(from, out, { JURISDICTION: who });
    if (tools_1.is.defined(out, who)) {
        out[who] = tools_1.titleCase(out[who]);
    }
    return out;
}
function mines(from) {
    const out = {};
    map_1.relabel(from, out, {
        FSAgencyName: 'Forest Service Agency',
        LandOwner: 'Land Owner',
        DEPOSIT: 'Name',
        Mining_District: 'Mining District'
    });
    return out;
}
exports.mapSource = {
    mines: {
        name: '',
        provider: 'Idaho Geological Survey',
        transform: mines,
        url: 'http://www.idahogeology.org/PDF/Digital_Data_(D)/Digital_Databases_(DD)/Mines_Prospects/2016/MinesAndProspects.kmz'
    },
    'hot-springs': {
        name: '',
        provider: 'Idaho Geological Survey',
        url: 'http://www.idahogeology.org/PDF/Digital_Data_(D)/Digital_Databases_(DD)/Mines_Prospects/2016/MinesAndProspects.kmz'
    },
    atv: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        transform: trails,
        url: 'https://trails.idaho.gov/pages/kmz/ATV.kmz'
    },
    'atv-seasonal': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/ATV_Seasonal.kmz'
    },
    automobile: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Automobile.kmz'
    },
    'automobile-seasonal': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Automobile_Seasonal.kmz'
    },
    highway: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Highway_Legal.kmz'
    },
    'highway-seasonal': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Highway_Legal_Seasonal.kmz'
    },
    jeep: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Jeep.kmz'
    },
    'jeep-seasonal': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Jeep_Seasonal.kmz'
    },
    motorcycle: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Motorcycle.kmz'
    },
    'motorcycle-seasonal': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Motorcycle_Seasonal.kmz'
    },
    'non-motorized': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Nonmotorized.kmz'
    },
    'other-roads': {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Other_Road.kmz'
    },
    wilderness: {
        name: '',
        provider: 'Idaho Parks & Recreation',
        url: 'https://trails.idaho.gov/pages/kmz/Wilderness.kmz'
    },
    'moscow-mountain': {
        name: '',
        provider: 'Moscow Area Mountain Bike Association',
        url: 'https://drive.google.com/uc?export=download&id=0B0lgcM9JCuSbbDV2UUNILWpUc28'
    }
};
