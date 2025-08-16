module.exports = {
  apps: [{
    name: 'income-clarity-dev',
    script: 'node_modules/.bin/next',
    args: 'dev --hostname 0.0.0.0',
    cwd: '/public/MasterV2/income-clarity/income-clarity-app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096',
      FORCE_COLOR: '1',
      NPM_CONFIG_COLOR: 'always',
      TERM: 'xterm-256color',
      // Critical: Force TTY for SSH compatibility
      TTY: '1'
    },
    max_memory_restart: '2G',
    autorestart: true,
    watch: false,
    max_restarts: 3,
    min_uptime: '5s',
    restart_delay: 2000,
    error_file: './logs/pm2-dev-error.log',
    out_file: './logs/pm2-dev-out.log',
    log_file: './logs/pm2-dev-combined.log',
    time: true,
    // Next.js 15 development specific settings
    wait_ready: false, // Don't wait for ready signal in dev mode
    listen_timeout: 5000,
    kill_timeout: 3000,
    // Force stdin/stdout handling
    disable_source_map_support: false,
    source_map_support: true,
    // Additional PM2 options for stability
    merge_logs: true,
    combine_logs: true
  }]
};