let { app, remote, BrowserWindow, dialog } = require("electron");

// PLC Function
const net = require('net');
const client = new net.Socket();
var isPLCConnected = false;
var s1PLCData = null;

client.on('data', (data) => {
  console.log('Received: ' + data);
  document.getElementById('plc_data').innerHTML = data.toString();
  if (data.toString() === 's1_trigger') {
    s1PLCData = true;
  } else {
    s1PLCData = false;
  }
});

client.on('close', () => {
  isPLCConnected = false;
  document.getElementById('plc_status').innerHTML = 'Connecting...';
  removeListeners();
  setTimeout(startServer(), 3000);
});

client.on('error', (err) => {
  console.log(err);
  isPLCConnected = false;
  document.getElementById('plc_status').innerHTML = 'Connecting...';
  removeListeners();
  setTimeout(startServer(), 3000);
});

const startServer = () => {
    client.connect(9000, '169.254.132.10', () => {
      isPLCConnected = true;
      document.getElementById('plc_status').innerHTML = 'Connected';
      document.getElementById('plc_status').style.color = 'green';
    });
};

const sendData = (message) => {
  client.write(message);
};

const removeListeners = () => {
  client.removeListener('connect')
}

startServer();

document.getElementById('submitPlc').addEventListener('click', () => {
  sendData(document.getElementById('plc_data').value);
})

// NFC Function
const { NFC } = require('nfc-pcsc');
const nfc = new NFC();
const nfcCard = require('nfccard-tool');
var readerOpt = [];

nfc.on('reader', reader => {
    readerOpt.push(reader);
    var readers = document.getElementsByClassName('nfc_list')
    
    for (let r of readers) {
        var opt = document.createElement('option');
        opt.value = reader.name;
        opt.innerHTML = reader.name;
        if (!reader.name.includes("SAM")) {
            r.appendChild(opt);
        }
    }
   
    reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});
});

var selectedAction1 = '';
document.getElementById('action_reader1').addEventListener('change', () => {
  selectedAction1 = $("#action_reader1").selectpicker('val');
  console.log(selectedAction1)
})

document.getElementById('nfc_reader1').addEventListener('change', () => {
  var selectedDevice = document.getElementById('nfc_reader1').value;
  if (selectedDevice !== '') {
    var reader = readerOpt.find(e => e.name == selectedDevice);
    reader.aid = 'F222222222';
    var countNFC = 0;
    reader.on('card', async card => {
        const tag = card.uid;
        countNFC = countNFC + 1;
        if (selectedAction1.find(s => s === 'read')) {
          const data = await read(reader)
          console.log(countNFC)
          if (data) {
            insertToTable({
              "no": countNFC,
              "uid": tag,
              "data": data,
              "status": "OK",
            }, "table1")
            // sendData("s1_ok")
          } else {
            insertToTable({
              "no": countNFC,
              "uid": tag,
              "data": data,
              "status": "ERR",
            }, "table1")
            // sendData("s1_ng")
          }
        }

        // if (selectedAction1.find(s => s === 'write')) {
        //   const data = await write(reader, "123")
        // }

        // if (selectedAction1.find(s => s === 'lock')) {
        //   const data = await lock(reader)
        // }
    });
  } else {
    remote.getCurrentWindow().reload()
  }
})

var selectedAction2 = '';
document.getElementById('action_reader2').addEventListener('change', () => {
  selectedAction2 = $("#action_reader2").selectpicker('val');
})

document.getElementById('nfc_reader2').addEventListener('change', () => {
    var selectedDevice = document.getElementById('nfc_reader2').value;
    if (selectedDevice !== '') {
      var reader = readerOpt.find(e => e.name == selectedDevice);
      reader.aid = 'F222222222';
      var countNFC = 0;
  
      reader.on('card', async card => {
        const tag = card.uid;
        countNFC = countNFC + 1;
        if (selectedAction2.find(s => s === 'read')) {
          const data = await read(reader)

          if (data) {
            insertToTable({
              "no": countNFC,
              "uid": tag,
              "data": data,
              "status": "OK",
            }, "table2")
            
            // if ((countNFC) === 6) {
            //   sendData("s2_btjd_off")
            //   setTimeout(sendData("s2_btjd_on"), 10000);
            // }
          } else {
            insertToTable({
              "no": countNFC,
              "uid": tag,
              "data": data,
              "status": "ERR",
            }, "table2")
            // sendData(s1_ng)
          }
        }

        // if (selectedAction2.find(s => s === 'write')) {
        //   const data = await write(reader, "123")
        // }

        // if (selectedAction2.find(s => s === 'lock')) {
        //   const data = await lock(reader)
        // }
      });
    } else {
      remote.getCurrentWindow().reload()
    }
})

document.getElementById('nfc_reader3').addEventListener('change', () => {
  var selectedDevice = document.getElementById('nfc_reader3').value;
  if (selectedDevice !== '') {
    var reader = readerOpt.find(e => e.name == selectedDevice);
    reader.aid = 'F222222222';
    var countNFC = 0;

    reader.on('card', async card => {
      const tag = card.uid;
      countNFC = countNFC + 1;

      if (selectedAction2.find(s => s === 'read')) {
        const data = await read(reader)

        if (data) {
          insertToTable({
            "no": countNFC,
            "uid": tag,
            "data": data,
            "status": "OK",
          }, "table3")
        } else {
          insertToTable({
            "no": countNFC,
            "uid": tag,
            "data": data,
            "status": "ERR",
          }, "table3")
        }
      }

      // if (selectedAction2.find(s => s === 'write')) {
      //   const data = await write(reader, "123")
      // }

      // if (selectedAction2.find(s => s === 'lock')) {
      //   const data = await lock(reader)
      // }
    });
  } else {
    remote.getCurrentWindow().reload()
  }
})

function insertToTable(data, tableID){
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

async function read(reader) {
  try {
    const cardHeader = await reader.read(0, 20);
    const tag = nfcCard.parseInfo(cardHeader);
    if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {
      const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead());
      const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);
      if (NDEFMessage[0].type == 'uri') {
       return NDEFMessage[0].uri;
      } else if (NDEFMessage[0].type == 'text') {
        return NDEFMessage[0].text;
      }
    } else {
      return null
    }
  } catch (err) {
    return null
  }
   
}

async function write(reader, nfcText) {
  try {
    const cardHeader = await reader.read(0, 20);
    const tag = nfcCard.parseInfo(cardHeader);

    var message = '';

    message = [
      { type: 'text', text: nfcText, language: 'en' }
    ];
    
    const rawDataToWrite = nfcCard.prepareBytesToWrite(message);
    const preparationWrite = await reader.write(4, rawDataToWrite.preparedData);

    if (preparationWrite) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  }
}

async function lock(reader) {
    try {
      const data = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]); // lock all pages
      await reader.write(2, data, 4);

      const data2 = Buffer.from([0xFF, 0xFF, 0x00, 0x00]); // lock all pages
      await reader.write(40, data2, 4);

      const data3 = Buffer.from([0xFF, 0xFF, 0x00, 0x00]); // limit the count so no write access granted
      await reader.write(41, data3, 4);

      return true
    } catch (err) {
      return null;
    }
}