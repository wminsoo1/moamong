locals {
  alert_email = "wminsoo1@naver.com"

  cw_agent_config = jsonencode({
    agent = {
      metrics_collection_interval = 60
      run_as_user                 = "cwagent"
    }
    metrics = {
      namespace = "CWAgent"
      append_dimensions = {
        AutoScalingGroupName = "$${aws:AutoScalingGroupName}"
      }
      metrics_collected = {
        mem = {
          measurement                 = ["mem_used_percent"]
          metrics_collection_interval = 60
        }
        disk = {
          measurement                 = ["disk_used_percent"]
          resources                   = ["/"]
          metrics_collection_interval = 60
        }
      }
    }
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path       = "/app/app.log"
              log_group_name  = "/moamong/app"
              log_stream_name = "{instance_id}"
              timezone        = "UTC"
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

resource "aws_iam_role" "lambda_role" {
  name = "moamong-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "moamong-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = "sns:Publish"
        Resource = aws_sns_topic.alerts.arn
      }
    ]
  })
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/error_notifier.py"
  output_path = "${path.module}/lambda/error_notifier.zip"
}

resource "aws_lambda_function" "error_notifier" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "moamong-error-notifier"
  role             = aws_iam_role.lambda_role.arn
  handler          = "error_notifier.lambda_handler"
  runtime          = "python3.12"

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.alerts.arn
    }
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_logs" {
  statement_id  = "AllowCloudWatchLogs"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.error_notifier.function_name
  principal     = "logs.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.app.arn}:*"
}

resource "aws_cloudwatch_log_subscription_filter" "error_filter" {
  name            = "moamong-error-subscription"
  log_group_name  = aws_cloudwatch_log_group.app.name
  filter_pattern  = "ERROR"
  destination_arn = aws_lambda_function.error_notifier.arn

  depends_on = [aws_lambda_permission.allow_cloudwatch_logs]
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

resource "aws_cloudwatch_metric_alarm" "memory_alarm" {
  alarm_name          = "moamong-memory-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 3
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  dimensions = {
    AutoScalingGroupName = "moamong-asg"
  }
  alarm_description  = "메모리 사용률 85% 이상 3분 지속"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"
}

resource "aws_cloudwatch_dashboard" "moamong" {
  dashboard_name = "moamong"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "CPU 사용률 (%)"
          view   = "timeSeries"
          region = var.aws_region
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "moamong-asg", { stat = "Average", period = 60 }]
          ]
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "메모리 사용률 (%)"
          view   = "timeSeries"
          region = var.aws_region
          metrics = [
            ["CWAgent", "mem_used_percent", "AutoScalingGroupName", "moamong-asg", { stat = "Average", period = 60 }]
          ]
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "디스크 사용률 (%)"
          view   = "timeSeries"
          region = var.aws_region
          metrics = [
            [{ expression = "SEARCH('{CWAgent,AutoScalingGroupName,device,fstype,path} AutoScalingGroupName=\"moamong-asg\" MetricName=\"disk_used_percent\"', 'Average', 60)", id = "d1", label = "디스크 (/)" }]
          ]
          yAxis = { left = { min = 0, max = 100 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "네트워크 트래픽 (bytes)"
          view   = "timeSeries"
          region = var.aws_region
          metrics = [
            ["AWS/EC2", "NetworkIn", "AutoScalingGroupName", "moamong-asg", { stat = "Sum", period = 60, label = "수신" }],
            ["AWS/EC2", "NetworkOut", "AutoScalingGroupName", "moamong-asg", { stat = "Sum", period = 60, label = "송신" }]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 24
        height = 6
        properties = {
          title  = "애플리케이션 에러"
          view   = "timeSeries"
          region = var.aws_region
          metrics = [
            ["Moamong", "ErrorCount", { stat = "Sum", period = 300, color = "#d62728", label = "에러 수" }]
          ]
        }
      }
    ]
  })
}
