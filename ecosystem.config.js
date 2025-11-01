module.exports = {
  apps: [{
    name: 'sillytavern-web',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/jiuguanmama/mySillyTavern/apps/web',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      ADMIN_PASSWORD: 'hao123321',
      SESSION_SECRET: '6fa5e365008d5ff2bbd004a3522eda574a96920ae403becc4d8e09a3feb39c22'
    },
    error_file: '/var/log/sillytavern/error.log',
    out_file: '/var/log/sillytavern/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000
  }]
}
