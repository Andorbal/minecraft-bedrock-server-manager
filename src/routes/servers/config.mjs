const config = [
  {
    key: "server-name",
    type: "string",
    validation: /[^;]+/,
    description: "Used as the server name",
    comment: `# Used as the server name
# Allowed values: Any string without semicolon symbol.`,
  },
  {
    key: "server-port",
    defaultValue: 19132,
    type: "number",
    minimum: 1,
    maximum: 65535,
    description: "Which IPv4 port the server should listen to",
  },
  {
    key: "server-portv6",
    defaultValue: 19133,
    type: "number",
    minimum: 1,
    maximum: 65535,
    description: "Which IPv4 port the server should listen to",
  },
  {
    key: "gamemode",
    defaultValue: "survival",
    type: "select",
    options: ["survival", "creative", "adventure"],
    description: "Sets the game mode for new players",
  },
  {
    key: "force-gamemode",
    defaultValue: false,
    type: "boolean",
    description: "Should the server force the game mode",
    comment: `# false: (or force-gamemode  is not defined in the server.properties)
# prevents the server from sending to the client gamemode values other
# than the gamemode value saved by the server during world creation
# even if those values are set in server.properties after world creation.
#
# true: forces the server to send to the client gamemode values
# other than the gamemode value saved by the server during world creation
# if those values are set in server.properties after world creation.`,
  },
  {
    key: "difficulty",
    defaultValue: "normal",
    type: "select",
    options: ["peaceful", "easy", "normal", "hard"],
    description: "Sets the difficulty of the world.",
  },
  {
    key: "allow-cheats",
    defaultValue: true,
    type: "boolean",
    description: "If true then cheats like commands can be used",
  },
  {
    key: "max-players",
    defaultValue: 10,
    type: "number",
    minimum: 1,
    description: "The maximum number of players that can play on the server",
  },
  {
    key: "online-mode",
    defaultValue: true,
    type: "boolean",
    description: "Should an Xbox Live account be required for the server",
    comment: `# If true then all connected players must be authenticated to Xbox Live.
# Clients connecting to remote (non-LAN) servers will always require Xbox Live authentication regardless of this setting.
# If the server accepts connections from the Internet, then it's highly recommended to enable online-mode.
# Allowed values: "true" or "false"`,
  },
  {
    key: "white-list",
    defaultValue: false,
    type: "boolean",
    description: "If true then all connected players must be listed in the separate whitelist.json file",
  },
  {
    key: "view-distance",
    defaultValue: 32,
    type: "number",
    minimum: 5,
    description: "The maximum allowed view distance in number of chunks",
  },
  {
    key: "tick-distance",
    defaultValue: 8,
    type: "number",
    minimum: 4,
    maximum: 12,
    description: "The world will be ticked this many chunks away from any player",
  },
  {
    key: "player-idle-timeout",
    defaultValue: 0,
    type: "number",
    minimum: 0,
    description:
      "After a player has idled for this many minutes they will be kicked. If set to 0 then players can idle indefinitely",
  },
  {
    key: "max-threads",
    defaultValue: 0,
    type: "number",
    minimum: 0,
    description:
      "Maximum number of threads the server will try to use. If set to 0 or removed then it will use as many as possible",
  },
  {
    key: "level-name",
    defaultValue: "default-level",
    type: "string",
    validation: () => false,
    description: "Name of the level to use (or create)",
    comment: `# Allowed values: Any string without semicolon symbol or symbols illegal for file name`,
  },
  {
    key: "level-seed",
    defaultValue: "",
    type: "string",
    description: "Use to randomize the world",
  },
  {
    key: "default-player-permission-level",
    defaultValue: "visitor",
    type: "select",
    options: ["visitor", "member", "operator"],
    description: "Permission level for new players joining for the first time",
  },
  {
    key: "texturepack-required",
    defaultValue: true,
    type: "boolean",
    description: "Force clients to use texture packs in the current world",
  },
  {
    key: "content-log-file-enabled",
    defaultValue: false,
    type: "boolean",
    description: "Enables logging content errors to a file",
  },
  {
    key: "compression-threshold",
    defaultValue: "1",
    type: "number",
    minimum: 0,
    maximum: 65535,
    description: "Determines the smallest size of raw network payload to compress",
  },
  {
    key: "server-authoritative-movement",
    defaultValue: "server-auth",
    type: "select",
    options: ["client-auth", "server-auth", "server-auth-with-rewind"],
    description: "Enables server authoritative movement",
    comment: `# Allowed values: "client-auth", "server-auth", "server-auth-with-rewind"
# Enables server authoritative movement. If "server-auth", the server will replay local user input on
# the server and send down corrections when the client's position doesn't match the server's.
# If "server-auth-with-rewind" is enabled and the server sends a correction, the clients will be instructed
# to rewind time back to the correction time, apply the correction, then replay all the player's inputs since then. This results in smoother and more frequent corrections.
# Corrections will only happen if correct-player-movement is set to true.`,
  },
  {
    key: "player-movement-score-threshold",
    defaultValue: 20,
    type: "number",
    minimum: 0,
    description: "The number of incongruent time intervals needed before abnormal behavior is reported",
    comment: `# The number of incongruent time intervals needed before abnormal behavior is reported.
# Disabled by server-authoritative-movement.`,
  },
  {
    key: "player-movement-distance-threshold",
    defaultValue: 0,
    type: "number",
    minimum: 0,
    description:
      "The difference between server and client positions that needs to be exceeded before abnormal behavior is detected",
    comment: `# The difference between server and client positions that needs to be exceeded before abnormal behavior is detected.
# Disabled by server-authoritative-movement.`,
  },
  {
    key: "player-movement-duration-threshold-in-ms",
    defaultValue: 500,
    type: "number",
    minimum: 0,
    description:
      "The duration of time the server and client positions can be out of sync (as defined by player-movement-distance-threshold) before the abnormal movement score is incremented",
    comment: `# The duration of time the server and client positions can be out of sync (as defined by player-movement-distance-threshold)
# before the abnormal movement score is incremented. This value is defined in milliseconds.
# Disabled by server-authoritative-movement.`,
  },
  {
    key: "correct-player-movement",
    defaultValue: false,
    type: "boolean",
    description: "Should player movement be corrected",
    comment: `# If true, the client position will get corrected to the server position if the movement score exceeds the threshold.`,
  },
  {
    key: "server-authoritative-block-breaking",
    defaultValue: false,
    type: "boolean",
    description: "Should the server be the authority for block breaking",
    comment: `# If true, the server will compute block mining operations in sync with the client so it can verify that the client should be able to break blocks when it thinks it can.`,
  },
];

export default config;
