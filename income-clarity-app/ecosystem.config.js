module.exports = {
  apps: [{
    name: 'income-clarity',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/public/MasterV2/income-clarity/income-clarity-app',
    instances: 1,
    exec_mode: 'fork', // Important: Use fork mode with Next.js 15, not cluster
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    max_memory_restart: '2G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    // Next.js 15 specific settings
    wait_ready: true,
    listen_timeout: 3000,
    kill_timeout: 5000
  }]
};