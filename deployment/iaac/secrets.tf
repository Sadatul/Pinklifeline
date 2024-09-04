resource "google_secret_manager_secret" "db_password" {
  provider  = google
  secret_id = "db_password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.database_user_password
}

resource "google_secret_manager_secret" "db_username" {
  provider  = google
  secret_id = "db_username"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "db_username_version" {
  secret      = google_secret_manager_secret.db_username.id
  secret_data = var.database_user_username
}

resource "google_secret_manager_secret" "db_url" {
  provider  = google
  secret_id = "db_url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "db_url_version" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = var.database_url
}

resource "google_secret_manager_secret" "admin_username" {
  provider  = google
  secret_id = "admin_username"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "admin_username_version" {
  secret      = google_secret_manager_secret.admin_username.id
  secret_data = var.admin_username
}

resource "google_secret_manager_secret" "admin_password" {
  provider  = google
  secret_id = "admin_password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "admin_password_version" {
  secret      = google_secret_manager_secret.admin_password.id
  secret_data = var.admin_password
}

resource "google_secret_manager_secret" "getstream_api_key" {
  provider  = google
  secret_id = "getstream_api_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "getstream_api_key_version" {
  secret      = google_secret_manager_secret.getstream_api_key.id
  secret_data = var.getstream_api_key
}

resource "google_secret_manager_secret" "getstream_api_secret" {
  provider  = google
  secret_id = "getstream_api_secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "getstream_api_secret_version" {
  secret      = google_secret_manager_secret.getstream_api_secret.id
  secret_data = var.getstream_api_secret
}

resource "google_secret_manager_secret" "sslcommerz_store_id" {
  provider  = google
  secret_id = "sslcommerz_store_id"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "sslcommerz_store_id_version" {
  secret      = google_secret_manager_secret.sslcommerz_store_id.id
  secret_data = var.sslcommerz_store_id
}

resource "google_secret_manager_secret" "sslcommerz_store_passwd" {
  provider  = google
  secret_id = "sslcommerz_store_passwd"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "sslcommerz_store_passwd_version" {
  secret      = google_secret_manager_secret.sslcommerz_store_passwd.id
  secret_data = var.sslcommerz_store_passwd
}

resource "google_secret_manager_secret" "email_password" {
  provider  = google
  secret_id = "email_password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "email_password_version" {
  secret      = google_secret_manager_secret.email_password.id
  secret_data = var.email_password
}

resource "tls_private_key" "rsa_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

data "external" "convert_to_pkcs8" {
  program = ["bash", "-c", <<EOT
    echo "{\"pkcs8_key\": \"$(echo "${tls_private_key.rsa_key.private_key_pem}" | openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt | base64 -w 0)\"}"
  EOT
  ]
}

resource "google_secret_manager_secret" "rsa_public_key" {
  provider  = google
  secret_id = "rsa_public_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "rsa_public_key_version" {
  secret      = google_secret_manager_secret.rsa_public_key.id
  secret_data = tls_private_key.rsa_key.public_key_pem
}

resource "google_secret_manager_secret" "rsa_private_key" {
  provider  = google
  secret_id = "rsa_private_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "rsa_private_key_version" {
  secret      = google_secret_manager_secret.rsa_private_key.id
  secret_data = base64decode(data.external.convert_to_pkcs8.result.pkcs8_key)
}

resource "google_secret_manager_secret" "vapid_public_key" {
  provider  = google
  secret_id = "vapid_public_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "vapid_public_key_version" {
  secret      = google_secret_manager_secret.vapid_public_key.id
  secret_data = var.vapid_public_key
}

resource "google_secret_manager_secret" "vapid_private_key" {
  provider  = google
  secret_id = "vapid_private_key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "vapid_private_key_version" {
  secret      = google_secret_manager_secret.vapid_private_key.id
  secret_data = var.vapid_private_key
}
