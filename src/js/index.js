let { app, remote, BrowserWindow, dialog } = require("electron");
const { NFC } = require('nfc-pcsc');
const nfc = new NFC();
const ndef = require('@taptrack/ndef');
const nfcCard = require('nfccard-tool');
var nfcStatus = '';
var nfcCnt = 0;
var nfcData = 'Unknown';
var nfcUid = 0;
var nfcPass = '';
var selectDeviceVal = '';
var readerOpt = [];

nfc.on('reader', reader => {
    readerOpt.push(reader);
    var select = document.getElementById('selectDevice');
    var opt = document.createElement('option');
    opt.value = reader.name;
    opt.innerHTML = reader.name;
    if (!reader.name.includes("SAM")) {
        select.appendChild(opt);
    }
    document.getElementById('output').value = 'Device not selected'
});

document.getElementById('selectDevice').addEventListener('change', () => {
  selectDeviceVal = document.getElementById('selectDevice').value;
  if (selectDeviceVal !== '') {
    var chooseReader = '';
    var reader = '';
    chooseReader = readerOpt.find(e => e.name == selectDeviceVal);
    reader = chooseReader;
    reader.aid = 'F222222222';
    document.getElementById('output').value = 'Device selected'
    reader.on('card', async card => {
        nfcUid = card.uid;
        nfcCnt = nfcCnt + 1;
        try {
            const cardHeader = await reader.read(0, 20);
            const tag = nfcCard.parseInfo(cardHeader);
            if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {
                const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead());
                const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);
                if (NDEFMessage[0].type == 'uri') {
                    nfcData = NDEFMessage[0].uri;
                } else if (NDEFMessage[0].type == 'text') {
                    nfcData = NDEFMessage[0].text;
                }
                let checkEmblem = nfcData.includes("MyOriSmartSecureMDDM");
                let getEnc = nfcData.slice(28)
                if (checkEmblem) {
                    const json = {
                        tag: card.uid,
                        lbl: nfcData.slice(0, 28),
                        enc: getEnc,
                        device: {},
                    };
                    document.getElementById('lblNFC').value = nfcData
                    postMember(json)
                }
            } else {
                isOnline(true)
                nfcData = 'Unknown NFC';
                document.getElementById('output').value = nfcData
            }
        } catch (err) {
            isOnline(true)
            nfcData = 'Unknown NFC';
            document.getElementById('output').value = nfcData
        }
    });
  } else {
    remote.getCurrentWindow().reload()
  }
})

async function isOnline(disabled = true){
    if (navigator.onLine) {
        let datas = await getMembers()
        let members = []
        var mytable = [];
        if (datas.length > 0) {
            datas.forEach(data => {
                let checkID = members.find(e => e.id == data.id)
                if (!checkID) members.push(data)
            })
        }
        
        members.forEach(function (member, i) {
            let btn = '<button onClick="assignMember('+ member.id +')" class="btn btn-success" disabled>Assign</button>'
            if (!disabled)  {
                btn = '<button onClick="assignMember('+ member.id +')" class="btn btn-success">Assign</button>'
            }
            var obj = {
                "no": i + 1,
                "id": member.mddm_id,
                "name": member.name,
                "action": btn
            };
            mytable.push(obj);
        })

        var html = "";
        mytable.forEach(function(entry) {
            html += "<tr>";
            for (var k in entry){
                    html += "<td>" + entry[k] + "</td>";
            }
            html += "</tr>";
        });
        html += "";
        document.getElementById("tblMembers").innerHTML = html;
    } else {
      d_box()
    }
}

async function d_box () {
    const resp = await remote.dialog.showMessageBox({
      title:"There's no internet",
      message:"No internet available, do you want to try again?",
      type:'warning',
      buttons:["Try again please","Close"],
      defaultId: 0
    })

    if (!resp.response) {
      isOnline()
    } else {
      remote.getCurrentWindow().close()
    }
}

async function getMembers() {
    let data = []
    await fetch('https://ssstaging.myori.my/api/scan/mddm/members', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer 1|6EreDnpt3sdv1lOPJOquke8kGVSXcH37ZOGUUoSb'
        }
    }).then(res => res.json())
    .then(async json => {
        data = await json.data
        return data
    })
    return data
}

async function postMember(json) {
    await fetch('https://ssstaging.myori.my/api/scan/mddm/member', {
        method: 'POST',
        body: JSON.stringify(json),
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer 1|6EreDnpt3sdv1lOPJOquke8kGVSXcH37ZOGUUoSb'
        }
    }).then(res => res.json())
    .then(async json => {
        let data = await json.data2
        let msg = ''
        if (data)  {
            msg = "Valid NFC"
            isOnline(false)
        } else {
            msg = 'Unknown NFC';
            isOnline(true)
        }

        document.getElementById('output').value = msg
    })
}
  
  