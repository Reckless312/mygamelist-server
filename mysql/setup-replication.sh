#!/bin/sh

echo "Waiting for master to be ready..."
until mysql -h db-master -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1"; do
  sleep 3
done

echo "Waiting for slave to be ready..."
until mysql -h db-slave -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1"; do
  sleep 3
done

REPLICA_STATUS=$(mysql -h db-slave -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW REPLICA STATUS\G" 2>/dev/null)
if echo "$REPLICA_STATUS" | grep -q "Replica_IO_Running: Yes"; then
  echo "Replication already configured, skipping."
  exit 0
fi

MASTER_LOG_FILE=$(mysql -h db-master -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW MASTER STATUS\G" 2>/dev/null | grep "File:" | awk '{print $2}')
MASTER_LOG_POS=$(mysql -h db-master -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW MASTER STATUS\G" 2>/dev/null | grep "Position:" | awk '{print $2}')

echo "Master is at log file: $MASTER_LOG_FILE, position: $MASTER_LOG_POS"

mysql -h db-slave -u root -p"${MYSQL_ROOT_PASSWORD}" << EOF
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='db-master',
  SOURCE_USER='replicator',
  SOURCE_PASSWORD='replicator_pass',
  SOURCE_LOG_FILE='${MASTER_LOG_FILE}',
  SOURCE_LOG_POS=${MASTER_LOG_POS};
START REPLICA;
EOF

echo "Replication started successfully."
