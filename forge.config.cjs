module.exports = {
  packagerConfig: {
    name: "CobraFacil",
    executableName: "CobraFacil",
    asar: true,
    ignore: [
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/src/,
      /^\/public/,
      /^\/README/,
    ],
  },

  rebuildConfig: {},

  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "cobra_facil",
        setupExe: "Cobra-Facil-Setup.exe",
        setupIcon: undefined,
        noMsi: true,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
    },
  ],
};
