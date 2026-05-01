export const STORAGE_KEYS = {
  LOCALE: 'rp-locale',
  SERVER_BASE_URL: 'rp-server-base-url',
  THEME_DARK: 'rp-theme-dark',
  POS_DESKTOP_LAYOUT: 'rp-pos-desktop-layout',
  KEYBOARD_PANEL_POS: 'rp-kb-panel-pos',
  KEYBOARD_TOGGLE_POS: 'rp-kb-toggle-pos',
  SCANNER_RUNTIME_PREFS: 'rp_scanner_runtime',
  LOGIN_TOKEN: 'rp-login-token',
} as const;


const url = "fadl_pos.api.login.login_endpoints";

export const METHODS = {
  LOGIN : `${url}.login`,
  LOGIN_QR : `${url}.login_qr`,
  GENERATE_QR : `${url}.generate_qr`,
  CLEAR_SESSIONS : `${url}.clear_sessions`

} as const;