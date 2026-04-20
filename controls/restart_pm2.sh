pm2 kill
kill $(lsof -t -i:3001) 2>/dev/null
pm2 start /var/www/chronicle/api/index.js --name chronicle
PORT=3002 pm2 start /var/www/chronicle/lab/index.js --name chronicle-dev
pm2 save
pm2 list