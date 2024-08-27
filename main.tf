# main.tf

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_deployment" "ping_pong_api" {
  metadata {
    name      = "ping-pong-api"
    namespace = var.namespace
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "ping-pong-api"
      }
    }

    template {
      metadata {
        labels = {
          app = "ping-pong-api"
        }
      }

      spec {
        container {
          image             = var.image_name
          image_pull_policy = "IfNotPresent"
          name              = "ping-pong-api"

          port {
            container_port = var.container_port
          }

          port {
            container_port = var.healthz_port
          }

          port {
            container_port = var.metrics_port
          }

          liveness_probe {
            http_get {
              path = "/healthz"
              port = var.healthz_port
            }

            initial_delay_seconds = 30
            period_seconds        = 10
            failure_threshold     = 3
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "ping_pong_api" {
  metadata {
    name      = "ping-pong-api"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "ping-pong-api"
    }

    port {
      name        = "http"
      port        = 80
      target_port = var.container_port
      node_port   = var.node_port
    }

    port {
      name        = "healthz"
      port        = var.healthz_port
      target_port = var.healthz_port
    }

    port {
      name        = "metrics"
      port        = var.metrics_port
      target_port = var.metrics_port
    }

    type = "NodePort"
  }
}