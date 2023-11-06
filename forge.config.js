module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/myorilogo',
    "protocols": [
      {
        "name": "MyOri NFC",
        "schemes": ["myori-NFC"]
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        iconUrl: 'https://myori.my/assets/img/myori-img/myorilogo.png',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: './assets/myorilogo.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: './assets/myorilogo.ico'
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: './assets/myorilogo.ico'
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
