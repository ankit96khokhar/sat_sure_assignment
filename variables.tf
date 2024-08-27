# variables.tf

variable "namespace" {
  type        = string
  default     = "default"
  description = "Namespace for the deployment"
}

variable "replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the deployment"
}

variable "image_name" {
  type        = string
  default     = "ping-pong-api:latest"
  description = "Docker image name for the deployment"
}

variable "container_port" {
  type        = number
  default     = 8080
  description = "Container port for the deployment"
}

variable "healthz_port" {
  type        = number
  default     = 8081
  description = "Healthz port for the deployment"
}

variable "metrics_port" {
  type        = number
  default     = 8082
  description = "Metrics port for the deployment"
}

variable "node_port" {
  type        = number
  default     = 30080
  description = "Node port for the service"
}