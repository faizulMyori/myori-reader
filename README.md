<h4 align="center">MYORI NFC Reader</h4>


<p>Steps:</p>
<ul>
  <li>Required Nodejs v14.21.3 (else the compiler will failed)</li>
</ul>

```
npm install
```

<ul>
  <li>Navigate to node_modules/@pokusew/pcsclite/src/addon.cpp</li>
  <li>Copy and paste code below</li>
</ul>

```
#include "pcsclite.h"
#include "cardreader.h"

void init_all(v8::Local<v8::Object> target) {
    PCSCLite::init(target);
    CardReader::init(target);
}

#if NODE_MAJOR_VERSION >= 10
NAN_MODULE_WORKER_ENABLED(pcsclite, init_all)
#else
NODE_MODULE(pcsclite, init_all)
#endif
```

<ul>
  <li>Open terminal in project root dir, copy, paste and enter cli below</li>
</ul>

```
.\node_modules\.bin\electron-rebuild.cmd
```

<ul>
  <li>Then you can either run or compile the project</li>
</ul>

```
npm run start  #run
npm run make  #compile
npm run dev #dev
```
