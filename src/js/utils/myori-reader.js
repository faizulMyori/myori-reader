const nfcCard = require('nfccard-tool');

export async function read(reader) {
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

export async function write(reader, nfcText) {
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

export async function lock(reader) {
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