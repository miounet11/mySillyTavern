module.exports = {
  apps: [{
    name: 'sillytavern-web',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/jiuguanmama/mySillyTavern/apps/web',
    instances: 1,  // Single instance - Next.js doesn't support cluster mode
    exec_mode: 'fork',  // Use fork mode for Next.js
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://sillytavern_prod:sillytavern2025!@localhost:5432/sillytavern_prod?schema=public'
    },
    error_file: '/var/log/sillytavern/error.log',
    out_file: '/var/log/sillytavern/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
}

