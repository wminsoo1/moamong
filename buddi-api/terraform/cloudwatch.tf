locals {
  alert_email = "wminsoo1@naver.com"

  cw_agent_config = jsonencode({
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path        = "/app/app.log"
              log_group_name   = "/moamong/app"
              log_stream_name  = "{instance_id}"
              timezone         = "UTC"
            }
          ]
        }
      }
    }
  })
}

resource "aws_ssm_parameter" "cw_agent_config" {
  name  = "/moamong/cloudwatch-agent-config"
  type  = "String"
  value = local.cw_agent_config
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/moamong/app"
  retention_in_days = 30
}

resource "aws_sns_topic" "alerts" {
  name = "moamong-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = local.alert_email
}

resource "aws_cloudwatch_log_metric_filter" "error" {
  name           = "moamong-error-filter"
  pattern        = "ERROR"
  log_group_name = aws_cloudwatch_log_group.app.name

  metric_transformation {
    name      = "ErrorCount"
    namespace = "Moamong"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "error_alarm" {
  alarm_name          = "moamong-error-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "ErrorCount"
  namespace           = "Moamong"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Spring Boot ERROR 로그 5분 내 1건 이상 감지"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"
}
