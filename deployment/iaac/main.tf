provider "google" {
  project = "pinklifeline"
  region  = "asia-south1"
  zone    = "asia-south1-c"
}

resource "google_sql_database_instance" "pinklifeline_database_instance" {
  name             = "pinklifeline-database-instance"
  database_version = "MYSQL_8_0"
  settings {
    tier    = "db-f1-micro"
    edition = "ENTERPRISE"
  }
  # deletion_protection = false
}

resource "google_sql_database" "pinklifeline_database" {
  name     = "pinklifeline"
  instance = google_sql_database_instance.pinklifeline_database_instance.name
}

resource "google_sql_user" "pinklifeline_database_uesr" {
  name     = "pinklifeline"
  instance = google_sql_database_instance.pinklifeline_database_instance.name
  password = var.database_user_password
  host     = "%"
}

resource "google_project_service" "sqladmin-api" {
  service = "sqladmin.googleapis.com"

  timeouts {
    create = "30m"
    update = "40m"
  }
}

resource "google_service_account" "cloudsql_proxy_sa" {
  account_id   = "cloud-sql-auth-proxy"
  display_name = "Cloud SQL Auth Proxy service account"
  description  = "Service account for Cloud SQL Auth Proxy"
}

resource "google_project_iam_member" "cloudsql_client_for_proxy" {
  project = "pinklifeline"
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudsql_proxy_sa.email}"
}

resource "google_service_account_key" "cloudsql_proxy_key" {
  service_account_id = google_service_account.cloudsql_proxy_sa.name
}

output "cloudsql_proxy_key" {
  value     = google_service_account_key.cloudsql_proxy_key.private_key
  sensitive = true
}

resource "local_file" "cloudsql_proxy_key_file" {
  content_base64  = google_service_account_key.cloudsql_proxy_key.private_key
  filename        = "${path.module}/cloudsql_proxy_key.json"
  file_permission = "0600"
}

variable "cluster_location" {
  type    = string
  default = "asia-south1-c"
}

resource "google_service_account" "kubernetes_sa" {
  account_id   = "pinklifeline-kubernetese-sa"
  display_name = "Pinklifeline K8s Service Account"
}

resource "google_container_cluster" "pinklifeline_cluster" {
  name               = "pinklifeline-kubernetese-cluster"
  location           = var.cluster_location
  initial_node_count = 2
  node_config {
    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.kubernetes_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

  }

  workload_identity_config {
    workload_pool = "pinklifeline.svc.id.goog"
  }
  timeouts {
    create = "30m"
    update = "40m"
  }

  # deletion_protection = false
}

# STEP 1:

resource "google_compute_global_address" "pinklife_line_ip" {
  name = "pinklifeline-appserver-ip"
}

output "static_ip_address" {
  value       = google_compute_global_address.pinklife_line_ip.address
  description = "The static IP address"
}

resource "google_project_service" "redis_admin_api" {
  service = "redis.googleapis.com"

  timeouts {
    create = "30m"
    update = "40m"
  }
}

resource "google_project_service" "private_service_networking" {
  service = "servicenetworking.googleapis.com"

  timeouts {
    create = "30m"
    update = "40m"
  }
}

# STEP 2:

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = "default"
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = "default"
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# STEP 3:

resource "google_redis_instance" "pinklifeline_redis_instance" {
  name           = "pinklifeline-redis-instance"
  tier           = "STANDARD_HA"
  memory_size_gb = 1

  location_id = "asia-south1-c"

  authorized_network = "default"
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_version = "REDIS_7_0"
  display_name  = "Pinklifeline Redis Cache"
  redis_configs = {
    "notify-keyspace-events" = "Ex"
  }
}

output "redis_host" {
  description = "The IP address of the redis instance."
  value       = google_redis_instance.pinklifeline_redis_instance.host
}

output "redis_port" {
  description = "The port of the redis instance."
  value       = google_redis_instance.pinklifeline_redis_instance.port
}
