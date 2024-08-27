variable "database_user_password" {
  type      = string
  sensitive = true
}

variable "database_user_username" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "admin_username" {
  type      = string
  sensitive = true
}

variable "admin_password" {
  type      = string
  sensitive = true
}

variable "getstream_api_key" {
  type      = string
  sensitive = true
}

variable "getstream_api_secret" {
  type      = string
  sensitive = true
}

variable "sslcommerz_store_id" {
  type      = string
  sensitive = true
}

variable "sslcommerz_store_passwd" {
  type      = string
  sensitive = true
}

variable "email_password" {
  type      = string
  sensitive = true
}
