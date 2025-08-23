module.exports = {
  apps: [{
    name: 'income-clarity',
  // Direct next binary (proved stable in manual test)
  script: 'node_modules/.bin/next',
  args: 'dev',  // For production: run `npm run build` then temporarily change to 'start'
    cwd: '/public/MasterV2/income-clarity/income-clarity-app',
    instances: 1,
    exec_mode: 'fork', // Important: Use fork mode with Next.js 15, not cluster
    env: {
      NODE_ENV: 'development',  // Default to development - safer
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    max_memory_restart: '2G',
    autorestart: true,
    watch: false,
  max_restarts: 5,
  min_uptime: '2s',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
  // Removed wait_ready/listen_timeout because Next.js dev server does NOT emit the 'ready' event PM2 expects.
  // Their presence caused PM2 to think the app never became ready and restart repeatedly every few seconds.
  kill_timeout: 5000
  }]
};