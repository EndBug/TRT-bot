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

module.exports.run = async () => {
  await doc.useServiceAccountAuth({
    client_email: googles.email,
    private_key: googles.key
  });

  await doc.loadInfo();

  for (let sheet of doc.sheetsByIndex) worksheets[sheet.title] = sheet
};

module.exports.get = async (name, lastRow = 100, empty = false) => {
  if (!Object.keys(worksheets).includes(name)) {
    let err = `Name is not included: ${name}`;
    error("settings.js", "get", err);
    throw err;
  } else {
    let sheet = worksheets[name];
    await sheet.loadCells();

    let res = {};
    for (let r = 1; r < lastRow; r++) {
      let keyCell = sheet.getCell(r, 0),
        valueCell = sheet.getCell(r, 1);
      res[keyCell.value] = valueCell.value
    }
    return res;
  }
}

module.exports.set = async (name, obj) => {
  if (!Object.keys(worksheets).includes(name)) error("settings.js", "set", `Name is not included: ${name}`);
  else {
    let sheet = worksheets[name];
    await sheet.loadCells();
    let index = 1;
    for (key in obj) {
      let k = sheet.getCell(index, 0);
      let v = sheet.getCell(index, 1);
      k.value = key
      let future = obj[key];
      v.value = typeof future == Boolean ? `${future.toString()} ` : future;
      index++
    }
    await sheet.saveUpdatedCells();
  }
}

module.exports.assign = async (name, obj) => {
  if (!Object.keys(worksheets).includes(name)) error("settings.js", "assign", `Name is not included: ${name}`);
  else {
    await module.exports.get(name).then(previous => {
      let next = Object.assign(previous, obj);
      module.exports.set(name, next);
    });
  }
};