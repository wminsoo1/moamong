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
