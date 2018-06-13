/*global error GoogleSpreadsheet googles*/
module.exports.name = "Cloud settings";

var doc = new GoogleSpreadsheet(googles.sheet);
var worksheets = {};

function find(arr, row, col) {
  let res;
  for (let c of arr) {
    if (c.row == row && c.col == col) {
      res = c;
      break;
    }
  }

  if (res != undefined) return res;
  else return {
    err: true,
    value: null
  };
}

global.debugMe = (str) => {
  eval(str);
};

module.exports.run = () => {
  doc.useServiceAccountAuth({
    client_email: googles.email,
    private_key: googles.key
  }, () => {
    doc.getInfo((err, info) => {
      if (err) error("settings.js", "doc.getInfo", err);
      else {
        for (let sheet of info.worksheets) worksheets[sheet.title] = sheet;
      }
    });
  });
};

module.exports.get = (name, rows = 100, empty = false) => {
  if (!Object.keys(worksheets).includes(name)) error("settings.js", "get", `Name is not included: ${name}`);
  else {
    let sheet = worksheets[name];
    sheet.getCells({
      "max-col": 2,
      "min-row": 2,
      "max-row": rows,
      "return-empty": empty
    }, (err, cells) => {
      if (err) error("settings.js", "sheet.getCells", err);
      else {
        let res = {};
        for (let cell of cells) {
          if (cell.col == 1) {
            let key = cell.value,
              value = find(cells, cell.row, cell.col).value;
            res[key] = value;
          }
        }
        return res;
      }
    });
  }
};

module.exports.set = (name, obj) => {
  if (!Object.keys(worksheets).includes(name)) error("settings.js", "set", `Name is not included: ${name}`);
  else {
    let sheet = worksheets[name];
    sheet.getCells({
      "max-col": 2,
      "min-row": 2,
      "max-row": Object.keys(obj).length + 1,
      "return-empty": true
    }, (err, cells) => {
      if (err) error("settings.js", "set", err);
      else {
        let index = 2;
        for (let key in obj) {
          let k = find(cells, index, 1);
          let v = find(cells, index, 2);
          if (k.err || v.err) error("settings.js", "set", `Invalid cells found:\n${k}\n${v}`);
          else {
            k.value = key;
            v.value = obj[key];
            k.save();
            v.save();
          }
        }
      }
    });
  }
};