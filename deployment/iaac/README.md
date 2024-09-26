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
6. From the output you can find the 'the static ip', the host and port for redis. also 'cloudsql_proxy_key.json' and secret_accessor_key.json will be generated.
7. Need to create a secret for the using cloudsql_auth_proxy and accessing secret_manager 
```bash
kubectl create secret generic cloud-sql-secret --from-file=service_account.json=./cloudsql_proxy_key.json
```
```
kubectl create secret generic sm-secret --from-file=sm-sa.json=./secret_accessor_key.json
```
8. Replace redis host in the config map and the backend address based on static ip
9. A secret.example.yaml is provided. Create a file named secret.yaml using the template of secret.example.yaml and fill the values with appropiate secrets.
10. Now apply pinklifeline-config.yaml and secret.yaml
11. Finally apply pinklifeline-app.yaml
12. Check if pod is running (both containers). If so apply the ingress.yaml
13. Finally your backend will be live at the static_ip we generated in terraform.


## How to migrate back to local
1. Delete "backend.tf"
2. Run ```terraform init -migrate-state``` to migrate to the bucket.
3. Remember to delete the bucket in cloud and also to remove storage admin role from user.

## Latest update -> Things to do to get started
1. Create a file based on .env.example with name .env. We will use this file to generate variables for our terraform. After creating .env file, run the following command, it will generate the necessary environment varialbes.
```export $(grep -v '^#' .env | xargs)``` 
To verify -> you can use this command ```env | grep TF_VAR_```
2. Run ```terraform apply -target=google_container_cluster.pinklifeline_cluster```. This will create the kubernets cluster and kubernetes service account. We are creating it first because in the next step, with terraform apply will create deployments in the cluster too.
3. Run ```terraform apply```. This should bring up the infrastructure and also deploy the kubernetes deployment, service and ingress.
4. This is bring up your structure except for ingress and the ssl certificate.
5. first take the static ip and add it your domain record in namecheap.
6. Now first apply managed-cert and then immidiatly apply ingress.yaml. It will take almost 1 hour to provision the certificate. After the certificate is active you can use your domain name with https to connect your backend. ```kubectl get managedcertificate``` use this command to see whether your certificate is active or not
7. There might be some issues while applying in the ops.tf. commentiong out documentation in google_monitoring_alert_policy". "high_traffic_alert_policy" will work. Later you can uncomment it and the give apply the documentation will be applied. Don't know why but this works
## Latest update -> Bring down everything
1. To eliminate everything, you can run ```terraform destroy```, will bring down the entire infrastructure
2. To delete the environment varibles you can use, ```unset "${!TF_VAR_@}"```