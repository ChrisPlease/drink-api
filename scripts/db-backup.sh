docker exec -i postgres pg_dump -U admin -F t api > ./db/$(date +%F-%T).backup.sql
