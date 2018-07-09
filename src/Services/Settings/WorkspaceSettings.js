import Settings from './Settings'

const oldDefaultMnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const initialSettings = {
  verboseLogging: false,
  randomizeMnemonicOnStart: false,
  logsDirectory: null,
  server: {
    hostname: "127.0.0.1",
    port: 7545,
    network_id: 5777,
    default_balance_ether: 100,
    total_accounts: 10,
    unlocked_accounts: [],
    locked: false,
    vmErrorsOnRPCResponse: true,
    logger: null,
    verbose: false
  }
}

class WorkspaceSettings extends Settings {
  constructor(directory) {
    super(directory, initialSettings)
  }

  bootstrapModification(currentSettings) {
    // Add any non-additive settings changes here by creating a function which
    // handles the settings change in question.

    currentSettings = migrateMnemonicSettings(currentSettings)

    return currentSettings
  }

  /**
   * Called when a new mnemonic is read back from the underlying chain, will
   * persist this new mnemonic if it differs from the one stored and if
   * randomizeMnemonicOnStart is false.
   */
  async handleNewMnemonic(mnemonic) {
    if (!this._getRaw("randomizeMnemonicOnStart", true)) {
      await this.set('server.mnemonic', mnemonic)
    }
  }
}

const migrateMnemonicSettings = function(currentSettings) {
  // If we're migrating a settings file from before we used a persistent,
  // randomly generated mnemonic by default, randomizeMnemonic on start will
  // be undefined.
  if (currentSettings.randomizeMnemonicOnStart === undefined) {

    // Before we added the randomizeMnemonicOnStart flag, the absence of a
    // mnemonic meant that we wanted a random one one each run. We want to
    // preserve this preference.
    if (currentSettings.server.mnemonic === "") {
      currentSettings.randomizeMnemonicOnStart = true;
    } else if (currentSettings.server.mnemonic === oldDefaultMnemonic || !currentSettings.server.mnemonic) {

      // This will cause a new mnemonic to be generated and persisted only in
      // the case when the old default mnemonic was being used.
      currentSettings.server.mnemonic = null;
    }
  }

  return currentSettings;
}

export default WorkspaceSettings