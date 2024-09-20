data "google_client_config" "default" {}

data "google_container_cluster" "pinklifeline_cluster" {
  name     = google_container_cluster.pinklifeline_cluster.name
  location = google_container_cluster.pinklifeline_cluster.location

  depends_on = [google_container_cluster.pinklifeline_cluster]
}

provider "kubernetes" {
  host  = "https://${data.google_container_cluster.pinklifeline_cluster.endpoint}"
  token = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    data.google_container_cluster.pinklifeline_cluster.master_auth[0].cluster_ca_certificate
  )
}

resource "kubernetes_config_map" "pinklifeline-config" {
  metadata {
    name      = "pinklifeline-config"
    namespace = "default"
  }

  data = {
    PINKLIFELINE_REDIS_SERVICE_HOST = google_redis_instance.pinklifeline_redis_instance.host
    # BACKEND_HOST                    = "http://${google_compute_global_address.pinklife_line_ip.address}"
    BACKEND_HOST  = "https://api.pinklifeline.xyz"
    FRONTEND_HOST = "https://www.pinklifeline.xyz"
  }

  depends_on = [google_container_cluster.pinklifeline_cluster]
}

resource "kubernetes_secret" "sm_secret" {
  metadata {
    name      = "sm-secret"
    namespace = "default"
  }

  type = "Opaque"

  data = {
    "sm-sa.json" = base64decode(google_service_account_key.secret_accessor_key.private_key)
  }

  depends_on = [
    google_service_account_key.secret_accessor_key,
    google_container_cluster.pinklifeline_cluster
  ]
}

resource "kubernetes_secret" "cloud_sql_secret" {
  metadata {
    name      = "cloud-sql-secret"
    namespace = "default"
  }

  type = "Opaque"

  data = {
    "service_account.json" = base64decode(google_service_account_key.cloudsql_proxy_key.private_key)
  }

  depends_on = [
    google_service_account_key.cloudsql_proxy_key,
    google_container_cluster.pinklifeline_cluster
  ]
}

resource "kubernetes_manifest" "backend_deployment" {
  manifest = yamldecode(file("${path.module}/k8s/pinklifeline-app-deployment.yaml"))

  depends_on = [
    google_container_cluster.pinklifeline_cluster,
    kubernetes_config_map.pinklifeline-config,
    kubernetes_secret.sm_secret,
    kubernetes_secret.cloud_sql_secret,
    google_sql_database.pinklifeline_database,
    google_sql_user.pinklifeline_database_uesr,
    google_project_service.sqladmin-api,
    google_redis_instance.pinklifeline_redis_instance
  ]
}

# resource "kubernetes_manifest" "backend_config" {
#   manifest = yamldecode(file("${path.module}/k8s/backend-config.yaml"))

#   depends_on = [
#     google_container_cluster.pinklifeline_cluster,
#     kubernetes_manifest.backend_deployment
#   ]
# }

resource "kubernetes_manifest" "backend_service" {
  manifest = yamldecode(file("${path.module}/k8s/pinklifeline-app-service.yaml"))

  depends_on = [
    google_container_cluster.pinklifeline_cluster,
    kubernetes_manifest.backend_deployment
    # kubernetes_manifest.backend_config
  ]
}

# resource "kubernetes_manifest" "ssl-certificate" {
#   manifest = yamldecode(file("${path.module}/k8s/managed-cert.yaml"))

#   depends_on = [
#     google_container_cluster.pinklifeline_cluster,
#     kubernetes_manifest.backend_service
#     # backend_service is dependent on backend_deployment,
#     # backend_deployment is dependent on sm_secret and cloud_sql_secret and pinklifeline-config
#     # configMap is dependent on the static ip.
#     # Thus only backend_service is enough to maintain the dependency chain.
#   ]
# }

# resource "kubernetes_manifest" "ingress" {
#   manifest = yamldecode(file("${path.module}/k8s/ingress.yaml"))

#   depends_on = [
#     google_container_cluster.pinklifeline_cluster,
#     kubernetes_manifest.ssl-certificate
#     # backend_service is dependent on backend_deployment,
#     # backend_deployment is dependent on sm_secret and cloud_sql_secret and pinklifeline-config
#     # configMap is dependent on the static ip.
#     # Thus only backend_service is enough to maintain the dependency chain.
#   ]
# }
