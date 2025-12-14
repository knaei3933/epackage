// PM2 Configuration for Epackage Lab Web
// Xserver 배포를 위한 PM2 설정

module.exports = {
  apps: [{
    name: 'epackage-lab-web',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/epackage-lab-web',

    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Production environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Process management
    instances: 1,
    exec_mode: 'fork',

    // Restart configuration
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',

    // Logging
    log_file: '/var/log/pm2/epackage-lab-web.log',
    out_file: '/var/log/pm2/epackage-lab-web-out.log',
    error_file: '/var/log/pm2/epackage-lab-web-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Monitoring
    monitoring: false,

    // Auto restart on file changes (development mode)
    // watch: ['src/', 'next.config.js', 'package.json'],
    // ignore_watch: ['node_modules/', '.next/', 'logs/'],

    // Health check
    health_check_grace_period: 3000,

    // Kill timeout
    kill_timeout: 5000
  }]
};