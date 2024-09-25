resource "google_monitoring_notification_channel" "email_notification_channel" {
  display_name = "Pinklifeline notification channel"
  type         = "email"
  labels = {
    email_address = "sadatulislamsadi@gmail.com"
  }
  force_delete = false
}

resource "google_monitoring_alert_policy" "high_traffic_alert_policy" {
  display_name = "pinklifline-high-traffic-alert"
  documentation {
    subject = "Unusual High Traffic on backend"
  }
  
  user_labels = {
    app = "pinklifeline"
  }
  conditions {
    display_name = "Global External Application Load Balancer Rule - Request count [SUM]"
    condition_threshold {
      aggregations {
        alignment_period = "60s"
        cross_series_reducer = "REDUCE_SUM"
        per_series_aligner = "ALIGN_SUM"
      }
      comparison = "COMPARISON_GT"
      duration   = "0s"
      filter     = "resource.type = \"https_lb_rule\" AND metric.type = \"loadbalancing.googleapis.com/https/request_count\""
      threshold_value = 60000
      trigger {
        count = 1
      }
    }
  }
  alert_strategy {
    
  }
  combiner     = "OR"
  enabled = true
  notification_channels = [
    google_monitoring_notification_channel.email_notification_channel.name
  ]
  severity = "WARNING"
}

resource "google_monitoring_dashboard" "dashboard" {
  dashboard_json = jsonencode({
  "displayName": "Pinklifeline",
  "dashboardFilters": [],
  "mosaicLayout": {
    "columns": 48,
    "tiles": [
      {
        "width": 24,
        "height": 16,
        "widget": {
          "alertChart": {
            "name": google_monitoring_alert_policy.high_traffic_alert_policy.name
          }
        }
      },
      {
        "xPos": 24,
        "width": 24,
        "height": 16,
        "widget": {
          "title": "Backend latency [50TH PERCENTILE]",
          "xyChart": {
            "chartOptions": {
              "mode": "COLOR"
            },
            "dataSets": [
              {
                "breakdowns": [],
                "dimensions": [],
                "measures": [],
                "minAlignmentPeriod": "60s",
                "plotType": "STACKED_BAR",
                "targetAxis": "Y1",
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "crossSeriesReducer": "REDUCE_PERCENTILE_50",
                      "groupByFields": [],
                      "perSeriesAligner": "ALIGN_DELTA"
                    },
                    "filter": "metric.type=\"loadbalancing.googleapis.com/https/backend_latencies\" resource.type=\"https_lb_rule\""
                  }
                }
              }
            ],
            "thresholds": [],
            "yAxis": {
              "label": "",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "xPos": 12,
        "yPos": 16,
        "width": 24,
        "height": 16,
        "widget": {
          "title": "Global External Application Load Balancer Rule - Request count for 400 [SUM]",
          "xyChart": {
            "chartOptions": {
              "mode": "COLOR"
            },
            "dataSets": [
              {
                "breakdowns": [],
                "dimensions": [],
                "measures": [],
                "minAlignmentPeriod": "60s",
                "plotType": "LINE",
                "targetAxis": "Y1",
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": [],
                      "perSeriesAligner": "ALIGN_RATE"
                    },
                    "filter": "metric.type=\"loadbalancing.googleapis.com/https/request_count\" resource.type=\"https_lb_rule\" metric.label.\"response_code_class\"=\"400\""
                  }
                }
              }
            ],
            "thresholds": [],
            "yAxis": {
              "label": "",
              "scale": "LINEAR"
            }
          }
        }
      }
    ]
  },
  "labels": {}
}
  )
}

# resource "google_monitoring_dashboard" "dashboard" {
#   dashboard_json = <<EOF
# {
#   "displayName": "Pinklifeline",
#   "dashboardFilters": [],
#   "mosaicLayout": {
#     "columns": 48,
#     "tiles": [
#       {
#         "width": 24,
#         "height": 16,
#         "widget": {
#           "title": "Global External Application Load Balancer Rule - Request count [SUM]",
#           "xyChart": {
#             "chartOptions": {
#               "mode": "COLOR"
#             },
#             "dataSets": [
#               {
#                 "breakdowns": [],
#                 "dimensions": [],
#                 "measures": [],
#                 "minAlignmentPeriod": "60s",
#                 "plotType": "LINE",
#                 "targetAxis": "Y1",
#                 "timeSeriesQuery": {
#                   "timeSeriesFilter": {
#                     "aggregation": {
#                       "alignmentPeriod": "60s",
#                       "crossSeriesReducer": "REDUCE_SUM",
#                       "groupByFields": [],
#                       "perSeriesAligner": "ALIGN_RATE"
#                     },
#                     "filter": "metric.type=\"loadbalancing.googleapis.com/https/request_count\" resource.type=\"https_lb_rule\""
#                   }
#                 }
#               }
#             ],
#             "thresholds": [],
#             "yAxis": {
#               "label": "",
#               "scale": "LINEAR"
#             }
#           }
#         }
#       },
#       {
#         "xPos": 24,
#         "width": 24,
#         "height": 16,
#         "widget": {
#           "title": "Backend latency [50TH PERCENTILE]",
#           "xyChart": {
#             "chartOptions": {
#               "mode": "COLOR"
#             },
#             "dataSets": [
#               {
#                 "breakdowns": [],
#                 "dimensions": [],
#                 "measures": [],
#                 "minAlignmentPeriod": "60s",
#                 "plotType": "STACKED_BAR",
#                 "targetAxis": "Y1",
#                 "timeSeriesQuery": {
#                   "timeSeriesFilter": {
#                     "aggregation": {
#                       "alignmentPeriod": "60s",
#                       "crossSeriesReducer": "REDUCE_PERCENTILE_50",
#                       "groupByFields": [],
#                       "perSeriesAligner": "ALIGN_DELTA"
#                     },
#                     "filter": "metric.type=\"loadbalancing.googleapis.com/https/backend_latencies\" resource.type=\"https_lb_rule\""
#                   }
#                 }
#               }
#             ],
#             "thresholds": [],
#             "yAxis": {
#               "label": "",
#               "scale": "LINEAR"
#             }
#           }
#         }
#       },
#       {
#         "xPos": 12,
#         "yPos": 16,
#         "width": 24,
#         "height": 16,
#         "widget": {
#           "title": "Global External Application Load Balancer Rule - Request count for 400 [SUM]",
#           "xyChart": {
#             "chartOptions": {
#               "mode": "COLOR"
#             },
#             "dataSets": [
#               {
#                 "breakdowns": [],
#                 "dimensions": [],
#                 "measures": [],
#                 "minAlignmentPeriod": "60s",
#                 "plotType": "LINE",
#                 "targetAxis": "Y1",
#                 "timeSeriesQuery": {
#                   "timeSeriesFilter": {
#                     "aggregation": {
#                       "alignmentPeriod": "60s",
#                       "crossSeriesReducer": "REDUCE_SUM",
#                       "groupByFields": [],
#                       "perSeriesAligner": "ALIGN_RATE"
#                     },
#                     "filter": "metric.type=\"loadbalancing.googleapis.com/https/request_count\" resource.type=\"https_lb_rule\" metric.label.\"response_code_class\"=\"400\""
#                   }
#                 }
#               }
#             ],
#             "thresholds": [],
#             "yAxis": {
#               "label": "",
#               "scale": "LINEAR"
#             }
#           }
#         }
#       }
#     ]
#   },
#   "labels": {}
# }

# EOF
# }