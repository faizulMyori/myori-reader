let { remote } = require("electron");
import { read, encode, write } from "./utils/myori-reader.js";
const { SerialPort } = require("serialport");
const { ReadlineParser } = require('@serialport/parser-readline')

// PLC Function
var isPLCConnected = false;
var s1PLCData = false;

SerialPort.list().then(
  (ports) => ports.forEach((port) => console.log(port)),
  (err) => console.error(err)
);

// Replace with your serial port path and baud rate
const port = new SerialPort({ path: "COM1", baudRate: 9600 });

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// Open errors will be emitted as an error event
port.on("error", function (err) {
  isPLCConnected = true;
  document.getElementById("plc_status").innerHTML = "Connecting...";
  document.getElementById("plc_status").style.color = "red";
});

port.on("open", function () {
  isPLCConnected = true;
  document.getElementById("plc_status").innerHTML = "Connected";
  document.getElementById("plc_status").style.color = "green";
});

// Read data that is available but keep the stream in "paused mode"
port.on("data", function (data) {
  console.log("Data:", data);
});

// Read data when a new line delimiter is received
parser.on("data", function (data) {
  console.log("Parsed Data:", data);
});

document.getElementById("submitPlc").addEventListener("click", () => {
  // sendData(document.getElementById("writeToPLC").value);
});

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if(err) {
      console.log(err);
      return
    } else {
      console.log('');
    }

    if (ports.length === 0) {
      console.log('No ports discovered')
    }

    console.log('ports', ports);
  })
}


// NFC Function
const { NFC } = require("nfc-pcsc");
const nfc = new NFC();
const nfcCard = require("nfccard-tool");
var readerOpt = [];
var excelData = [];

nfc.on("reader", (reader) => {
  readerOpt.push(reader);
  var readers = document.getElementsByClassName("nfc_list");

  for (let r of readers) {
    var opt = document.createElement("option");
    opt.value = reader.name;
    opt.innerHTML = reader.name;
    if (!reader.name.includes("SAM")) {
      r.appendChild(opt);
    }
  }

  reader.on("end", () => {
    console.log(`${reader.reader.name}  device removed`);
  });
});

var initials = document.getElementById("writeInitials").value;
var writeStartNo = document.getElementById("writeStartNo").value;
var writeTotal = document.getElementById("writeTotal").value;
var gapNo = document.getElementById("gapNo").value;
var uri_instructions = document.getElementById("uri_instructions").value;

document.getElementById("setWriteData").addEventListener("click", () => {
  initials = document.getElementById("writeInitials").value;
  writeStartNo = parseInt(document.getElementById("writeStartNo").value);
  writeTotal = document.getElementById("writeTotal").value;
  gapNo = document.getElementById("gapNo").value;
  uri_instructions = document.getElementById("uri_instructions").value;

  alert("Data Set!");
});

document.getElementById("nfc_reader1").addEventListener("change", () => {
  var selectedDevice = document.getElementById("nfc_reader1").value;
  if (selectedDevice !== "") {
    var reader = readerOpt.find((e) => e.name == selectedDevice);
    reader.aid = "F222222222";
    var countNFC = 0;
    let writeCount = writeStartNo;

    reader.on("card", async (card) => {
      const tag = card.uid;
      countNFC = countNFC + 1;
      let padLength = 28 - initials.length;
      const data = await write(
        reader,
        encode(initials + writeCount.toString().padStart(padLength, "0")),
        tag,
        true,
        uri_instructions
      );

      if (countNFC <= writeTotal) {
        if (data) {
          var nfcData = {
            no: countNFC,
            uid: tag,
            data: data,
            status: "OK",
          };

          insertToTable(nfcData, "table1");

          excelData.push(nfcData);

          writeCount = writeCount + 1;
        } else {
          insertToTable(
            {
              no: countNFC,
              uid: tag,
              data: data,
              status: "ERR",
            },
            "table1"
          );
        }
      }
    });
  } else {
    remote.getCurrentWindow().reload();
  }
});

document.getElementById("nfc_reader2").addEventListener("change", () => {
  var selectedDevice = document.getElementById("nfc_reader2").value;
  if (selectedDevice !== "") {
    var reader = readerOpt.find((e) => e.name == selectedDevice);
    reader.aid = "F222222222";
    var countNFC = 0;

    reader.on("card", async (card) => {
      const tag = card.uid;
      countNFC = countNFC + 1;
      const dataRead = await read(reader);
      if (dataRead === excelData[gapNo]["data"]) {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: dataRead,
            status: "OK",
          },
          "table2"
        );
      } else {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: dataRead,
            status: "ERR",
          },
          "table2"
        );
      }
    });
  } else {
    remote.getCurrentWindow().reload();
  }
});

document.getElementById("nfc_reader3").addEventListener("change", () => {
  var selectedDevice = document.getElementById("nfc_reader3").value;
  if (selectedDevice !== "") {
    var reader = readerOpt.find((e) => e.name == selectedDevice);
    reader.aid = "F222222222";
    var countNFC = 0;

    reader.on("card", async (card) => {
      const tag = card.uid;
      countNFC = countNFC + 1;

      const data = await lock(reader);

      if (data) {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: data,
            status: "OK",
          },
          "table3"
        );
      } else {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: data,
            status: "ERR",
          },
          "table3"
        );
      }
    });
  } else {
    remote.getCurrentWindow().reload();
  }
});

document.getElementById("nfc_reader4").addEventListener("change", () => {
  var selectedDevice = document.getElementById("nfc_reader4").value;
  if (selectedDevice !== "") {
    var reader = readerOpt.find((e) => e.name == selectedDevice);
    reader.aid = "F222222222";
    var countNFC = 0;

    reader.on("card", async (card) => {
      const tag = card.uid;
      countNFC = countNFC + 1;

      const data = await lock(reader);
      if (data) {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: data,
            status: "OK",
          },
          "table4"
        );
      } else {
        insertToTable(
          {
            no: countNFC,
            uid: tag,
            data: data,
            status: "ERR",
          },
          "table4"
        );
      }
    });
  } else {
    remote.getCurrentWindow().reload();
  }
});

document.getElementById("downloadExcel").addEventListener("click", () => {
  let data = excelData;

  const excelHeader = ["No", "UID", "Encrypted", "Status"];

  const XLSX = require("xlsx");

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Petronas");

  XLSX.utils.sheet_add_aoa(worksheet, [excelHeader], { origin: "A1" });

  let wscols = [];
  excelHeader.map((arr) => {
    wscols.push({ wch: arr.length + 5 });
  });
  worksheet["!cols"] = wscols;

  XLSX.writeFile(
    workbook,
    remote.app.getPath("downloads") + "/Petronas NFC Lists.xlsx",
    { compression: true }
  );

  alert("Excel file has been downloaded, please check your downloads folder");
});

document.getElementById("resetSytem").addEventListener("click", () => {
  remote.getCurrentWindow().reload();
});

function insertToTable(data, tableID) {
  var table = document.getElementById(tableID);

  var row = table.insertRow(0);

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);

  cell1.innerHTML = data.no;
  cell2.innerHTML = data.uid;
  cell3.innerHTML = data.data;
  cell4.innerHTML = data.status;
}
