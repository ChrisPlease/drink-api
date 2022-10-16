docker exec -i postgres pg_restore -U admin -v -c -d api < "$1"
