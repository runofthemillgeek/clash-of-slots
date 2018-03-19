var ttRevert = (function() {

var d = document;

var app = {};

app.k = {
    SLOT_COLOR: '#CCFF33',
    SLOT_REGEX: /^(.*)-(.*)-(.*)-(.*)$/, // (1:CODE)-(2:TYPE)-(3:SLOT)-(4:VENUE)
    SLOT_REGEX_SLOT_IDX: 3,
    SLOT_REGEX_CODE_IDX: 1,
    SLOT_REGEX_VENUE_IDX: 4,        
    TABLE_REF: d.getElementsByClassName('paste-area')[0],
    USER_ERR_ELEMENT: d.getElementsByClassName('user-error-message')[0],
    RESET_BUTTON: d.getElementById('resetButton'),
    DOWNLOAD_BUTTON: d.getElementById('downloadButton')
};

app.data = {
    tables: [],
    count: {},
    maxOccupancy: 0
};

app.init = function init() {
    this.setUpListeners();
    this.listenForPaste();
}

app.setUpListeners = function setUpListeners() {
    var dBtn = this.k.DOWNLOAD_BUTTON;

    this.k.RESET_BUTTON.addEventListener('click', function() {
        this.resetEverything();
    }.bind(this));

    html2canvas(this.k.TABLE_REF.children[0], {
        onrendered: function (canvas) {
            if (dBtn)
                dBtn.href = canvas.toDataURL();
            // Remove `visible` once screenshot is taken.
            // p.classList.remove('of-visible');
        },
        width: null,
        height: null,
    });
}

app.resetEverything = function resetEverything() {
    this.resetError();
    this.resetTable();
    this.k.DOWNLOAD_BUTTON.classList.add('hidden');
}

app.listenForPaste = function listenForPaste() {
    var self = this;

    d.addEventListener('paste', function(e) {
        var data = e.clipboardData.getData('text/html');
        e.preventDefault();

        try {
            self.parseData(data);
            self.showDownloadButton();
        } catch (e) {
            console.log(e);
            self.error("Couldn't parse the copied text. Are you sure you copied the VTOP page?");
        }
    });
}

app.parseData = function parseData(data) {
    var self = this;

    var e = (new DOMParser).parseFromString(data, 'text/html');
    var t = e.querySelector("#timeTableStyle");

    if(!t) {
        throw Error("Didn't find valid HTML in clipboard. Query for table returned " + Object.toString(t));
    }

    var slots = this.getSlots(t);
    this.pushTableData(slots);
    this.updateCounts();
    this.fillTable();
}

app.updateCounts = function updateCounts() {
    var counts = this.data.counts;
    var tables = this.data.tables;
    var max = 0;

    counts = tables.reduce((store, curr) => {

        var _store = Object.assign({}, store);

        for (var slot of Object.keys(curr)) {
            if (!(slot in _store)) {
                _store[slot] = 1;
            } else {
                _store[slot]++;
            }

            if (_store[slot] > max) max = _store[slot];
        }

        return _store;

    }, {});

    this.data.count = counts;
    this.data.maxOccupancy = max;
}

app.pushTableData = function pushTableData(slots) {
    this.data.tables.push(slots);
}

app.fillTable = function fillTable() {
    var max = this.data.maxOccupancy;
    var count = this.data.count;

    Object.keys(count).forEach(function (slot) {
        var tds = d.querySelectorAll('.' + slot);
        tds.forEach(function (td) {
            td.classList.add('slot-clash');
            td.classList.add(getColorClass(count[slot], max));
        });
    });
}

app.getSlots = function getSlots(tableHtml) {
    var k = this.k;
    var regSlotsList = tableHtml.querySelectorAll(
        'td[bgcolor="' + k.SLOT_COLOR + '"]'
    );
    return this.getSlotMapFromList(regSlotsList);
}

app.getSlotMapFromList = function getSlotMapFromList(list) {
    var k = this.k;
    var slotMap = {};
    [].forEach.call(list, function(slotCell) {
        var text = slotCell.textContent;
        var matches = text.match(k.SLOT_REGEX);
        var slot = matches[k.SLOT_REGEX_SLOT_IDX];
        if (!(slot in slotMap))
            slotMap[slot] = matches[k.SLOT_REGEX_CODE_IDX] + '-' + matches[k.SLOT_REGEX_VENUE_IDX];
    });

    return slotMap;
}

app.resetTable = function resetTable() {
    var te = this.k.TABLE_REF;
    var tds = te.querySelectorAll(".slot-clash");
    [].forEach.call(tds, function (td) {
        td.classList.remove('slot-clash');
    });
}

app.error = function error(msg) {
    var e = this.k.USER_ERR_ELEMENT;
    e.textContent = msg;
}

app.resetError = function resetError() {
    var e = this.k.USER_ERR_ELEMENT;
    e.textContent = "";
}

app.showDownloadButton = function showDownloadButton() {
    this.k.DOWNLOAD_BUTTON.classList.remove('hidden');
}

function getColorClass(val, max) {
    var THRESHOLD = 0.5;

    if (val === 0) return '';
    if (val / max > THRESHOLD) {
        return 'slot-clash--high';
    } else {
        return 'slot-clash--mid';
    }
}

return app;

})();

ttRevert.init();