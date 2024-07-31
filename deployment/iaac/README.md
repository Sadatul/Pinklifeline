## Docker command to start Auth Proxy
```
docker run -d --publish 3306:3306 --mount type=bind,source="$(pwd)"/cloudsql_proxy_key.json,target=/config/sa.json gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.12.0 --address 0.0.0.0 --port 3306 --credentials-file /config/sa.json pinklifeline:asia-south1:pinklifeline-database-instance
```

## List of tasks we did to get started
1. Added storage admin role to 2005077@ugrad.cse.buet.ac.bd
2. Created a storage bucket name pinklifeline-terraform -backend .
3. Added a backend.tf so that terraform sends the state file to the backend.
4. Ran ```terraform init -migrate-state``` to migrate to the bucket.

## How to migrate back to local
1. Delete "backend.tf"
2. Run ```terraform init -migrate-state``` to migrate to the bucket.
3. Remember to delete the bucket in cloud and also to remove storage admin role from user.
