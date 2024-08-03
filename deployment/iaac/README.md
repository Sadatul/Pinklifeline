## Docker command to start Auth Proxy
```
docker run -d --publish 3306:3306 --mount type=bind,source="$(pwd)"/cloudsql_proxy_key.json,target=/config/sa.json gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.12.0 --address 0.0.0.0 --port 3306 --credentials-file /config/sa.json pinklifeline:asia-south1:pinklifeline-database-instance
```

## List of tasks we did to get started
1. Added storage admin role to 2005077@ugrad.cse.buet.ac.bd
2. Created a storage bucket name pinklifeline-terraform -backend .
3. Added a backend.tf so that terraform sends the state file to the backend.
4. Ran ```terraform init -migrate-state``` to migrate to the bucket.
5. Ran ```terraform apply``` to create all the necessary resources
6. From the output you can find the 'the static ip', the host and port for redis. also 'cloudsql_proxy_key.json' will be generated.
7. Need to create a secret for the using cloudsql_auth_proxy 
```bash
kubectl create secret generic cloud-sql-secret --from-file=service_account.json=./cloudsql_proxy_key.json
```
8. Replace redis host in the config map
9. A secret.example.yaml is provided. Create a file named secret.yaml using the template of secret.example.yaml and fill the values with appropiate secrets.
10. Now apply pinklifeline-config.yaml and secret.yaml
11. Finally apply pinklifeline-app.yaml
12. Check if pod is running (both containers). If so apply the ingress.yaml
13. Finally your backend will be live at the static_ip we generated in terraform.


## How to migrate back to local
1. Delete "backend.tf"
2. Run ```terraform init -migrate-state``` to migrate to the bucket.
3. Remember to delete the bucket in cloud and also to remove storage admin role from user.